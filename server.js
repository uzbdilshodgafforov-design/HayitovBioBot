import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BOT_TOKEN = "8356093765:AAE0pSZizEWVBJTCqQCdy1od4JJP9-KZC6A";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.get("/", (req, res) => {
  res.send("HayitovBioBot server ishlayapti ✅");
});

app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message || !message.chat) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  if (text === "/start") {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Salom! 👋 Bu Hayitov Education'ning Biologiya o‘quv ilovasi.\n👇 Quyidagi tugmani bosing:",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Boshlash",
              web_app: { url: "https://your-app-url.vercel.app" },
            },
          ],
        ],
      },
    });
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server 3000-portda ishlayapti"));
