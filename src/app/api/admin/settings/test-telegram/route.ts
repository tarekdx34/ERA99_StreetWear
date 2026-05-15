import { NextResponse } from "next/server";


import { requireAdminRole } from "@/lib/admin-security";
import { getAdminSettings } from "@/lib/admin-settings";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  const auth = await requireAdminRole();
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
