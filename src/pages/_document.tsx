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

// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html
      lang="en"
      className="bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-300 w-screen min-h-screen overflow-x-hidden overflow-y-auto"
    >
      <Head>
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg" />
      </Head>
      <body className="antialiased w-full h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
