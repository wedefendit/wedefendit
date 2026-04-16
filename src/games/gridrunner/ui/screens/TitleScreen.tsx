"use client";

/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { useState, type FormEvent } from "react";

type TitleScreenProps = Readonly<{
  hasSave: boolean;
  onNewGame: (name: string) => void;
  onContinue: () => void;
}>;

export function TitleScreen({
  hasSave,
  onNewGame,
  onContinue,
}: TitleScreenProps) {
  const [name, setName] = useState("");

  function handleNewGame(e: FormEvent) {
    e.preventDefault();
    onNewGame(name.trim());
  }

  return (
    <section
      data-testid="gr-title-screen"
      aria-label="GRIDRUNNER title"
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0a0e1a] px-6"
    >
      {/* Tron perspective grid — magenta, fades into horizon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ perspective: "400px" }}
      >
        <div
          className="absolute bottom-0 left-[-50%] right-[-50%]"
          style={{
            height: "48%",
            transformOrigin: "bottom center",
            transform: "rotateX(60deg)",
            backgroundImage: [
              "linear-gradient(to right, rgba(255,0,222,0.25) 1px, transparent 1px)",
              "linear-gradient(to bottom, rgba(255,0,222,0.25) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "48px 48px",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,1) 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,1) 100%)",
          }}
        />
        {/* Horizon glow line -- removed, now in content flow */}
      </div>

      {/* Title content — positioned above center */}
      <div
        className="relative z-10 flex flex-col items-center gap-8"
        style={{ marginTop: "-10%" }}
      >
        <header className="flex flex-col items-center gap-3">
          <h1
            data-testid="gr-title"
            className="gr-font-display text-center text-3xl font-black tracking-[0.2em] text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.4)] sm:text-5xl"
          >
            GRIDRUNNER
          </h1>
          {/* Horizon glow line — stays under GRIDRUNNER always */}
          <div
            aria-hidden="true"
            className="w-[120%] max-w-lg"
            style={{
              height: "2px",
              background:
                "linear-gradient(to right, transparent, rgba(255,0,222,0.5), rgba(255,0,222,0.8), rgba(255,0,222,0.5), transparent)",
              boxShadow:
                "0 0 20px rgba(255,0,222,0.4), 0 0 60px rgba(255,0,222,0.15)",
            }}
          />
          <p className="gr-font-mono text-center text-xs tracking-widest text-[#00f0ff]/50 sm:text-sm">
            DEFEND THE GRID
          </p>
        </header>

        <div className="gr-font-mono flex w-full max-w-xs flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="gr-name-input"
              className="text-xs uppercase tracking-wider text-[#00f0ff]/60"
            >
              Operator name
            </label>
            <input
              id="gr-name-input"
              data-testid="gr-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="OPERATOR"
              maxLength={16}
              autoComplete="off"
              className="gr-font-mono rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-3 py-3 text-sm tracking-wider text-[#00f0ff] outline-none placeholder:opacity-30"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              data-testid="gr-new-game"
              onClick={handleNewGame}
              className="gr-font-mono rounded-sm border-2 border-[#00f0ff] bg-[#0f1b2d] px-4 py-3 text-sm font-bold uppercase tracking-widest text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-colors active:brightness-150"
            >
              New Game
            </button>

            {hasSave && (
              <button
                type="button"
                data-testid="gr-continue"
                onClick={onContinue}
                className="gr-font-mono rounded-sm border-2 border-[#ff00de] bg-[#0f1b2d] px-4 py-3 text-sm font-bold uppercase tracking-widest text-[#ff00de] shadow-[0_0_12px_rgba(255,0,222,0.15)] transition-colors active:brightness-150"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
