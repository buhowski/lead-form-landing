const esc = (s = '') =>
    String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]));

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('Missing Telegram environment variables');
        return res.status(500).json({ ok: false, error: 'Server configuration error' });
    }

    const { name, phone, email, siteUrl } = req.body || {};

    if (!name || !phone || !email) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const cleanName = esc(name);
    const cleanPhone = esc(phone);
    const cleanEmail = esc(email);
    const cleanSiteUrl = esc(siteUrl);

    const text = [
        `<b>New Lead from Website</b>`,
        `<b>Source: </b><a href="${cleanSiteUrl}">${cleanSiteUrl}</a>`,
        ``,
        `👤 <b> Name: </b> <code>${cleanName}</code>`,
        `📞 <b> Phone: </b> <code>${cleanPhone}</code>`,
        `✉️ <b> Email: </b> <code>${cleanEmail}</code>`,
    ].join('\n');

    try {
        const tg = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        const data = await tg.json();

        return res.status(tg.ok ? 200 : 502).json({ ok: data.ok });
    } catch (error) {
        console.error('Telegram API error:', error);
        return res.status(500).json({ ok: false });
    }
}