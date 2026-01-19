const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');
const QRCode = require('qrcode');

// --- 1. إعدادات البوت ---
// تنبيه أمني: يفضل وضع التوكين في Environment Variables في Netlify
const BOT_TOKEN = "8074252682:AAEVcKbV4oAz4nY44Pin6TnpsRuV8N74nds"; 
const bot = new Telegraf(BOT_TOKEN);

// --- 2. دوال الخدمات (Logic Layer) ---

// أ. محلل الرقم القومي
const govCodes = {
    '01': 'القاهرة', '02': 'الإسكندرية', '03': 'بورسعيد', '04': 'السويس', 
    '11': 'دمياط', '12': 'الدقهلية', '13': 'الشرقية', '14': 'القليوبية',
    '15': 'كفر الشيخ', '16': 'الغربية', '17': 'المنوفية', '18': 'البحيرة',
    '19': 'الإسماعيلية', '21': 'الجيزة', '22': 'بني سويف', '23': 'الفيوم',
    '24': 'المنيا', '25': 'أسيوط', '26': 'سوهاج', '27': 'قنا',
    '28': 'أسوان', '29': 'الأقصر', '31': 'البحر الأحمر', '32': 'الوادي الجديد',
    '33': 'مطروح', '34': 'شمال سيناء', '35': 'جنوب سيناء', '88': 'خارج الجمهورية'
};

function analyzeID(id) {
    const century = id[0];
    const year = id.substring(1, 3);
    const month = id.substring(3, 5);
    const day = id.substring(5, 7);
    const govCode = id.substring(7, 9);
    const genderDigit = id.substring(12, 13);

    let fullYear = (century == 2 ? '19' : '20') + year;
    let gender = (genderDigit % 2 !== 0) ? 'ذكر 👨' : 'أنثى 👩';
    let gov = govCodes[govCode] || 'غير معروف';

    return `🇪🇬 *تحليل الرقم القومي*\n\n📅 تاريخ الميلاد: ${day}/${month}/${fullYear}\n📍 المحافظة: ${gov}\n👤 النوع: ${gender}`;
}

// ب. أدوات الأمان (كلمات السر)
function checkPasswordStrength(password) {
    let score = 0;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return "🔴 ضعيفة جداً - ينقصها (أرقام، رموز، حروف كبيرة).";
    if (score === 3 || score === 4) return "🟡 متوسطة - يمكن تحسينها.";
    return "🟢 قوية جداً - (كم سنة للكسر؟ قرون!)"; // محاكاة للنص المطلوب
}

function generatePassword() {
    return crypto.randomBytes(8).toString('base64').slice(0, 12) + "#1A";
}

// ج. أدوات المطورين
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `RGB: rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

function minifyCSS(css) {
    return css.replace(/\s+/g, ' ').replace(/{\s/g, '{').replace(/;\s/g, ';').trim();
}

// --- 3. واجهة المستخدم (القائمة الرئيسية) ---
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('🇪🇬 تحليل رقم قومي', 'btn_id'), Markup.button.callback('🔐 أمان وكلمات سر', 'btn_sec')],
    [Markup.button.callback('🛠️ أدوات مطورين', 'btn_dev'), Markup.button.callback('🎲 قرعة وقرار', 'btn_rand')],
    [Markup.button.callback('📱 QR Code', 'btn_qr'), Markup.button.callback('📝 مقارنة نصوص', 'btn_diff')],
    [Markup.button.callback('🤖 المساعد الذكي', 'btn_ai')]
]);

// --- 4. معالجة الأوامر والرسائل ---

bot.start((ctx) => {
    ctx.reply(`أهلاً بك يا ${ctx.from.first_name} في بوت الخدمات الشامل (AboElfadl Bot) 🚀\nاختر خدمة من القائمة:`, mainMenu);
});

// معالجة الأزرار
bot.action('btn_id', (ctx) => ctx.reply('✍️ أرسل الرقم القومي (14 رقم) الآن:'));
bot.action('btn_sec', (ctx) => ctx.reply('اختر:', Markup.inlineKeyboard([
    [Markup.button.callback('توليد كلمة سر', 'act_gen_pass')],
    [Markup.button.callback('فحص كلمة سر', 'act_check_pass')],
    [Markup.button.callback('تشفير MD5/Base64', 'act_hash')]
])));
bot.action('act_gen_pass', (ctx) => ctx.reply(`🔐 كلمة السر المقترحة:\n\`${generatePassword()}\``, { parse_mode: 'Markdown' }));
bot.action('act_check_pass', (ctx) => ctx.reply('أرسل كلمة السر التي تريد فحص قوتها (لن يتم حفظها):'));
bot.action('act_hash', (ctx) => ctx.reply('أرسل النص مسبوقاً بالأمر:\n/md5 text\n/base64 text'));

