import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  sendMessage,
  sendMessageWithKeyboard,
  editMessageText,
  answerCallbackQuery,
  buildDayKeyboard,
  toggleDaySelection,
  formatGymDays,
} from "@/lib/telegram";

// ---- Copy ---------------------------------------------------
const SKIP_SHAMES = [
  "Enjoy being average.",
  "Skipped again. Your gains are dying.",
  "Your future self is disappointed.",
  "Fine. Stay fat.",
  "Loser. No wonder you look like that.",
  "Skipped. The couch remains undefeated.",
  "Another day of training your excuses.",
  "Your gym membership is getting more exercise than you.",
  "Consistency left the chat.",
  "You skipped so fast I thought it was cardio.",
  "Every excuse makes the next one easier.",
  "The hardest lift today was lifting your finger to press skip.",
  "Your goals are starting to think they're imaginary.",
  "You don't need more motivation. You need less excuses.",
  "Day by day you're becoming a fatty.",
  "The gym wasn't expecting much and you still disappointed it.",
  "Keep skipping. Fatass.",
];

const LOG_CONFIRMS = [
  "Logged. You did the bare minimum. Awesome!",
  "Not bad..",
  "Yippie!",
  "Logged. Streak is building.",
  "Alright. You get a pass today.",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Telegram types -----------------------------------------
interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
}
interface TgMessage {
  message_id: number;
  from?: TgUser;
  chat: { id: number };
  text?: string;
}
interface TgCallbackQuery {
  id: string;
  from: TgUser;
  message?: TgMessage;
  data?: string;
}
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
}

// ---- Main handler -------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const update: TgUpdate = await req.json();
    const supabase = createServerClient();

    // ========================================================
    // CALLBACK QUERIES (inline button taps)
    // ========================================================
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data ?? "";
      const chatId = cq.message?.chat.id!;
      const msgId = cq.message?.message_id!;

      // -- Day toggle: dt:DAY:CURRENT_SELECTION
      if (data.startsWith("dt:")) {
        const [, day, current] = data.split(":");
        const next = toggleDaySelection(current ?? "", day);
        await editMessageText(
          chatId,
          msgId,
          daySelectText(next),
          buildDayKeyboard(next),
        );
        await answerCallbackQuery(cq.id);
        return ok();
      }

      // -- Day save: ds:SELECTED
      if (data.startsWith("ds:")) {
        const selectedStr = data.slice(3);
        const gymDays = selectedStr.split("").map(Number);
        await supabase
          .from("users")
          .update({ gym_days: gymDays, bot_state: "idle" })
          .eq("telegram_id", chatId);
        const names = formatGymDays(gymDays);
        await editMessageText(
          chatId,
          msgId,
          `Done. I'll nag you on: ${names}.`,
        );
        await answerCallbackQuery(cq.id, "Saved!");
        return ok();
      }

      // -- Noop (save button with no days selected)
      if (data === "noop") {
        await answerCallbackQuery(cq.id, "Pick at least one day first!");
        return ok();
      }

      // -- Skip
      if (data === "skip") {
        const { data: user } = await supabase
          .from("users")
          .select("id, streak")
          .eq("telegram_id", chatId)
          .single();
        if (user) {
          await supabase
            .from("logs")
            .insert({ user_id: user.id, status: "skipped", raw_text: null });
          await supabase.from("users").update({ streak: 0 }).eq("id", user.id);
        }
        await editMessageText(chatId, msgId, rand(SKIP_SHAMES), {
          inline_keyboard: [
            [{ text: "Wait, I actually went! ", callback_data: "start" }],
          ],
        });
        await answerCallbackQuery(cq.id);
        return ok();
      }

      // -- Start (Let's go)
      if (data === "start") {
        await supabase
          .from("users")
          .update({ bot_state: "waiting_workout" })
          .eq("telegram_id", chatId);
        await editMessageText(
          chatId,
          msgId,
          "Let's go! \n\nWhat did you do? Type it out:",
        );
        await answerCallbackQuery(cq.id);
        return ok();
      }

      await answerCallbackQuery(cq.id);
      return ok();
    }

    // ========================================================
    // MESSAGES
    // ========================================================
    const msg = update.message;
    if (!msg?.text) return ok();

    const chatId = msg.chat.id;
    const text = msg.text.trim();
    const from = msg.from;

    // -- /start <short_code>
    if (text.startsWith("/start")) {
      const shortCode = text.split(" ")[1]?.trim();

      if (!shortCode) {
        await sendMessage(
          chatId,
          "Hey! Use the link from the website to get set up.",
        );
        return ok();
      }

      const { data: pending } = await supabase
        .from("pending_signups")
        .select("*")
        .eq("short_code", shortCode)
        .is("consumed_at", null)
        .single();

      if (!pending) {
        await sendMessage(
          chatId,
          "That link is invalid or already used. Grab a new one from the website.",
        );
        return ok();
      }

      const handle = from?.username?.toLowerCase() ?? pending.handle_input;
      const displayName = from?.first_name ?? handle;

      await supabase.from("users").upsert(
        {
          telegram_id: chatId,
          handle,
          display_name: displayName,
          bot_state: "setup",
        },
        { onConflict: "telegram_id" },
      );

      await supabase
        .from("pending_signups")
        .update({ consumed_at: new Date().toISOString() })
        .eq("short_code", shortCode);

      await sendMessage(
        chatId,
        `Registered, ${displayName}. Now pick your gym days below.`,
      );
      await sendMessageWithKeyboard(
        chatId,
        daySelectText(""),
        buildDayKeyboard(""),
      );
      return ok();
    }

    // -- Fetch user for all other message handling
    const { data: user } = await supabase
      .from("users")
      .select("id, bot_state, streak, handle")
      .eq("telegram_id", chatId)
      .single();

    if (!user) {
      await sendMessage(
        chatId,
        "I don't know you yet. Use the website link to register first.",
      );
      return ok();
    }

    // -- Waiting for workout text
    if (user.bot_state === "waiting_workout") {
      // If they had skipped today, delete that log so this overrides it
      const todayIso = new Date().toISOString().split("T")[0];
      await supabase
        .from("logs")
        .delete()
        .eq("user_id", user.id)
        .eq("status", "skipped")
        .gte("logged_at", `${todayIso}T00:00:00Z`);

      const newStreak = (user.streak ?? 0) + 1;
      await supabase
        .from("logs")
        .insert({ user_id: user.id, status: "completed", raw_text: text });
      await supabase
        .from("users")
        .update({ bot_state: "idle", streak: newStreak })
        .eq("id", user.id);
      await sendMessage(
        chatId,
        `${rand(LOG_CONFIRMS)}\n\n🔥 Streak: ${newStreak} day${newStreak !== 1 ? "s" : ""}`,
      );
      return ok();
    }

    // -- In setup state, re-prompt day selection
    if (user.bot_state === "setup") {
      await sendMessageWithKeyboard(
        chatId,
        daySelectText(""),
        buildDayKeyboard(""),
      );
      return ok();
    }

    // -- Idle: unknown message
    await sendMessage(
      chatId,
      "Wait for the daily nag and use the buttons. Stop texting me for no reason.",
    );
    return ok();
  } catch (e) {
    console.error("[webhook]", e);
    return ok(); // always 200 to Telegram
  }
}

function ok() {
  return NextResponse.json({ ok: true });
}

function daySelectText(selected: string) {
  const count = selected.length;
  return count
    ? `Which days do you go to the gym?\n\n${count} day${count !== 1 ? "s" : ""} selected. Hit Save when done.`
    : `Which days do you go to the gym?\n\nTap a day to select it, then hit Save.`;
}
