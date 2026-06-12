import type { Zone } from "../game/world";

/**
 * Pixel-style landmark per zone, drawn as crisp SVG rects.
 * Each ~ 220px wide, anchored to the ground line.
 */
export function ZoneProp({ zone }: { zone: Zone }) {
  switch (zone.id) {
    case "about":
      return (
        <svg className="zone-svg" width="230" height="190" viewBox="0 0 115 95" shapeRendering="crispEdges" aria-hidden="true">
          {/* Tent */}
          <rect x="8" y="38" width="54" height="6" fill="#1d3557" />
          <rect x="12" y="44" width="46" height="44" fill="#2a4a7f" />
          <rect x="16" y="32" width="38" height="6" fill="#1d3557" />
          <rect x="22" y="26" width="26" height="6" fill="#1d3557" />
          <rect x="30" y="20" width="10" height="6" fill="#4cc9f0" />
          <rect x="28" y="58" width="14" height="30" fill="#0b1224" />
          <rect x="31" y="62" width="3" height="3" fill="#4cc9f0" />
          {/* Flag pole */}
          <rect x="70" y="18" width="4" height="70" fill="#6b4f2a" />
          <rect x="74" y="18" width="22" height="12" fill="#4cc9f0" />
          <rect x="74" y="22" width="22" height="3" fill="#90e0ff" />
          {/* Campfire */}
          <rect x="86" y="80" width="20" height="5" fill="#5e503f" />
          <rect x="90" y="72" width="4" height="8" fill="#ff9f1c" className="zone-flame" />
          <rect x="96" y="68" width="5" height="12" fill="#ffbf69" className="zone-flame zone-flame--slow" />
          <rect x="94" y="76" width="4" height="5" fill="#e63946" />
        </svg>
      );
    case "skills":
      return (
        <svg className="zone-svg" width="230" height="200" viewBox="0 0 115 100" shapeRendering="crispEdges" aria-hidden="true">
          {/* Forge building */}
          <rect x="10" y="34" width="66" height="58" fill="#283618" />
          <rect x="6" y="28" width="74" height="8" fill="#1a2410" />
          <rect x="14" y="18" width="58" height="10" fill="#283618" />
          <rect x="22" y="10" width="12" height="8" fill="#1a2410" />
          <rect x="24" y="2" width="8" height="8" fill="#403d39" />
          <rect x="24" y="0" width="8" height="4" fill="#80ed99" opacity="0.7" className="zone-flame" />
          {/* Furnace mouth */}
          <rect x="22" y="56" width="22" height="36" fill="#0d1321" />
          <rect x="26" y="64" width="14" height="28" fill="#ff6d00" className="zone-flame--slow zone-flame" />
          <rect x="30" y="72" width="6" height="20" fill="#ffd166" />
          {/* Window */}
          <rect x="54" y="46" width="14" height="12" fill="#80ed99" opacity="0.85" />
          <rect x="60" y="46" width="2" height="12" fill="#283618" />
          {/* Anvil */}
          <rect x="86" y="74" width="22" height="6" fill="#495057" />
          <rect x="92" y="80" width="10" height="6" fill="#343a40" />
          <rect x="88" y="86" width="18" height="6" fill="#212529" />
          {/* Sword in stone */}
          <rect x="100" y="50" width="4" height="22" fill="#adb5bd" />
          <rect x="96" y="56" width="12" height="4" fill="#6c757d" />
          <rect x="101" y="44" width="2" height="6" fill="#dee2e6" />
        </svg>
      );
    case "projects":
      return (
        <svg className="zone-svg" width="250" height="210" viewBox="0 0 125 105" shapeRendering="crispEdges" aria-hidden="true">
          {/* Workshop */}
          <rect x="8" y="40" width="84" height="56" fill="#3d2645" />
          <rect x="4" y="32" width="92" height="10" fill="#2a1b30" />
          <rect x="14" y="22" width="72" height="10" fill="#3d2645" />
          {/* Door */}
          <rect x="40" y="64" width="20" height="32" fill="#1a0f1f" />
          <rect x="44" y="70" width="12" height="10" fill="#f72585" opacity="0.8" />
          {/* Windows */}
          <rect x="16" y="48" width="14" height="12" fill="#f72585" opacity="0.85" />
          <rect x="70" y="48" width="14" height="12" fill="#f72585" opacity="0.55" />
          {/* Gear sign */}
          <rect x="98" y="36" width="4" height="60" fill="#6b4f2a" />
          <rect x="88" y="16" width="24" height="24" fill="#2a1b30" />
          <rect x="92" y="20" width="16" height="16" fill="#f72585" />
          <rect x="96" y="24" width="8" height="8" fill="#2a1b30" />
          <rect x="98" y="12" width="4" height="6" fill="#f72585" />
          <rect x="98" y="38" width="4" height="6" fill="#f72585" />
          <rect x="84" y="26" width="6" height="4" fill="#f72585" />
          <rect x="110" y="26" width="6" height="4" fill="#f72585" />
          {/* Chimney + smoke */}
          <rect x="24" y="10" width="10" height="14" fill="#2a1b30" />
          <rect x="26" y="2" width="6" height="6" fill="#9d8189" opacity="0.5" className="zone-smoke" />
        </svg>
      );
    case "history":
      return (
        <svg className="zone-svg" width="220" height="230" viewBox="0 0 110 115" shapeRendering="crispEdges" aria-hidden="true">
          {/* Tower */}
          <rect x="26" y="28" width="56" height="80" fill="#4a4e69" />
          <rect x="22" y="22" width="64" height="8" fill="#22223b" />
          {/* Battlements */}
          <rect x="22" y="12" width="10" height="10" fill="#4a4e69" />
          <rect x="40" y="12" width="10" height="10" fill="#4a4e69" />
          <rect x="58" y="12" width="10" height="10" fill="#4a4e69" />
          <rect x="76" y="12" width="10" height="10" fill="#4a4e69" />
          {/* Door + windows */}
          <rect x="44" y="78" width="20" height="30" fill="#14141f" />
          <rect x="48" y="84" width="12" height="8" fill="#ffd166" opacity="0.75" />
          <rect x="34" y="40" width="10" height="14" fill="#ffd166" opacity="0.85" />
          <rect x="64" y="40" width="10" height="14" fill="#ffd166" opacity="0.6" />
          <rect x="49" y="58" width="10" height="14" fill="#ffd166" opacity="0.7" />
          {/* Banner */}
          <rect x="50" y="0" width="4" height="14" fill="#6b4f2a" />
          <rect x="54" y="0" width="18" height="10" fill="#ffd166" />
          <rect x="54" y="3" width="18" height="2" fill="#ffeebc" />
          {/* Clock */}
          <rect x="46" y="28" width="16" height="3" fill="#ffd166" opacity="0.4" />
        </svg>
      );
    case "contact":
      return (
        <svg className="zone-svg" width="210" height="225" viewBox="0 0 105 112" shapeRendering="crispEdges" aria-hidden="true">
          {/* Mail tower */}
          <rect x="30" y="40" width="44" height="66" fill="#3c096c" />
          <rect x="26" y="34" width="52" height="8" fill="#240046" />
          {/* Envelope sign */}
          <rect x="36" y="48" width="32" height="22" fill="#c77dff" />
          <rect x="38" y="50" width="28" height="18" fill="#10002b" />
          <rect x="40" y="52" width="24" height="3" fill="#c77dff" />
          <rect x="48" y="55" width="8" height="3" fill="#c77dff" />
          {/* Door */}
          <rect x="44" y="82" width="16" height="24" fill="#10002b" />
          <rect x="47" y="88" width="3" height="3" fill="#c77dff" />
          {/* Antenna */}
          <rect x="50" y="10" width="4" height="24" fill="#5a189a" />
          <rect x="46" y="14" width="12" height="4" fill="#5a189a" />
          <rect x="49" y="4" width="6" height="6" fill="#e0aaff" className="zone-beacon" />
          {/* Mailbox */}
          <rect x="84" y="78" width="4" height="28" fill="#6b4f2a" />
          <rect x="78" y="66" width="18" height="14" fill="#c77dff" />
          <rect x="80" y="70" width="14" height="2" fill="#10002b" />
          {/* Letters fluttering */}
          <rect x="10" y="58" width="8" height="6" fill="#fff" opacity="0.85" className="zone-letter" />
          <rect x="16" y="38" width="7" height="5" fill="#fff" opacity="0.6" className="zone-letter zone-letter--b" />
        </svg>
      );
  }
}
