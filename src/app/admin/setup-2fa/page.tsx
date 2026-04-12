import { Suspense } from "react";
import Setup2FAClient from "./setup-2fa-client";

export default function Setup2FAPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080808] px-6 py-16 text-[#F0EDE8]">
          <div className="mx-auto w-full max-w-lg text-center text-sm text-[#F0EDE8]/65">
            Loading setup...
          </div>
        </main>
      }
    >
      <Setup2FAClient />
    </Suspense>
  );
}
