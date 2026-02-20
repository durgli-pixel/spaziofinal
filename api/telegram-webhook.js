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
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const text = (update.message.text || '').trim();

      // Команда /start
      if (text === '/start' || text.startsWith('/start')) {
        await sendMessage(chatId,
          '🎯 *SPAZIO Calculator - Доступ через Telegram*\n\n' +
          '📋 Инструкция:\n' +
          '1️⃣ Подпишитесь на канал: ' + CHANNEL_LINK + '\n' +
          '2️⃣ Отправьте команду /code\n' +
          '3️⃣ Получите код доступа\n' +
          '4️⃣ Введите код на сайте\n\n' +
          '💡 После подписки отправьте: /code'
        );
      }
      
      // Команда /code
      else if (text === '/code') {
        const isSubscribed = await checkSubscription(userId);

        if (isSubscribed) {
          const code = generateCode();
          
          await sendMessage(chatId,
            '✅ *Отлично! Вы подписаны на канал!*\n\n' +
            '🔑 *Ваш код доступа:*\n\n' +
            '`' + code + '`\n\n' +
            '📱 Скопируйте код и вставьте на сайте калькулятора.\n\n' +
            '🌐 Сайт: spaziocalc.vercel.app'
          );
        } else {
          await sendMessage(chatId,
            '❌ *Вы не подписаны на канал!*\n\n' +
            '1. Подпишитесь: ' + CHANNEL_LINK + '\n' +
            '2. Вернитесь сюда\n' +
            '3. Отправьте: /code\n\n' +
            '💡 Без подписки код не выдаётся!'
          );
        }
      }
      
      // Помощь
      else if (text === '/help') {
        await sendMessage(chatId,
          '📖 *Доступные команды:*\n\n' +
          '/start - Начать работу\n' +
          '/code - Получить код доступа\n' +
          '/help - Эта справка\n\n' +
          '🔗 Канал: ' + CHANNEL_LINK
        );
      }
      
      // Неизвестная команда
      else {
        await sendMessage(chatId,
          '❓ Неизвестная команда.\n\n' +
          'Отправьте /code для получения кода доступа'
        );
      }
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ ok: true });
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
    console.error('Check subscription error:', error);
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

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}
