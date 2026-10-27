import { useRouter } from "next/router";
import { Navbar } from "./Nav";
import { Footer } from "./Footer";
import React, { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggler";

type LayoutProps = Readonly<{
  children?: ReactNode;
}>;

const GAME_ROUTES: ReadonlySet<string> = new Set([
  "/awareness/digital-house",
  "/awareness/gridrunner",
]);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const isGameRoute = GAME_ROUTES.has(router.pathname);

  return (
    <div
      id="main-scroll-container"
      className={
        isGameRoute
          ? "relative z-10 flex h-dvh w-full flex-col overflow-clip"
          : "relative w-full min-h-screen flex flex-col z-10 justify-between items-center"
      }
    >
      <a
        href="#main-content"
        className="sr-only size-11 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:size-auto focus:rounded-lg focus:bg-accent-fill focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-contrast focus:shadow-lg"
      >
        Skip to main content
      </a>
      <header className="w-full sticky top-0 backdrop-blur-md bg-ground/40 z-50">
        <Navbar />
      </header>
      {/* ThemeToggle applies the `dark` class to <html>. Digital House mounts
          an inline toggle in its own header so the fixed control does not sit
          over the mobile device tray. */}
      {!isGameRoute && <ThemeToggle />}

      <div
        className="absolute inset-0 h-full w-full bg-[url('/img/circuit.png')] bg-center bg-repeat bg-scroll opacity-3.25 pointer-events-none z-0 md:bg-fixed"
        aria-hidden="true"
      />

      {children}
      {!isGameRoute && <Footer />}
    </div>
  );
};
