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
        from: 'SPAZIO Calculator <noreply@spazio.vip>',
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
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="padding:40px;text-align:center;">
        <h1 style="color:#FED631;font-size:48px;margin:0 0 10px 0;">SPAZIO</h1>
        <p style="color:#666;font-size:16px;margin:0;">Calculator</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 40px 40px;text-align:center;">
        <h2 style="color:#1d1d1f;font-size:20px;margin:0 0 20px 0;">Ваш код доступа</h2>
        <div style="background:#FFF9E6;border:3px solid #FED631;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="font-family:Courier,monospace;font-size:32px;font-weight:bold;color:#1d1d1f;margin:0;letter-spacing:2px;">${code}</p>
        </div>
        <p style="color:#666;font-size:14px;margin:20px 0;">
          Введите этот код на сайте<br>
          <strong style="color:#1d1d1f;">spazio.vip</strong>
        </p>
        <p style="color:#856404;font-size:13px;margin:20px 0;padding:10px;background:#FFF9E6;border-radius:6px;">
          ⏱ Бесплатный триал на 30 дней
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px;text-align:center;border-top:1px solid #e5e5e5;">
        <p style="color:#999;font-size:12px;margin:0;">
          Если вы не запрашивали этот код, проигнорируйте это письмо.
        </p>
      </td>
    </tr>
  </table>
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
