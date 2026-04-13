import Link from "next/link";

export default function VerifyEmailSentPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="border border-[0.5px] border-[#F0EDE8]/25 bg-[#111111] p-6 text-center">
          <p className="font-blackletter text-5xl leading-none">ERA 99</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">
            99 - ALEXANDRIA
          </p>

          <h1 className="mt-8 text-xs uppercase tracking-[0.25em] text-[#F0EDE8]/70">
            Verify your email
          </h1>
          <p className="mt-4 text-sm text-[#F0EDE8]/80">
            Check your inbox. Verify your email to start shopping.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65 underline"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
