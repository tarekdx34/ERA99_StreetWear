export async function POST() {
  return Response.json(
    { error: "Online payment is not available yet. Please use Cash on Delivery." },
    { status: 503 },
  );
}
