import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend server is running.");
});

// =========================
// Auto routing
// =========================
function routeModel(message, hasImage = false, selectedModel = "auto") {
  if (selectedModel && selectedModel !== "auto") {
    return selectedModel;
  }

  if (hasImage) {
    return "gpt-4.1";
  }

  const lower = message.toLowerCase();

  if (message.length > 120) return "gpt-4.1";

  if (
    lower.includes("explain") ||
    lower.includes("analyze") ||
    lower.includes("reason") ||
    lower.includes("step by step") ||
    lower.includes("complex")
  ) {
    return "gpt-4.1";
  }

  return "gpt-4.1-mini";
}

// =========================
// Tool functions
// =========================
function getCurrentTime() {
  return new Date().toString();
}

function calculateExpression(expr) {
  try {
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      return "Invalid expression. Only numbers and basic operators are allowed.";
    }

    const result = Function(`"use strict"; return (${expr})`)();
    return `Result: ${result}`;
  } catch {
    return "Invalid expression.";
  }
}

// =========================
// Tool detection
// =========================
function checkTool(message) {
  const lower = message.toLowerCase();

  if (
    lower.includes("what time") ||
    lower.includes("current time") ||
    lower.includes("time now")
  ) {
    return {
      tool: "time",
      result: getCurrentTime()
    };
  }

  if (lower.startsWith("calculate")) {
    const expr = message.replace(/calculate/i, "").trim();

    return {
      tool: "calculator",
      result: calculateExpression(expr)
    };
  }

  return null;
}

// =========================
// Chat API
// =========================
app.post("/chat", async (req, res) => {
  try {
    const {
      message,
      systemPrompt,
      temperature,
      history,
      selectedModel,
      image
    } = req.body;

    if ((!message || !message.trim()) && !image) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    const userMessage = message || "Please describe this image.";

    // Tool use
    if (!image) {
      const toolResult = checkTool(userMessage);

      if (toolResult) {
        return res.json({
          reply: `[Tool used: ${toolResult.tool}]\n\n${toolResult.result}`,
          routedModel: "tool"
        });
      }
    }

    // Auto routing
    const routedModel = routeModel(userMessage, Boolean(image), selectedModel);

    let input;

    if (image) {
      input = [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant."
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userMessage
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ];
    } else {
      input = [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant."
        },
        ...(history || []),
        {
          role: "user",
          content: userMessage
        }
      ];
    }

    const response = await client.responses.create({
      model: routedModel,
      temperature: Number(temperature ?? 0.7),
      input
    });

    const reply = response.output_text || "No response generated.";

    res.json({
      reply,
      routedModel
    });

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