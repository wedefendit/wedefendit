import { useEffect, useState, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

enum ThemeValue { Light = "light", Dark = "dark" }
type Theme = `${ThemeValue}`;
enum PlacementValue { Fixed = "fixed", Inline = "inline" }

type ThemeToggleProps = Readonly<{
  placement?: `${PlacementValue}`;
}>;
const THEME_CLASS = { icon: "w-5 h-5" };

function subscribeTheme(): () => void {
  return () => {};
}

function clientMounted(): boolean {
  return true;
}

function serverMounted(): boolean {
  return false;
}

function storedTheme(): Theme {
  const stored = localStorage.getItem("theme");
  return stored === ThemeValue.Light || stored === ThemeValue.Dark ? stored : ThemeValue.Dark;
}

export function ThemeToggle({ placement = PlacementValue.Fixed }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(subscribeTheme, clientMounted, serverMounted);
  const stored = useSyncExternalStore(subscribeTheme, storedTheme, () => ThemeValue.Dark);
  const [themeOverride, setThemeOverride] = useState<Theme | null>(null);
  const theme = themeOverride ?? stored;

  const applyTheme = (t: Theme) => {
    document.documentElement.classList.toggle(ThemeValue.Dark, t === ThemeValue.Dark);
  };

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme, mounted]);

  if (!mounted) {
    return placement === PlacementValue.Inline ? (
      <span aria-hidden className="inline-flex h-8 w-8 shrink-0" />
    ) : null;
  }

  const toggleTheme = () =>
    setThemeOverride(theme === ThemeValue.Light ? ThemeValue.Dark : ThemeValue.Light);

  const next = theme === ThemeValue.Light ? ThemeValue.Dark : ThemeValue.Light;
  const buttonClass =
    placement === PlacementValue.Inline
      ? "inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface p-1.5 text-ink shadow-sm transition-colors hover:cursor-pointer hover:border-border-accent hover:bg-surface-hover hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
      : "fixed bottom-1 left-2 z-[150] rounded-full bg-surface p-2 text-xl text-ink shadow-md transition-colors hover:cursor-pointer hover:bg-surface-hover hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] lg:bottom-auto lg:left-auto lg:right-4 lg:top-2 lg:z-[60]";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`${buttonClass} touch-manipulation`}
      style={{ touchAction: "manipulation" }}
    >
      {theme === ThemeValue.Light ? (
        <Moon className={THEME_CLASS.icon} />
      ) : (
        <Sun className={THEME_CLASS.icon} />
      )}
    </button>
  );
}
