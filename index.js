require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Xác thực webhook Facebook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook đã được xác thực');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Xử lý webhook từ Facebook
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Kiểm tra xem đây có phải là sự kiện từ Facebook không
    if (body.object === 'page') {
      // Gửi dữ liệu đến n8n webhook
      await axios.post(process.env.N8N_WEBHOOK_URL, body);
      
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Lỗi khi xử lý webhook:', error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
}); 