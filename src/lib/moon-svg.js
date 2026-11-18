// วาดดวงจันทร์ตามข้างจริง (มุม 0 = จันทร์ดับ, 180 = เต็มดวง) เป็น SVG น่ารัก ๆ
let uid = 0;
export function moonSvg(angle, className = 'moon-svg') {
  const id = `m${++uid}`;
  const r = 46;
  const a = ((angle % 360) + 360) % 360;
  const rx = Math.abs(Math.cos((a * Math.PI) / 180)) * r;
  const waxing = a < 180;
  let lit;
  if (waxing) {
    const sweep = a < 90 ? 0 : 1;
    lit = `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx.toFixed(2)},${r} 0 0 ${sweep} 0,${-r} Z`;
  } else {
    const sweep = a < 270 ? 0 : 1;
    lit = `M0,${-r} A${r},${r} 0 0 0 0,${r} A${rx.toFixed(2)},${r} 0 0 ${sweep} 0,${-r} Z`;
  }
  return `
  <svg class="${className}" viewBox="-60 -60 120 120" aria-hidden="true">
    <defs>
      <radialGradient id="${id}g" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#fffbea"/>
        <stop offset="60%" stop-color="#ffe9b5"/>
        <stop offset="100%" stop-color="#ffd08a"/>
      </radialGradient>
      <clipPath id="${id}c"><path d="${lit}"/></clipPath>
    </defs>
    <circle r="${r}" fill="rgba(60,40,130,.55)" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
    <path d="${lit}" fill="url(#${id}g)"/>
    <g clip-path="url(#${id}c)" fill="#f5cf8e" opacity=".55">
      <circle cx="-14" cy="-12" r="7"/><circle cx="12" cy="10" r="9"/><circle cx="-6" cy="20" r="4.5"/><circle cx="20" cy="-18" r="4"/>
    </g>
    <circle r="${r}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1"/>
  </svg>`;
}
