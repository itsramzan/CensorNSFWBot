import "dotenv/config";
import { Telegraf } from "telegraf";
import { Filter } from "bad-words";
import { customBadWords } from "./customBadWords.js";

// Check if BOT_TOKEN exists
if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is not defined in .env");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Create filter
const filter = new Filter();
filter.addWords("porn", "sex", "nude", "xxx", "boobs", "fuck", "bitch");

// Function to check custom words
function containsCustomBadWords(text) {
  return customBadWords.some((word) =>
    text.toLowerCase().includes(word.toLowerCase())
  );
}

// Listen for messages safely
bot.on("text", async (ctx) => {
  try {
    const text = ctx.message?.text;
    if (!text) return;

    if (filter.isProfane(text) || containsCustomBadWords(text)) {
      try {
        await ctx.deleteMessage().catch((err) => {
          console.warn("⚠️ Unable to delete message:", err.description || err);
        });

        await ctx
          .reply(
            `⚠️ @${
              ctx.from?.username || "user"
            }, your message was removed for adult content.`
          )
          .catch((err) => {
            console.warn(
              "⚠️ Unable to send warning message:",
              err.description || err
            );
          });
      } catch (err) {
        console.error("Error handling filtered message:", err);
      }
    }
  } catch (err) {
    console.error("Error processing message:", err);
  }
});

// Gracefully handle polling errors
bot
  .launch({
    polling: {
      timeout: 30, // seconds
      retryAfter: 5, // seconds
    },
  })
  .then(() => {
    console.log("🤖 Bot is running with safe error handling...");
  })
  .catch((err) => {
    console.error("❌ Failed to launch bot:", err);
    process.exit(1);
  });

// Catch global unhandled errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
