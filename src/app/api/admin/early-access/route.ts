import { NextResponse } from "next/server";
import {
  getEarlyAccessSubscribers,
  getEarlyAccessState,
  setEarlyAccessDropAt,
  setDropModeActive,
  setEarlyAccessCountdownEnabled,
  setEarlyAccessActive,
} from "@/lib/early-access";
import { requireAdminRole } from "@/lib/admin-security";

async function requireSession() {
  const auth = await requireAdminRole();
  return auth.ok
    ? { ok: true as const, status: 200, message: "OK" }
    : auth;
}

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const url = new URL(req.url);
  const subscribers = await getEarlyAccessSubscribers();

  if (url.searchParams.get("format") === "csv") {
    const rows = [
      "email,signed_up_at,source,converted",
      ...subscribers.map((item) =>
        [
          item.email,
          item.signed_up_at.toISOString(),
          item.source,
          String(item.converted),
        ]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const state = await getEarlyAccessState();
  return NextResponse.json({
    earlyAccessActive: state.earlyAccessActive,
    dropModeActive: state.dropModeActive,
    countdownEnabled: state.countdownEnabled,
    earlyAccessDropAt: state.earlyAccessDropAt,
    subscribers,
  });
}

export async function PATCH(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.earlyAccessActive === "boolean") {
    await setEarlyAccessActive(body.earlyAccessActive);
  }
  if (typeof body.dropModeActive === "boolean") {
    await setDropModeActive(body.dropModeActive);
  }
  if (typeof body.countdownEnabled === "boolean") {
    await setEarlyAccessCountdownEnabled(body.countdownEnabled);
  }
  if (
    body.earlyAccessDropAt === null ||
    typeof body.earlyAccessDropAt === "string"
  ) {
    const saved = await setEarlyAccessDropAt(body.earlyAccessDropAt);
    if (body.earlyAccessDropAt && !saved) {
      return NextResponse.json(
        { message: "Invalid countdown date." },
        { status: 400 },
      );
    }
  }

  const state = await getEarlyAccessState();
  return NextResponse.json({
    earlyAccessActive: state.earlyAccessActive,
    dropModeActive: state.dropModeActive,
    countdownEnabled: state.countdownEnabled,
    earlyAccessDropAt: state.earlyAccessDropAt,
  });
}
