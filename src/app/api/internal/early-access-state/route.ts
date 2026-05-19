import { NextResponse } from "next/server";
import { getEarlyAccessState } from "@/lib/early-access";

export async function GET() {
  const state = await getEarlyAccessState();
  return NextResponse.json({
    earlyAccessActive: state.earlyAccessActive,
    dropModeActive: state.dropModeActive,
    countdownEnabled: state.countdownEnabled,
    earlyAccessDropAt: state.earlyAccessDropAt,
  });
}
