const BOT_TOKEN = '8530197516:AAFH3d_SepVxkGLs_aHANbxssfHSW8w0R1Q';
const CHANNEL_ID = '-1003463551432';
const CHANNEL_LINK = 'https://t.me/spaziocalc';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const update = req.body;

    if (update.message) {
      await handleMessage(update.message);
    }

    if (update.callback_query) {
      await handleCallback(update.callback_query);
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ ok: true });
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';

  if (text.startsWith('/start')) {
    await sendMessage(chatId,
      '🎯 *Добро пожаловать в SPAZIO Calculator!*\n\n' +
      'Для получения доступа к калькулятору:\n' +
      '1️⃣ Подпишитесь на наш канал\n' +
      '2️⃣ Нажмите кнопку "Проверить подписку"\n' +
      '3️⃣ Получите код доступа\n' +
      '4️⃣ Введите код на сайте',
      {
        inline_keyboard: [[
          { text: '📢 Подписаться на канал', url: CHANNEL_LINK }
        ], [
          { text: '✅ Проверить подписку', callback_data: 'check' }
        ]]
      }
    );
  }
}

async function handleCallback(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;

  if (callbackQuery.data === 'check') {
    const isSubscribed = await checkSubscription(userId);

    if (isSubscribed) {
      const code = generateCode();
      
      await sendMessage(chatId,
        '✅ *Отлично! Вы подписаны на канал!*\n\n' +
        `🔑 Ваш код доступа:\n\n\`${code}\`\n\n` +
        '📱 Скопируйте этот код и вставьте на сайте калькулятора.',
        { parse_mode: 'Markdown' }
      );
      
      await answerCallback(callbackQuery.id, '✅ Код отправлен!');
    } else {
      await sendMessage(chatId,
        '❌ *Вы не подписаны на канал!*\n\n' +
        'Сначала подпишитесь, затем нажмите "Проверить подписку" снова.',
        {
          inline_keyboard: [[
            { text: '📢 Подписаться на канал', url: CHANNEL_LINK }
          ], [
            { text: '🔄 Проверить ещё раз', callback_data: 'check' }
          ]],
          parse_mode: 'Markdown'
        }
      );
      
      await answerCallback(callbackQuery.id, '❌ Подписка не найдена');
    }
  }
}

async function checkSubscription(userId) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.ok) {
      const status = data.result.status;
      return ['creator', 'administrator', 'member'].includes(status);
    }
    return false;
  } catch (error) {
    return false;
  }
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SPAZIO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function sendMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = { chat_id: chatId, text: text, ...options };
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function answerCallback(callbackQueryId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text: text })
  });
}
