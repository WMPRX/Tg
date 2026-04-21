/**
 * Thin Telegram Bot API helper.
 * If TELEGRAM_BOT_TOKEN is set, we call the real Bot API. Otherwise we return
 * deterministic mock data so the add-channel wizard and stats cron can still
 * be exercised in dev.
 */

const API = "https://api.telegram.org";

export type TelegramChatInfo = {
  id: number;
  type: "channel" | "group" | "supergroup" | "private";
  title: string;
  username?: string;
  description?: string;
};

export type ChannelLookupResult = {
  ok: true;
  telegramId: string;
  title: string;
  description?: string;
  type: "CHANNEL" | "GROUP" | "SUPERGROUP";
  memberCount?: number;
  avatarUrl?: string | null;
};

export async function getChatInfo(username: string): Promise<ChannelLookupResult | { ok: false; error: string }> {
  const cleanUsername = username.replace(/^@/, "");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return mockLookup(cleanUsername);
  }
  try {
    const chatRes = await fetch(`${API}/bot${token}/getChat?chat_id=@${cleanUsername}`, { cache: "no-store" });
    const chatJson = (await chatRes.json()) as { ok: boolean; result?: TelegramChatInfo; description?: string };
    if (!chatJson.ok || !chatJson.result) {
      return { ok: false, error: chatJson.description ?? "chat_not_found" };
    }
    const chat = chatJson.result;
    const countRes = await fetch(
      `${API}/bot${token}/getChatMemberCount?chat_id=@${cleanUsername}`,
      { cache: "no-store" },
    );
    const countJson = (await countRes.json()) as { ok: boolean; result?: number };
    return {
      ok: true,
      telegramId: String(chat.id),
      title: chat.title,
      description: chat.description,
      type: normalizeType(chat.type),
      memberCount: countJson.ok ? countJson.result : undefined,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network_error" };
  }
}

function normalizeType(type: TelegramChatInfo["type"]): ChannelLookupResult["type"] {
  if (type === "channel") return "CHANNEL";
  if (type === "supergroup") return "SUPERGROUP";
  return "GROUP";
}

function mockLookup(username: string): ChannelLookupResult {
  const hash = [...username].reduce((a, c) => a + c.charCodeAt(0), 0);
  const members = 1000 + (hash % 50) * 12345;
  return {
    ok: true,
    telegramId: `-100${(1_000_000 + hash).toString().padStart(10, "0")}`,
    title: username
      .replace(/_/g, " ")
      .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase()),
    description: `Mocked Telegram channel for @${username} (set TELEGRAM_BOT_TOKEN in .env for real data).`,
    type: "CHANNEL",
    memberCount: members,
    avatarUrl: null,
  };
}
