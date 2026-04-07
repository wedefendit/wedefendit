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

import Link from "next/link";
import { Navbar } from "./Nav";
import { Logo } from "./Icons";
import { Footer } from "./Footer";
import React, { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggler";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <section
      id="main-scroll-container"
      className="relative w-full min-h-screen flex flex-col z-10 justify-between items-center"
    >
      <header className="w-full md:sticky md:top-0 dark:bg-gray-900/40  backdrop-blur-md bg-gray-50/40 z-10">
        <Navbar />
      </header>
      <ThemeToggle />
      <Link href="/" title="Defend I.T. Solutions Home">
        <Logo
          className="mb-3 h-36 w-36 -mt-2 text-gray-800 transition-all duration-700 animate-fade-in dark:text-sky-400 sm:mb-3 sm:h-44 sm:w-44 sm:-mt-3 md:mb-4 md:h-64 md:w-64 md:-mt-4 lg:h-80 lg:w-80 z-20"
          xlinkTitle="Defend I.T. Solutions Home"
        />
      </Link>

      <div
        className="absolute inset-0 h-full w-full bg-[url('/circuit.png')] bg-center bg-repeat bg-scroll opacity-3.25 pointer-events-none z-0 md:bg-fixed"
        aria-hidden="true"
      />

      {children}
      <Footer />
    </section>
  );
};
