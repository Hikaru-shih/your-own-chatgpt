# 🏰 Your Own ChatGPT (DungeonGPT)

## 📌 Introduction
This project is a custom ChatGPT-style web application that allows users to interact with a large language model (LLM) through a web interface.

Users can not only chat with the AI, but also control its behavior using customizable parameters such as system prompt and temperature.

---

## ✨ Features

- 💬 Chat interface with real-time responses
- 🎭 Custom system prompt (control AI role and behavior)
- 🌡️ Temperature control (adjust creativity)
- 🧠 Long-term memory (stored using localStorage)
- 🎨 Themed UI (Dungeon-style interface)
- 🤖 Auto routing between models (simple vs complex queries)
- 🛠 Tool use (time & calculator without LLM)
- 🖼 Multimodal input (image upload & description)
- 📝 Markdown rendering for AI responses
---

## 🏗️ System Architecture

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express

### API
- OpenAI API (LLM response generation)

- Model routing and tool execution logic

---

## 🔄 How It Works

1. User enters a message in the frontend
2. The message is sent to the backend server
3. The backend checks:
   - Tool usage
   - Model routing
4. If needed, the backend calls the OpenAI API
5. The AI response is returned to the frontend
6. The frontend displays the response

---

## 🔐 API Key Security

The OpenAI API key is stored securely using environment variables in a `.env` file.

Example:
OPENAI_API_KEY=your_api_key_here

⚠️ The `.env` file is excluded from version control using `.gitignore`.

---

## 🚀 How to Run

```bash
cd server
npm install
npm start

cd client
python3 -m http.server 5500
Open in browser: http://localhost:5500

---

## 📊 HW2 Improvements

Compared to Homework 01, this version adds:

- Long-term memory
- Auto model routing
- Tool execution
- Multimodal image input

These features make the chatbot more intelligent and efficient.
