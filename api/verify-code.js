// api/verify-code.js - Проверка кода доступа из Telegram

import { accessCodes } from './telegram-webhook.js';

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

  let body = {};
  try {
    body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ valid: false, error: 'Invalid JSON' });
  }

  const { code } = body;

  if (!code) {
    return res.status(400).json({ valid: false, error: 'Code required' });
  }

  // Проверяем формат кода
  const codePattern = /^SPAZIO-[A-Z0-9]{6}$/;
  if (!codePattern.test(code)) {
    return res.status(200).json({ valid: false, error: 'Invalid code format' });
  }

  // Проверяем, есть ли код в хранилище
  const record = accessCodes.get(code);

  if (!record) {
    return res.status(200).json({ valid: false, error: 'Invalid or used code' });
  }

  // ⚡ Одноразовое использование кода
  accessCodes.delete(code);

  return res.status(200).json({
    valid: true,
    message: 'Access granted'
  });
}
