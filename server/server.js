import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend server is running.");
});

app.post("/chat", async (req, res) => {
  try {
    const {
      message,
      systemPrompt,
      model,
      temperature,
      history
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const input = [
      {
        role: "system",
        content: systemPrompt || "You are a helpful assistant."
      },
      ...(history || []),
      {
        role: "user",
        content: message
      }
    ];

    const response = await client.responses.create({
      model: model || "gpt-4.1-mini",
      temperature: Number(temperature ?? 0.7),
      input
    });

    const reply = response.output_text || "No response generated.";

    res.json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Failed to get AI response.",
      detail: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});