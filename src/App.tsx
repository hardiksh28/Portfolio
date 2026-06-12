import { useState, type CSSProperties } from "react";
import TitleScreen from "./screens/TitleScreen";
import CharacterSelect from "./screens/CharacterSelect";
import GameWorld from "./screens/GameWorld";
import type { CharacterDef } from "./game/sprites";

type Phase = "title" | "select" | "world";

export default function App() {
  const [phase, setPhase] = useState<Phase>("title");
  const [character, setCharacter] = useState<CharacterDef | null>(null);

  return (
    <div
      className="app-root"
      style={character ? ({ "--player-accent": character.accent } as CSSProperties) : undefined}
    >
      {phase === "title" && <TitleScreen onStart={() => setPhase("select")} />}
      {phase === "select" && (
        <CharacterSelect
          onSelect={(c) => {
            setCharacter(c);
            setPhase("world");
          }}
        />
      )}
      {phase === "world" && character && <GameWorld character={character} />}

      {/* Retro CRT atmosphere — pure decoration, pointer-events: none */}
      <div className="fx-scanlines" aria-hidden="true" />
      <div className="fx-vignette" aria-hidden="true" />
    </div>
  );
}
