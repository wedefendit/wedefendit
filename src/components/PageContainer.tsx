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

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="font-sans relative flex h-full w-full flex-col items-center justify-start -mt-3 sm:-mt-6 md:-mt-10">
      <div className="relative z-5 flex w-full max-w-full flex-col items-center justify-center gap-6 px-3 sm:gap-8 sm:px-0">
        {children}
      </div>
    </main>
  );
}