bot.action('btn_dev', (ctx) => ctx.reply('أدوات المطورين:\n1. أرسل كود لون Hex (#ff0000) للتحويل.\n2. أرسل كود CSS لتصغيره (Minify).'));
bot.action('btn_rand', (ctx) => ctx.reply('للقرعة: أرسل /pick خيار1, خيار2, خيار3\nلرمز OTP: أرسل /pass'));
bot.action('btn_qr', (ctx) => ctx.reply('📷 أرسل أي نص أو رابط لتحويله إلى QR Code.', { reply_markup: { force_reply: true } }));
bot.action('btn_diff', (ctx) => ctx.reply('أرسل النصين للمقارنة بهذا الشكل:\n/diff النص الأول | النص الثاني'));
bot.action('btn_ai', (ctx) => ctx.reply('🤖 أنا المساعد الآلي. اسألني عن (الأسعار، العنوان، الخدمات) وسأرد عليك فوراً.'));

// الموجه الذكي للنصوص (Smart Router)
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    // 1. كشف الرقم القومي
    if (/^\d{14}$/.test(text)) {
        return ctx.reply(analyzeID(text));
    }

    // 2. كشف كود Hex
    if (/^#([0-9A-F]{3}){1,2}$/i.test(text)) {
        const rgb = hexToRgb(text);
        if (rgb) return ctx.reply(`🎨 ${rgb}`);
    }

    // 3. أوامر التشفير
    if (text.startsWith('/md5 ')) {
        const content = text.replace('/md5 ', '');
        const hash = crypto.createHash('md5').update(content).digest('hex');
        return ctx.reply(`🔒 MD5:\n\`${hash}\``, { parse_mode: 'Markdown' });
    }
    if (text.startsWith('/base64 ')) {
        const content = text.replace('/base64 ', '');
        const encoded = Buffer.from(content).toString('base64');
        return ctx.reply(`📄 Base64:\n\`${encoded}\``, { parse_mode: 'Markdown' });
    }

    // 4. القرعة وال OTP
    if (text.startsWith('/pick ')) {
        const options = text.replace('/pick ', '').split(/,|،/);
        const winner = options[Math.floor(Math.random() * options.length)].trim();
        return ctx.reply(`🎉 الفائز هو: *${winner}*`, { parse_mode: 'Markdown' });
    }
    if (text === '/pass') {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return ctx.reply(`🔑 رمز التحقق المؤقت: \`${otp}\``, { parse_mode: 'Markdown' });
    }

    // 5. مقارنة النصوص
    if (text.startsWith('/diff ')) {
        const parts = text.replace('/diff ', '').split('|');
        if (parts.length < 2) return ctx.reply('⚠️ الصيغة خطأ. استخدم: /diff نص1 | نص2');
        const str1 = parts[0].trim();
        const str2 = parts[1].trim();
        const match = str1 === str2 ? "✅ متطابقان تماماً (100%)" : "❌ مختلفان";
        return ctx.reply(`📝 نتيجة المقارنة:\n${match}\n\nالنص 1: ${str1.length} حرف\nالنص 2: ${str2.length} حرف`);
    }

    // 6. QR Code (إذا كان رداً على طلب QR)
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.text.includes('QR Code')) {
        try {
            const url = await QRCode.toDataURL(text);
            const base64Data = url.replace(/^data:image\/png;base64,/, "");
            return ctx.replyWithPhoto({ source: Buffer.from(base64Data, 'base64') });
        } catch (err) {
            return ctx.reply('حدث خطأ أثناء إنشاء الصورة.');
        }
    }

    // 7. تصغير CSS (كشف تلقائي)
    if (text.includes('{') && text.includes('}') && text.includes(';')) {
        return ctx.reply(`📦 CSS Minified:\n\`${minifyCSS(text)}\``, { parse_mode: 'Markdown' });
    }

    // 8. فحص كلمة السر (تلقائي لو لم يطابق ما سبق)
    if (!text.startsWith('/')) {
        // نعتبره فحص باسوورد أو سؤال للذكاء الاصطناعي
        // محاكاة AI بسيط
        if (text.includes('سعر') || text.includes('بكتم')) return ctx.reply('💰 الأسعار تحدد حسب المشروع. تواصل مع الإدارة.');
        if (text.includes('عنوان') || text.includes('مكان')) return ctx.reply('📍 القاهرة، مصر. ونعمل أونلاين.');
        
        // فحص باسوورد
        return ctx.reply(`تحليل النص/كلمة السر:\n${checkPasswordStrength(text)}`);
    }
});

// --- 5. تهيئة Webhook لـ Netlify ---
exports.handler = async (event, context) => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: 'OK' };
    } catch (e) {
        console.error('Error:', e);
        return { statusCode: 400, body: 'Error' };
    }
};
