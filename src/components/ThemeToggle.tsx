"use client";
import { useEffect, useState } from "react";
export function ThemeToggle() {
 const [theme,setTheme]=useState<"light"|"dark">("light");
 useEffect(()=>{const saved=window.localStorage.getItem("samzy-hms-theme");const value=saved==="dark"?"dark":"light";setTheme(value);document.documentElement.dataset.theme=value;},[]);
 function toggle(){const next=theme==="light"?"dark":"light";setTheme(next);document.documentElement.dataset.theme=next;window.localStorage.setItem("samzy-hms-theme",next);}
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label={"Switch to "+(theme==="light"?"dark":"light")+" mode"}><span>{theme==="light"?"☾":"☀"}</span><span>{theme==="light"?"Dark mode":"Light mode"}</span></button>;
}