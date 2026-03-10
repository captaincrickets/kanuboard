document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const status = document.getElementById("msgStatus");
  
    async function loadMessages() {
      try {
        const res = await fetch(API_URL);
        const items = await res.json();
  
        container.innerHTML = "";
  
        items
          .filter(i => i.type === "message")
          .reverse()
          .forEach(msg => {
            const div = document.createElement("div");
            div.className = "message";
  
            div.innerHTML = `
              <div>${msg.content}</div>
              <div class="message-time">
                ${new Date(msg.timestamp).toLocaleString()}
              </div>
            `;
            container.appendChild(div);
          });
  
      } catch (err) {
        container.innerHTML = "Failed to load messages.";
        console.error(err);
      }
    }
  
    // Send a new message
    document.getElementById("sendMessage").addEventListener("click", async () => {
      const text = input.value.trim();
      if (!text) return;
      if (text.length > 500) {
        status.textContent = "Message too long.";
        return;
      }
  
      status.textContent = "Sending...";
      try {
        await fetch(API_URL, {
            mode: "no-cors",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "message", message: text })
        });
  
        input.value = "";
        status.textContent = "Message sent";
  
        loadMessages();
      } catch (err) {
        status.textContent = "Failed to send message.";
        console.error(err);
      }
    });
  
    loadMessages();
  });
