// api/verify-code.js - Проверка кода доступа

export default async function handler(req, res) {
  // Разрешаем кросс-доменные запросы
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  // Парсим тело запроса
  let body = {};
  try {
    body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
  } catch (err) {
    return res.status(400).json({ valid: false, error: 'Invalid JSON' });
  }

  const { code } = body;

  if (!code) {
    return res.status(400).json({ valid: false, error: 'Code required' });
  }

  // Проверка формата кода: SPAZIO-XXXXXX
  const codePattern = /^SPAZIO-[A-Z0-9]{6}$/;

  if (codePattern.test(code)) {
    // Здесь можно подключить реальную проверку в БД / API подписки
    return res.status(200).json({
      valid: true,
      message: 'Access granted'
    });
  } else {
    return res.status(200).json({
      valid: false,
      error: 'Invalid code format'
    });
  }
}
