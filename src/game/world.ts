/** World layout constants — all positions in world-space pixels. */

export const WORLD_W = 7200;
export const GROUND_H = 112;
export const SPAWN_X = 360;
export const CHAR_SCALE = 4; // 12x16 grid -> 48x64 px
export const ZONE_RADIUS = 170;

export interface Zone {
  id: "about" | "skills" | "projects" | "history" | "contact";
  x: number;
  label: string;
  sub: string;
  color: string;
}

export const ZONES: Zone[] = [
  { id: "about", x: 1050, label: "ABOUT", sub: "Player Profile", color: "#4cc9f0" },
  { id: "skills", x: 2400, label: "SKILLS", sub: "Inventory", color: "#80ed99" },
  { id: "projects", x: 3750, label: "PROJECTS", sub: "Quest Board", color: "#f72585" },
  { id: "history", x: 5100, label: "HISTORY", sub: "Adventure Log", color: "#ffd166" },
  { id: "contact", x: 6450, label: "CONTACT", sub: "Send a Raven", color: "#c77dff" },
];

export interface Decor {
  type: "bush" | "rock" | "torch" | "flowers" | "grass";
  x: number;
}

/** Scatter decoration between zones (deterministic, no Math.random at render). */
export const DECOR: Decor[] = [
  { type: "grass", x: 250 },
  { type: "bush", x: 540 },
  { type: "torch", x: 880 },
  { type: "rock", x: 1320 },
  { type: "flowers", x: 1560 },
  { type: "bush", x: 1780 },
  { type: "grass", x: 1980 },
  { type: "torch", x: 2230 },
  { type: "rock", x: 2680 },
  { type: "flowers", x: 2920 },
  { type: "bush", x: 3140 },
  { type: "grass", x: 3340 },
  { type: "torch", x: 3580 },
  { type: "rock", x: 4020 },
  { type: "bush", x: 4280 },
  { type: "flowers", x: 4500 },
  { type: "grass", x: 4720 },
  { type: "torch", x: 4930 },
  { type: "rock", x: 5380 },
  { type: "flowers", x: 5620 },
  { type: "bush", x: 5840 },
  { type: "grass", x: 6060 },
  { type: "torch", x: 6280 },
  { type: "bush", x: 6760 },
  { type: "rock", x: 6950 },
];
