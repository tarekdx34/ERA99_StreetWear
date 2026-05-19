import { NextResponse } from "next/server";
import { addEarlyAccessSubscriber, isValidEmail } from "@/lib/early-access";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const source = String(body?.source || "early-access").trim() || "early-access";
    const timestamp = String(body?.timestamp || "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 },
      );
    }

    await addEarlyAccessSubscriber({ email, source, timestamp });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}
