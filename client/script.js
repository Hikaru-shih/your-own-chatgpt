const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const clearImageBtn = document.getElementById("clearImageBtn");
const temperatureSlider = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");
const systemPromptInput = document.getElementById("systemPrompt");
const modelSelect = document.getElementById("modelSelect");
const imageInput = document.getElementById("imageInput");

const DEFAULT_MESSAGE =
  "Welcome, traveler. I am your assistant. Ask your question, and I will help you clearly and accurately.";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant. Answer clearly and accurately. Do not mix languages or produce random characters.";

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

temperatureSlider.addEventListener("input", () => {
  tempValue.textContent = temperatureSlider.value;
});

function saveHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function renderText(text) {
  if (typeof marked !== "undefined") {
    return marked.parse(text);
  }
  return text.replace(/\n/g, "<br>");
}

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = renderText(text);

  message.appendChild(bubble);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  return bubble;
}

function addImagePreview(base64) {
  const message = document.createElement("div");
  message.classList.add("message", "user");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  const img = document.createElement("img");
  img.src = base64;
  img.alt = "Uploaded image";
  img.style.maxWidth = "240px";
  img.style.borderRadius = "10px";
  img.style.display = "block";

  bubble.appendChild(img);
  message.appendChild(bubble);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function loadHistoryToUI() {
  if (chatHistory.length === 0) {
    chatBox.innerHTML = `
      <div class="message bot">
        <div class="bubble">${DEFAULT_MESSAGE}</div>
      </div>
    `;
    return;
  }

  chatBox.innerHTML = "";

  chatHistory.forEach((msg) => {
    if (msg.role === "user") {
      addMessage(msg.content, "user");
    } else if (msg.role === "assistant") {
      addMessage(msg.content, "bot");
    }
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

async function sendMessage() {
  const text = userInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!text && !imageFile) return;

  let imageBase64 = null;

  if (imageFile) {
    imageBase64 = await fileToBase64(imageFile);
    addImagePreview(imageBase64);
  }

  const userMessage = text || "Please describe this image.";
  addMessage(userMessage, "user");

  userInput.value = "";

  const typingBubble = addMessage("The ancient scroll is being deciphered...", "bot");

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage,
        systemPrompt: systemPromptInput.value || DEFAULT_SYSTEM_PROMPT,
        temperature: temperatureSlider.value,
        history: chatHistory,
        selectedModel: modelSelect.value,
        image: imageBase64
      })
    });

    const data = await response.json();

    if (data.reply) {
      const fullReply = `**Auto routed model:** ${data.routedModel || "unknown"}\n\n${data.reply}`;

      typingBubble.innerHTML = renderText(fullReply);

      chatHistory.push({
        role: "user",
        content: imageBase64
          ? `[Image uploaded]\n\n${userMessage}`
          : userMessage
      });

      chatHistory.push({
        role: "assistant",
        content: fullReply
      });

      saveHistory();

      imageInput.value = "";
    } else {
      typingBubble.innerHTML = renderText(
        `${data.error || "No reply from server."}\n${data.detail || ""}`
      );
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

clearImageBtn.addEventListener("click", () => {
  imageInput.value = "";
});

clearBtn.addEventListener("click", () => {
  chatBox.innerHTML = `
    <div class="message bot">
      <div class="bubble">${DEFAULT_MESSAGE}</div>
    </div>
  `;

  chatHistory = [];
  localStorage.removeItem("chatHistory");
  systemPromptInput.value = DEFAULT_SYSTEM_PROMPT;
  imageInput.value = "";
});

if (!systemPromptInput.value.trim()) {
  systemPromptInput.value = DEFAULT_SYSTEM_PROMPT;
}

loadHistoryToUI();