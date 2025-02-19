import { geminiModel } from "../../config/gemini.config.js";

class RecipeChatbot {
  constructor() {
    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("chat-input");
    this.sendButton = document.getElementById("send-message");

    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
  }

  async sendMessage() {
    const userMessage = this.chatInput.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    this.addMessageToChat("user", userMessage);
    this.chatInput.value = "";

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await this.getGeminiResponse(userMessage);
      this.removeTypingIndicator();
      this.addMessageToChat("bot", response);
    } catch (error) {
      console.error("Chatbot error:", error);
      this.removeTypingIndicator();
      this.addMessageToChat(
        "bot",
        "Sorry, I encountered an error. Please try again."
      );
    }
  }

  async getGeminiResponse(message) {
    const prompt = `You are a helpful cooking assistant. Please respond to the following question about cooking or recipes: ${message}`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  }

  addMessageToChat(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-text">${message}</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.innerHTML = "<span></span><span></span><span></span>";
    this.chatMessages.appendChild(typingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  removeTypingIndicator() {
    const typingIndicator =
      this.chatMessages.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

export const chatbot = new RecipeChatbot();
