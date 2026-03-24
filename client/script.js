const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const temperatureSlider = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");
const systemPromptInput = document.getElementById("systemPrompt");
const modelSelect = document.getElementById("modelSelect");

let chatHistory = [];

temperatureSlider.addEventListener("input", () => {
  tempValue.textContent = temperatureSlider.value;
});

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  message.appendChild(bubble);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  return bubble;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  const typingBubble = addMessage("Consulting the captain's log...", "bot");

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        systemPrompt: systemPromptInput.value,
        model: modelSelect.value,
        temperature: temperatureSlider.value,
        history: chatHistory
      })
    });

    const data = await response.json();

    if (data.reply) {
      typingBubble.textContent = data.reply;

      chatHistory.push({
        role: "user",
        content: text
      });

      chatHistory.push({
        role: "assistant",
        content: data.reply
      });
    } else {
      typingBubble.textContent = data.error || "No reply from server.";
    }
  } catch (error) {
    typingBubble.textContent = "Failed to connect to backend.";
    console.error(error);
  }
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

clearBtn.addEventListener("click", () => {
  chatBox.innerHTML = `
    <div class="message bot">
      <div class="bubble">Welcome, traveler. I am your assistant. Ask your question, and I will help you clearly and accurately.</div>
    </div>
  `;
  chatHistory = [];
});