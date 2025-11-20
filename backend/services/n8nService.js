const axios = require("axios");

const N8N_WEBHOOK_URL = "https://josuelm7.app.n8n.cloud/webhook/notificacion"; // ⬅️ Pega aquí tu URL real

async function sendReviewToN8N(data) {
  try {
    await axios.post(N8N_WEBHOOK_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📩 Notificación enviada a n8n");
  } catch (error) {
    console.error("❌ Error al enviar a n8n:", error.response?.data || error.message);
  }
}

module.exports = { sendReviewToN8N };