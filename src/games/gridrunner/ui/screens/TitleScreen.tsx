/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import { useState, type FormEvent } from "react";

type TitleScreenProps = Readonly<{
  hasSave: boolean;
  onNewGame: (name: string) => void;
  onContinue: () => void;
}>;

/**
 * Title screen with name input and New Game / Continue.
 * Uses Orbitron for the title, Share Tech Mono for everything else.
 */
export function TitleScreen({ hasSave, onNewGame, onContinue }: TitleScreenProps) {
  const [name, setName] = useState("");

  function handleNewGame(e: FormEvent) {
    e.preventDefault();
    onNewGame(name.trim());
  }

  return (
    <section
      data-testid="gr-title-screen"
      aria-label="GRIDRUNNER title"
      className="flex flex-1 flex-col items-center justify-center gap-8 px-6"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <header className="flex flex-col items-center gap-3">
        <h1
          data-testid="gr-title"
          className="text-center text-3xl font-black tracking-[0.2em] sm:text-5xl"
          style={{ color: "#00f0ff", fontFamily: "'Orbitron', sans-serif" }}
        >
          GRIDRUNNER
        </h1>
        <p
          className="text-center text-xs tracking-widest sm:text-sm"
          style={{
            color: "#00f0ff",
            opacity: 0.5,
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          DEFEND THE GRID
        </p>
      </header>

      <div
        className="flex w-full max-w-xs flex-col gap-4"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        {/* Name input */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="gr-name-input"
            className="text-xs uppercase tracking-wider"
            style={{ color: "#00f0ff", opacity: 0.6 }}
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
            className="rounded-sm px-3 py-3 text-sm tracking-wider outline-none placeholder:opacity-30"
            style={{
              backgroundColor: "#0f1b2d",
              border: "1px solid #1a3a4a",
              color: "#00f0ff",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-testid="gr-new-game"
            onClick={handleNewGame}
            className="rounded-sm px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors active:brightness-150"
            style={{
              backgroundColor: "#0f1b2d",
              border: "2px solid #00f0ff",
              color: "#00f0ff",
              boxShadow: "0 0 12px rgba(0, 240, 255, 0.15)",
            }}
          >
            New Game
          </button>

          {hasSave && (
            <button
              type="button"
              data-testid="gr-continue"
              onClick={onContinue}
              className="rounded-sm px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors active:brightness-150"
              style={{
                backgroundColor: "#0f1b2d",
                border: "2px solid #ff00de",
                color: "#ff00de",
                boxShadow: "0 0 12px rgba(255, 0, 222, 0.15)",
              }}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
