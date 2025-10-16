import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

// Mavzular va testlar
const topics = {
  "Hujayra": {
    questions: [
      { q: "Hujayraning asosiy qismi nima?", a: ["Yadro", "Mitoxondriya", "Ribosoma"], correct: 0 },
      { q: "Sitoplazma qayerda joylashgan?", a: ["Yadroda", "Plazmatik membrana ichida", "Markaziy vakuolda"], correct: 1 },
    ],
  },
  "DNK": {
    questions: [
      { q: "DNKning asosiy vazifasi nima?", a: ["Energiyani saqlash", "Irsiy axborotni saqlash", "Hujayrani harakatlantirish"], correct: 1 },
      { q: "DNK molekulasi nechta zanjirdan iborat?", a: ["1", "2", "3"], correct: 1 },
    ],
  },
};

// Foydalanuvchi holatini saqlash
const userProgress = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Assalomu alaykum, ${msg.from.first_name}!\nBu — *Biologiya by Hayitov Education* bot.\n\nBoshlaymizmi?`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [["Boshlash"]],
        resize_keyboard: true,
      },
    }
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "Boshlash") {
    userProgress[chatId] = { topicIndex: 0, score: 0, questionIndex: 0 };
    startTopic(chatId);
  }
});

function startTopic(chatId) {
  const topicsArray = Object.keys(topics);
  const user = userProgress[chatId];
  const topicName = topicsArray[user.topicIndex];
  const topic = topics[topicName];

  if (!topic) {
    bot.sendMessage(chatId, "Tabriklayman! Barcha mavzularni tugatding. 🎉");
    return;
  }

  const question = topic.questions[user.questionIndex];
  const options = {
    reply_markup: {
      keyboard: [question.a.map((a) => a)],
      resize_keyboard: true,
    },
  };
  bot.sendMessage(chatId, `📘 *${topicName}*\n\n${question.q}`, {
    parse_mode: "Markdown",
    ...options,
  });
}

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = userProgress[chatId];
  if (!user) return;

  const topicsArray = Object.keys(topics);
  const topicName = topicsArray[user.topicIndex];
  const topic = topics[topicName];
  const question = topic.questions[user.questionIndex];

  const answerIndex = question.a.indexOf(text);
  if (answerIndex === -1) return;

  if (answerIndex === question.correct) {
    user.score += 1;
    bot.sendMessage(chatId, "✅ To‘g‘ri!");
  } else {
    bot.sendMessage(chatId, "❌ Noto‘g‘ri!");
  }

  user.questionIndex++;

  if (user.questionIndex < topic.questions.length) {
    startTopic(chatId);
  } else {
    const percent = (user.score / topic.questions.length) * 100;
    if (percent >= 70) {
      bot.sendMessage(chatId, `👏 ${topicName} bo‘yicha ${percent}% to‘plading. Keyingi mavzuga o‘tamiz!`);
      user.topicIndex++;
      user.questionIndex = 0;
      user.score = 0;
      startTopic(chatId);
    } else {
      bot.sendMessage(chatId, `${topicName} bo‘yicha natijang ${percent}% bo‘ldi. Qayta urinib ko‘r!`);
      user.questionIndex = 0;
      user.score = 0;
      startTopic(chatId);
    }
  }
});

app.get("/", (req, res) => res.send("Bot ishga tushdi."));
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlayapti`));
