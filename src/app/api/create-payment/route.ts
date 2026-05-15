export async function POST() {
  return Response.json(
    {
      code: "ONLINE_PAYMENT_DISABLED",
      error:
        "Online payment is disabled in this deployment. Cash on Delivery is the only available checkout method.",
    },
    { status: 410 },
  );
}
