import { NextResponse } from "next/server";
import { getEarlyAccessState } from "@/lib/early-access";

export async function GET() {
  try {
    const state = await getEarlyAccessState();
    return NextResponse.json({
      earlyAccessActive: state.earlyAccessActive,
      dropModeActive: state.dropModeActive,
      countdownEnabled: state.countdownEnabled,
      earlyAccessDropAt: state.earlyAccessDropAt,
    });
  } catch (err) {
    // If DB or other internal errors occur, return safe defaults so middleware
    // and public pages continue to work instead of crashing the app.
    console.log("Internal early-access state error:", err);
    return NextResponse.json({
      earlyAccessActive: false,
      dropModeActive: false,
      countdownEnabled: false,
      earlyAccessDropAt: null,
    });
  }
}
