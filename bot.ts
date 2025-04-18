import { configDotenv } from "dotenv";
import { Bot, InlineKeyboard } from "grammy";

const env = configDotenv({ path: "./.env" });

//Store bot screaming status
let screaming = false;
function hasToken(env: any): env is { TG_TOKEN: string } {
  return "TG_TOKEN" in env && typeof env.TG_TOKEN === "string";
}

if (!hasToken(env.parsed)) {
  throw new Error("No TG_TOKEN in env");
}

//Create a new bot
const bot = new Bot(env.parsed.TG_TOKEN);

//This function handles the /scream command
bot.command("scream", () => {
  screaming = true;
});

//This function handles /whisper command
bot.command("whisper", () => {
  screaming = false;
});

//Pre-assign menu text
const firstMenu =
  "<b>Menu 1</b>\n\nA beautiful menu with a shiny inline button.";
const secondMenu =
  "<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.";

//Pre-assign button text
const nextButton = "Next";
const backButton = "Back";
const tutorialButton = "Tutorial";

//Build keyboards
const firstMenuMarkup = new InlineKeyboard().text(nextButton, nextButton);

const secondMenuMarkup = new InlineKeyboard()
  .text(backButton, backButton)
  .text(tutorialButton, "https://core.telegram.org/bots/tutorial");

//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: firstMenuMarkup,
  });
});

//This handler processes back button on the menu
bot.callbackQuery(backButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(firstMenu, {
    reply_markup: firstMenuMarkup,
    parse_mode: "HTML",
  });
});

//This handler processes next button on the menu
bot.callbackQuery(nextButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(secondMenu, {
    reply_markup: secondMenuMarkup,
    parse_mode: "HTML",
  });
});

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  //Print to console
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`
  );

  if (screaming && ctx.message.text) {
    //Scream the message
    await ctx.reply(ctx.message.text.toUpperCase(), {
      entities: ctx.message.entities,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});

//Start the Bot
bot.start();
