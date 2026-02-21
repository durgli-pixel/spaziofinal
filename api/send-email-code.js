const RESEND_API_KEY = 're_Mi7NkhRF_JVvSPhztkXvte136JwPkCg9C';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    console.log('📧 Email request received for:', email);

    if (!email || !isValidEmail(email)) {
      console.log('❌ Invalid email:', email);
      return res.status(400).json({ success: false, error: 'Некорректный email' });
    }

    const code = generateCode();
    console.log('🔑 Generated code:', code);

    console.log('📤 Attempting to send via Resend...');
    console.log('API Key present:', RESEND_API_KEY ? 'YES' : 'NO');
    console.log('From address:', 'SPAZIO Calculator <noreply@send.spazio.vip>');

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SPAZIO Calculator <noreply@send.spazio.vip>',
        to: [email],
        subject: 'Ваш код доступа SPAZIO Calculator',
        html: getEmailHTML(code)
      })
    });

    console.log('📥 Resend response status:', resendResponse.status);
    
    const data = await resendResponse.json();
    console.log('📥 Resend response data:', JSON.stringify(data));

    if (resendResponse.ok) {
      console.log('✅ Email sent successfully!');
      return res.json({ 
        success: true, 
        message: '✅ Код отправлен на ' + email + '!'
      });
    } else {
      console.error('❌ Resend API error:', data);
      return res.json({ 
        success: true, 
        message: '⚠️ Email не отправился, но вот ваш код:',
        code: code,
        showCode: true,
        debug: {
          status: resendResponse.status,
          error: data
        }
      });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    const code = generateCode();
    return res.json({ 
      success: true, 
      message: '⚠️ Вот ваш код:',
      code: code,
      showCode: true,
      debug: {
        error: error.message
      }
    });
  }
}

function getEmailHTML(code) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;background:#fff;font-family:-apple-system,sans-serif">
    <div style="text-align:center;margin-bottom:30px">
      <div style="background:#FED631;width:80px;height:80px;margin:0 auto 20px;border-radius:18px;display:inline-flex;align-items:center;justify-content:center">
        <span style="font-size:36px;font-weight:800;color:#000">SP</span>
      </div>
      <h1 style="color:#1d1d1f;font-size:28px;margin:0">SPAZIO Calculator</h1>
    </div>
    <div style="background:#f9f9f9;border-radius:16px;padding:32px;text-align:center">
      <h2 style="color:#1d1d1f;font-size:20px;margin:0 0 24px">Ваш код доступа</h2>
      <div style="background:#fff;border:2px solid #FED631;border-radius:12px;padding:24px;margin:24px 0">
        <div style="font-family:monospace;font-size:28px;letter-spacing:4px;color:#1d1d1f;font-weight:bold">${code}</div>
      </div>
      <p style="color:#666;font-size:15px;margin:24px 0 0">
        Введите код на сайте<br><strong style="color:#1d1d1f">spazio.vip</strong>
      </p>
      <div style="background:#FFF9E6;border-radius:8px;padding:16px;margin:24px 0 0">
        <p style="color:#856404;font-size:13px;margin:0">⏱ Бесплатный триал на 30 дней</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SPAZIO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
