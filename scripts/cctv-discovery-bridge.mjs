#!/usr/bin/env node
/**
 * Samzy HMS ONVIF discovery bridge.
 * Run this process on a computer physically connected to the hospital camera LAN.
 * It discovers ONVIF devices and tests TCP reachability only; it does not store
 * credentials, request RTSP streams, or display/record video.
 */
import dgram from "node:dgram";
import http from "node:http";
import net from "node:net";
import dns from "node:dns/promises";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

const TOKEN = process.env.CCTV_DISCOVERY_BRIDGE_TOKEN ?? "";
const HOST = process.env.CCTV_BRIDGE_HOST ?? "127.0.0.1";
const PORT = Number(process.env.CCTV_BRIDGE_PORT ?? "8787");
const DISCOVERY_MS = Math.min(Math.max(Number(process.env.CCTV_DISCOVERY_TIMEOUT_MS ?? "4500"), 1000), 10000);
const MULTICAST = "239.255.255.250";
const MULTICAST_PORT = 3702;
const discovered = new Map();

if (TOKEN.length < 24) {
  console.error("CCTV_DISCOVERY_BRIDGE_TOKEN must contain at least 24 characters.");
  process.exit(1);
}
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("CCTV_BRIDGE_PORT must be a valid TCP port.");
  process.exit(1);
}

const tagText = (xml, tag) => {
  const match = xml.match(new RegExp("<(?:[\\w.-]+:)?"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w.-]+:)?"+tag+"\\s*>", "i"));
  return match?.[1]?.replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim() ?? "";
};
function extractScopes(xml) {
  const raw = tagText(xml, "Scopes");
  return raw.split(/\\s+/).filter(Boolean).map((scope) => {
    try { return decodeURIComponent(scope); } catch { return scope; }
  });
}
function privateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const p = address.split(".").map(Number);
    return p[0] === 10 || p[0] === 127 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) || (p[0] === 169 && p[1] === 254);
  }
  if (family === 6) {
    const value = address.toLowerCase();
    return value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
  }
  return false;
}
function authorised(request) {
  const header = request.headers.authorization ?? "";
  const expected = Buffer.from("Bearer " + TOKEN);
  const supplied = Buffer.from(header);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8192) { reject(new Error("Request body too large.")); request.destroy(); }
    });
    request.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Invalid JSON body.")); }
    });
    request.on("error", reject);
  });
}
function probeXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<e:Envelope xmlns:e="http://www.w3.org/2003/05/soap-envelope" xmlns:w="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery" xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
<e:Header><w:MessageID>urn:uuid:${randomUUID()}</w:MessageID><w:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</w:To><w:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</w:Action></e:Header>
<e:Body><d:Probe><d:Types>dn:NetworkVideoTransmitter</d:Types></d:Probe></e:Body></e:Envelope>`;
}
async function discover() {
  discovered.clear();
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  const results = new Map();
  const response = new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve([...results.values()]), DISCOVERY_MS);
    socket.on("error", (error) => { clearTimeout(timer); reject(error); });
    socket.on("message", (message) => {
      const xml = message.toString("utf8");
      const xaddrs = tagText(xml, "XAddrs").split(/\\s+/).filter(Boolean);
      const scopes = extractScopes(xml);
      for (const xaddr of xaddrs) {
        try {
          const endpoint = new URL(xaddr);
          if (!["http:", "https:"].includes(endpoint.protocol)) continue;
          const host = endpoint.hostname.replace(/^\\[|\\]$/g, "");
          const nameScope = scopes.find((scope) => /\\/name\\//i.test(scope));
          const hardwareScope = scopes.find((scope) => /\\/hardware\\//i.test(scope));
          const manufacturerScope = scopes.find((scope) => /\\/hardware\\//i.test(scope));
          const id = createHash("sha256").update(endpoint.origin + endpoint.pathname).digest("hex").slice(0, 24);
          results.set(id, {
            id,
            name: nameScope?.split("/").pop() || "ONVIF camera " + host,
            host,
            manufacturer: manufacturerScope?.split("/").pop(),
            model: hardwareScope?.split("/").pop(),
            protocol: "ONVIF",
            xaddr,
          });
        } catch { /* Ignore malformed discovery responses. */ }
      }
    });
    socket.bind(0, () => {
      try {
        socket.setBroadcast(true);
        socket.setMulticastTTL(1);
        socket.send(Buffer.from(probeXml()), MULTICAST_PORT, MULTICAST, (error) => {
          if (error) { clearTimeout(timer); reject(error); }
        });
      } catch (error) { clearTimeout(timer); reject(error); }
    });
  });
  try {
    const cameras = await response;
    for (const camera of cameras) discovered.set(camera.id, camera);
    return cameras.map(({ xaddr, ...camera }) => camera);
  } finally {
    try { socket.close(); } catch {}
  }
}
async function tcpReachable(camera) {
  const endpoint = new URL(camera.xaddr);
  const host = endpoint.hostname.replace(/^\\[|\\]$/g, "");
  const port = Number(endpoint.port || (endpoint.protocol === "https:" ? 443 : 80));
  const resolved = await dns.lookup(host, { all: true });
  if (!resolved.length || resolved.some((item) => !privateAddress(item.address))) {
    throw new Error("Camera endpoint did not resolve exclusively to a private/local IP address.");
  }
  const address = resolved[0].address;
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: address, port, timeout: 4000 });
    socket.once("connect", () => { socket.end(); resolve(true); });
    socket.once("timeout", () => { socket.destroy(); reject(new Error("Camera TCP connection timed out.")); });
    socket.once("error", (error) => reject(new Error("Camera TCP connection failed: " + error.message)));
  });
}

const server = http.createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "POST") { response.writeHead(405).end(JSON.stringify({ error: "POST required." })); return; }
  if (!authorised(request)) { response.writeHead(401).end(JSON.stringify({ error: "Unauthorised." })); return; }
  try {
    if (request.url === "/discover") {
      await readBody(request);
      const cameras = await discover();
      response.writeHead(200).end(JSON.stringify({ cameras, message: `ONVIF discovery returned ${cameras.length} device(s).` }));
      return;
    }
    if (request.url === "/connect") {
      const body = await readBody(request);
      if (typeof body.cameraId !== "string" || !discovered.has(body.cameraId)) {
        response.writeHead(404).end(JSON.stringify({ connected: false, message: "Camera was not found in the latest discovery results. Scan again." }));
        return;
      }
      const camera = discovered.get(body.cameraId);
      await tcpReachable(camera);
      response.writeHead(200).end(JSON.stringify({ connected: true, message: "ONVIF endpoint TCP reachability confirmed. Camera authentication and live video are not yet configured." }));
      return;
    }
    response.writeHead(404).end(JSON.stringify({ error: "Unknown bridge endpoint." }));
  } catch (error) {
    response.writeHead(502).end(JSON.stringify({ error: error instanceof Error ? error.message : "Bridge operation failed." }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Samzy CCTV discovery bridge listening on http://${HOST}:${PORT}`);
  console.log("Discovery uses ONVIF WS-Discovery UDP multicast on 239.255.255.250:3702.");
  console.log("This bridge checks discovery and TCP reachability only; it does not expose or record video.");
});
