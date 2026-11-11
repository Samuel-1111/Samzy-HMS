# Samzy HMS — local CCTV discovery bridge

This bridge is an **on-premises helper**. It must run on a computer that is connected to the hospital's authorised CCTV/VLAN network. Vercel cannot send ONVIF WS-Discovery multicast packets directly into a private LAN.

## What it does

- Sends an ONVIF WS-Discovery probe to UDP multicast `239.255.255.250:3702`.
- Returns compatible ONVIF devices and their advertised device-service endpoints.
- Lets the Admin portal test TCP reachability to a discovered camera endpoint.
- Restricts connection checks to addresses that resolve to private/local IP ranges.
- Requires a bearer token and binds to loopback by default.

## What it does not do

- It does not store camera usernames or passwords.
- It does not authenticate to a camera's ONVIF account.
- It does not retrieve RTSP URLs, display video, record video, or provide a live stream.
- It does not bypass camera/NVR access controls.
- A successful TCP reachability test is **not** proof that video is working.

A live video feed needs a separate, approved NVR/VMS integration and a secured streaming gateway. CCTV access should be restricted to authorised roles, logged, and reviewed against hospital privacy policy and applicable Nigerian data-protection requirements.

## Run it on the authorised local network

Use Node.js 22 or newer. From the repository root:

```bash
export CCTV_DISCOVERY_BRIDGE_TOKEN="$(openssl rand -hex 32)"
export CCTV_BRIDGE_HOST="127.0.0.1"
export CCTV_BRIDGE_PORT="8787"
node scripts/cctv-discovery-bridge.mjs
```

Keep the token in a secure secret store. Do not commit it, put it in browser code, or share it in screenshots/chat.

Allow the bridge host to send and receive ONVIF WS-Discovery traffic on UDP port 3702 on the approved camera VLAN. Network segmentation/firewall rules should permit only the camera subnet required by the hospital.

## Connect Vercel to the local bridge

A private `127.0.0.1` bridge cannot be reached directly from Vercel. Use a hospital-approved private tunnel or secure reverse proxy (for example, a Cloudflare Tunnel managed by the hospital IT team) that forwards to `http://127.0.0.1:8787`. Do not expose the bridge port directly to the public internet.

Set these server-only Vercel environment variables:

- `CCTV_DISCOVERY_BRIDGE_URL`: the HTTPS URL provided by the approved tunnel, without a trailing path.
- `CCTV_DISCOVERY_BRIDGE_TOKEN`: the same high-entropy token used by the local bridge.

Redeploy Vercel after changing the variables. Then use Admin → CCTV Monitoring → Start Camera Discovery.

## API contract

- `POST /discover` with `Authorization: Bearer <token>` returns `{ cameras: [...] }`.
- `POST /connect` with the same header and `{ "cameraId": "..." }` checks the selected device's TCP endpoint. Camera IDs are accepted only if they were returned by the latest discovery run.

If discovery returns no cameras, check that ONVIF is enabled on the camera/NVR, the bridge host is on the correct VLAN, UDP 3702 is permitted, and the device supports WS-Discovery. Some NVRs require discovery through the vendor's SDK/API instead.
