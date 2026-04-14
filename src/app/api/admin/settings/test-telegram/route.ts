import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { getAdminSettings } from "@/lib/admin-settings";
import { sendTelegramMessage } from "@/lib/telegram";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { ok: false as const, status: 401, message: "Unauthorized" };

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return { ok: false as const, status: 401, message: "Session expired" };
  }

  return { ok: true as const };
}

export async function POST() {
  const auth = await ensureAdmin();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  const settings = await getAdminSettings();

  await sendTelegramMessage(
    `🖤 ERA 99 Admin test notification - ${new Date().toISOString()}`,
    {
      botToken: settings.telegramBotToken,
      chatId: settings.telegramChatId,
    },
  );

  return NextResponse.json({ ok: true });
}
