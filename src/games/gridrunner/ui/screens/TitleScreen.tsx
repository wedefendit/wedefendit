/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

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
      className="flex flex-1 flex-col items-center justify-center gap-8 bg-[#0a0e1a] px-6"
    >
      <header className="flex flex-col items-center gap-3">
        <h1
          data-testid="gr-title"
          className="gr-font-display text-center text-3xl font-black tracking-[0.2em] text-[#00f0ff] sm:text-5xl"
        >
          GRIDRUNNER
        </h1>
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
    </section>
  );
}
