/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = Readonly<{ children: ReactNode }>;

type State = Readonly<{
  hasError: boolean;
  error: Error | null;
}>;

/**
 * Error boundary for the GRIDRUNNER game. Catches render errors
 * and shows a recovery screen instead of crashing the whole page.
 */
export class GridRunnerError extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[GRIDRUNNER] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearSave = () => {
    try {
      globalThis.localStorage.removeItem("dis-gridrunner-save");
    } catch {
      /* noop */
    }
    globalThis.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section
        data-testid="gr-error"
        aria-label="Game error"
        className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#0a0e1a] px-6 py-8"
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="gr-font-display text-2xl font-black tracking-[0.15em] text-[#ff003c]">
            SYSTEM FAULT
          </h1>
          <p className="gr-font-mono text-center text-xs text-[#aabbcc]">
            Something went wrong. Your save data is safe.
          </p>
        </div>

        {this.state.error && (
          <pre className="gr-font-mono w-full max-w-md overflow-x-auto rounded-sm border border-[#ff003c]/30 bg-[#0f1b2d] p-3 text-xs leading-relaxed text-[#ff003c]">
            {this.state.error.message}
          </pre>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="gr-font-mono min-h-[44px] rounded-sm border-2 border-[#00f0ff] bg-[#0f1b2d] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#00f0ff] active:brightness-150"
          >
            RETRY
          </button>
          <button
            type="button"
            onClick={this.handleClearSave}
            className="gr-font-mono min-h-[44px] rounded-sm border border-[#ff003c] bg-[#0f1b2d] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#ff003c] active:brightness-150"
          >
            CLEAR SAVE AND RELOAD
          </button>
        </div>

        <p className="gr-font-mono text-center text-[10px] text-[#4a5568]">
          If this keeps happening, please report the error above.
        </p>
      </section>
    );
  }
}
