// index.js
// Minimal WhatsApp Cloud API Webhook - Railway Ready

import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('WhatsApp AI Bot is running');
});

// Webhook verification (Meta)
app.get('/webhook/whatsapp', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive messages
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const from = message.from; // phone number
    const text = message.text.body;

    console.log('Incoming message:', from, text);

    // TEMP: auto-reply
    await sendWhatsAppMessage(from, `Terima kasih sudah menghubungi Agen Jabal Tour. Saya akan bantu dengan senang hati. 😊`);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

async function sendWhatsAppMessage(to, body) {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body }
    })
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
