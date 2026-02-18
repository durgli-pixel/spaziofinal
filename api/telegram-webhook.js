import { db } from './firebase-admin.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '-1003463551432';
const CHANNEL_LINK = 'https://t.me/spaziocalc';
const CALCULATOR_URL = 'https://spaziocalc.vercel.app/spazio-calculator.html';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const update = req.body;

    if (update.callback_query) {
      await handleCallback(update.callback_query);
    }

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';

      if (text.startsWith('/start')) {
        await sendMessage(chatId,
          '🎯 Добро пожаловать в SPAZIO Calculator!\n\n' +
          '1️⃣ Подпишитесь на канал\n' +
          '2️⃣ Нажмите "Проверить подписку"',
          {
            inline_keyboard: [[
              { text: '📢 Подписаться', url: CHANNEL_LINK }
            ], [
              { text: '✅ Проверить подписку', callback_data: 'check_subscription' }
            ]]
          }
        );
      }
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: true });
  }
}

async function handleCallback(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data === 'check_subscription') {
    const subscribed = await checkSubscription(userId);

    if (!subscribed) {
      await sendMessage(chatId,
        '❌ Вы не подписаны на канал.',
        {
          inline_keyboard: [[
            { text: '📢 Подписаться', url: CHANNEL_LINK }
          ], [
            { text: '🔄 Проверить снова', callback_data: 'check_subscription' }
          ]]
        }
      );
      return;
    }

    const code = generateAccessCode();

    await db.collection('accessCodes').doc(code).set({
      userId,
      used: false,
      createdAt: Date.now()
    });

    const link = `${CALCULATOR_URL}?code=${code}`;

    await sendMessage(chatId,
      `✅ Подписка подтверждена!\n\n` +
      `🔗 Откройте калькулятор:\n${link}`
    );
  }
}

async function checkSubscription(userId) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${userId}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.ok) {
    const status = data.result.status;
    return ['creator', 'administrator', 'member'].includes(status);
  }

  return false;
}

function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SPAZIO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function sendMessage(chatId, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  };

  if (reply_markup) body.reply_markup = reply_markup;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
