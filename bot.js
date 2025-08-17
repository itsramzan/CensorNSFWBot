import "dotenv/config";
import { Telegraf } from "telegraf";
import { Filter } from "bad-words";
import { customBadWords } from "./customBadWords.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Create filter
const filter = new Filter();

// English words
filter.addWords("porn", "sex", "nude", "xxx", "boobs", "fuck", "bitch");

// Function to check custom words
function containsCustomBadWords(text) {
  return customBadWords.some((word) => text.includes(word));
}

// Listen for messages
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (filter.isProfane(text) || containsCustomBadWords(text)) {
    try {
      await ctx.deleteMessage();
      await ctx.reply(
        `⚠️ @${
          ctx.from.username || "user"
        }, your message was removed for adult content.`
      );
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }
});

bot.launch();
console.log("🚀 Bot is running...");
