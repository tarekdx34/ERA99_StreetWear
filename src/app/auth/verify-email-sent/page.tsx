import Link from "next/link";

export default function VerifyEmailSentPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-[#EDE9E0]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="border border-[0.5px] border-[#EDE9E0]/25 bg-[#080808] p-6 text-center">
          <p className="font-anton text-5xl leading-none tracking-[16px] text-[#EDE9E0]">QUTB</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#555555]">
            THE AXIS
          </p>

          <h1 className="mt-8 text-xs uppercase tracking-[0.25em] text-[#EDE9E0]/70">
            Verify your email
          </h1>
          <p className="mt-4 text-sm text-[#EDE9E0]/80">
            Check your inbox. Verify your email to start shopping.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-[#EDE9E0]/65 underline"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
