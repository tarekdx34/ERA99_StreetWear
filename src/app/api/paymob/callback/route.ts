export async function POST() {
  return Response.json(
    {
      code: "ONLINE_PAYMENT_DISABLED",
      message:
        "Paymob callback handling is disabled because online payments are disabled.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return Response.json(
    {
      code: "ONLINE_PAYMENT_DISABLED",
      message:
        "Paymob callback handling is disabled because online payments are disabled.",
    },
    { status: 410 },
  );
}
