/**
 * ╔══════════════════════════════════╗
 * ║   𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓 - 𝐕𝟑.𝟎       ║
 * ║   Owner : Ahmad                  ║
 * ║   WA    : 923044975027           ║
 * ║   Telegram: @yourstepdady9      ║
 * ╚══════════════════════════════════╝
 */

require('dotenv').config();
require('./setting/config');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const fs2 = require('fs');
const path = require('path');
const chalk = require('chalk');
const { sleep } = require('./utils');
const { BOT_TOKEN } = require('./token');
const { autoLoadPairs } = require('./autoload');
const axios = require('axios');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const adminFilePath = path.join(__dirname, 'kingbadboitimewisher', 'admin.json');
let adminIDs = [];
const userStates = new Map();
const OWNER_NUMBER = '923044975027';
const OWNER_TG = 'https://t.me/yourstepdady9';
const OWNER_WA = `https://wa.me/${OWNER_NUMBER}`;

// ═══════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════

const exists = async (filePath) => {
  try { await fs.access(filePath); return true; } catch { return false; }
};

const loadAdminIDs = async () => {
  const ownerID = '7943215966';
  const defaultAdmins = [ownerID];
  if (!(await exists(adminFilePath))) {
    await fs.writeFile(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
    adminIDs = defaultAdmins;
  } else {
    try {
      const raw = await fs.readFile(adminFilePath, 'utf8');
      adminIDs = JSON.parse(raw);
    } catch { adminIDs = defaultAdmins; }
  }
  console.log('📥 Loaded Admin IDs:', adminIDs);
};

const isAdmin = (userId) => adminIDs.includes(String(userId));

// ═══════════════════════════════════════
//  AUTO LOAD
// ═══════════════════════════════════════

let isShuttingDown = false;
let isAutoLoadRunning = true;

const runAutoLoad = async () => {
  if (isAutoLoadRunning || isShuttingDown) return;
  isAutoLoadRunning = true;
  try {
    console.log('⏱️ INITIATING AUTO-LOAD');
    await autoLoadPairs();
    console.log('✅ AUTO-LOAD COMPLETED');
  } catch (e) {
    console.error('❌ AUTO-LOAD FAILED:', e);
  } finally { isAutoLoadRunning = false; }
};

const startAutoLoadLoop = () => {
  runAutoLoad();
  setInterval(runAutoLoad, 60 * 60 * 1000);
};
startAutoLoadLoop();

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  bot.stopPolling();
  process.exit(0);
};

// ═══════════════════════════════════════
//  CHANNEL CHECK
// ═══════════════════════════════════════

const checkUserJoinedChannels = async (userId) => {
  const channels = ['@buntyminibot'];
  for (const channel of channels) {
    try {
      const member = await bot.getChatMember(channel, userId);
      if (['left', 'kicked'].includes(member.status)) return false;
    } catch { return false; }
  }
  return true;
};

const sendChannelsRequiredMessage = async (chatId) => {
  return bot.sendMessage(chatId,
    `╔═══════════════════════╗\n` +
    `║  🚨 *𝐉𝐎𝐈𝐍 𝐑𝐄𝐐𝐔𝐈𝐑𝐄𝐃* 🚨  ║\n` +
    `╚═══════════════════════╝\n\n` +
    `⚡ Join our official channel\n` +
    `to use *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓* 🔥`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 Official Channel', url: 'https://t.me/ahmadotpzone' }],
          [{ text: '✅ 𝐈 𝐇𝐚𝐯𝐞 𝐉𝐨𝐢𝐧𝐞𝐝', callback_data: 'check_join' }]
        ]
      }
    }
  );
};

const sendGroupMessage = async (chatId, replyToMessageId = null) => {
  const botInfo = await bot.getMe();
  const botUsername = botInfo.username;
  const message =
    `╭━━━━━━━━━━━━━━━━━╮\n` +
    `┃  🔥 *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓*  ┃\n` +
    `╰━━━━━━━━━━━━━━━━━╯\n\n` +
    `➤ Use me in *DM only* 👇`;
  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '🚀 𝐒𝐓𝐀𝐑𝐓 𝐍𝐎𝐖', url: `https://t.me/${botUsername}?start=pair` }]]
    }
  };
  if (replyToMessageId) options.reply_to_message_id = replyToMessageId;
  return bot.sendMessage(chatId, message, options);
};

// ═══════════════════════════════════════
//  /start COMMAND
// ═══════════════════════════════════════

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  if (isGroup) return sendGroupMessage(chatId, msg.message_id);

  const name = msg.from.first_name || 'User';

  await bot.sendPhoto(chatId, 'https://files.catbox.moe/y59a6o.jpg', {
    caption:
      `╔══════════════════════════╗\n` +
      `║  ⚡ *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓 𝐕𝟑* ⚡  ║\n` +
      `╚══════════════════════════╝\n\n` +
      `👋 𝐖𝐞𝐥𝐜𝐨𝐦𝐞, *${name}!*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 /pair — Link WhatsApp\n` +
      `❌ /unpair — Unlink WhatsApp\n` +
      `📋 /menu — Full Command Menu\n` +
      `ℹ️ /info — Bot Information\n` +
      `👑 /owner — Contact Owner\n` +
      `🌐 /alive — Bot Status\n` +
      `🎲 /roll — Random Number\n` +
      `💬 /quote — Random Quote\n` +
      `🌦️ /weather <city> — Weather\n` +
      `🕒 /time — Current Time\n` +
      `🧮 /calc <expr> — Calculator\n` +
      `🔤 /fancy <text> — Fancy Text\n` +
      `😂 /joke — Random Joke\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔥 *Powered by AHMAD* 💀`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔗 𝐏𝐚𝐢𝐫 𝐍𝐨𝐰', callback_data: 'start_pair' }, { text: '📋 𝐌𝐞𝐧𝐮', callback_data: 'show_menu' }],
        [{ text: '👑 𝐎𝐰𝐧𝐞𝐫 - 𝐀𝐇𝐌𝐀𝐃', url: OWNER_TG }],
        [{ text: '📢 𝐖𝐀 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝟏', url: 'https://whatsapp.com/channel/0029VbCLBN8EwEk5DUkDta0K' }, { text: '📢 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝟐', url: 'https://whatsapp.com/channel/0029VbCLBN8EwEk5DUkDta0K' }],
        [{ text: '💬 𝐉𝐨𝐢𝐧 𝐆𝐫𝐨𝐮𝐩', url: 'https://chat.whatsapp.com/LQDL3chA5ZAKirFWz6I8KO' }]
      ]
    }
  });
});

// ═══════════════════════════════════════
//  /menu COMMAND
// ═══════════════════════════════════════

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `╔══════════════════════════════╗\n` +
    `║  🗂️ *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔*  ║\n` +
    `╚══════════════════════════════╝\n\n` +
    `━━━━ 🔗 *𝐏𝐀𝐈𝐑𝐈𝐍𝐆* ━━━━\n` +
    `› /pair <number> — 𝑳𝒊𝒏𝒌 𝑾𝒉𝒂𝒕𝒔𝑨𝒑𝒑\n` +
    `› /unpair <number> — 𝑼𝒏𝒍𝒊𝒏𝒌 𝑾𝒉𝒂𝒕𝒔𝑨𝒑𝒑\n\n` +
    `━━━━ 🤖 *𝐁𝐎𝐓 𝐈𝐍𝐅𝐎* ━━━━\n` +
    `› /info — 𝑩𝒐𝒕 𝑰𝒏𝒇𝒐𝒓𝒎𝒂𝒕𝒊𝒐𝒏\n` +
    `› /alive — 𝑺𝒕𝒂𝒕𝒖𝒔 𝑪𝒉𝒆𝒄𝒌\n` +
    `› /owner — 𝑪𝒐𝒏𝒕𝒂𝒄𝒕 𝑶𝒘𝒏𝒆𝒓\n\n` +
    `━━━━ 🎮 *𝐅𝐔𝐍 & 𝐓𝐎𝐎𝐋𝐒* ━━━━\n` +
    `› /roll — 🎲 𝑹𝒂𝒏𝒅𝒐𝒎 𝑵𝒖𝒎𝒃𝒆𝒓\n` +
    `› /joke — 😂 𝑹𝒂𝒏𝒅𝒐𝒎 𝑱𝒐𝒌𝒆\n` +
    `› /quote — 💬 𝑰𝒏𝒔𝒑𝒊𝒓𝒆 𝑸𝒖𝒐𝒕𝒆\n` +
    `› /calc <expr> — 🧮 𝑪𝒂𝒍𝒄𝒖𝒍𝒂𝒕𝒐𝒓\n` +
    `› /weather <city> — 🌦️ 𝑾𝒆𝒂𝒕𝒉𝒆𝒓\n` +
    `› /time — 🕒 𝑪𝒖𝒓𝒓𝒆𝒏𝒕 𝑻𝒊𝒎𝒆\n` +
    `› /fancy <text> — 🔤 𝑭𝒂𝒏𝒄𝒚 𝑻𝒆𝒙𝒕\n` +
    `› /flip — 🪙 𝑪𝒐𝒊𝒏 𝑭𝒍𝒊𝒑\n` +
    `› /8ball <q> — 🎱 𝑴𝒂𝒈𝒊𝒄 𝑩𝒂𝒍𝒍\n` +
    `› /password — 🔐 𝑷𝒂𝒔𝒔 𝑮𝒆𝒏\n` +
    `› /encode <text> — 🔒 𝑩𝒂𝒔𝒆𝟔𝟒\n` +
    `› /decode <text> — 🔓 𝑫𝒆𝒄𝒐𝒅𝒆\n\n` +
    `━━━━ 👑 *𝐀𝐃𝐌𝐈𝐍 𝐎𝐍𝐋𝐘* ━━━━\n` +
    `› /broadcast <msg> — 📡 𝑺𝒆𝒏𝒅 𝑨𝒍𝒍\n` +
    `› /stats — 📊 𝑩𝒐𝒕 𝑺𝒕𝒂𝒕𝒔\n\n` +
    `🔥 *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓* | Owner: 𝐀𝐇𝐌𝐀𝐃 💀`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 𝐏𝐚𝐢𝐫', callback_data: 'start_pair' }, { text: '👑 𝐎𝐰𝐧𝐞𝐫', url: OWNER_TG }],
          [{ text: '📢 𝐖𝐀 𝐂𝐡𝐚𝐧𝐧𝐞𝐥', url: 'https://whatsapp.com/channel/0029VbCLBN8EwEk5DUkDta0K' }]
        ]
      }
    }
  );
});

// ═══════════════════════════════════════
//  /info COMMAND
// ═══════════════════════════════════════

bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  await bot.sendMessage(chatId,
    `╔═══════════════════════════╗\n` +
    `║  🤖 *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎*  ║\n` +
    `╚═══════════════════════════╝\n\n` +
    `👑 *Owner:* 𝑨𝒉𝒎𝒂𝒅\n` +
    `📱 *WA:* wa.me/${OWNER_NUMBER}\n` +
    `✈️ *Telegram:* @yourstepdady9\n` +
    `🔢 *Version:* 𝑽𝟑.𝟎\n` +
    `⚙️ *Platform:* Node.js\n` +
    `⏱️ *Uptime:* ${h}h ${m}m ${s}s\n` +
    `🔥 *Status:* 𝑶𝒏𝒍𝒊𝒏𝒆 ✅\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Powered by_ *𝐀𝐇𝐌𝐀𝐃* 💀`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👑 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐎𝐰𝐧𝐞𝐫', url: OWNER_TG }],
          [{ text: '📱 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐎𝐰𝐧𝐞𝐫', url: OWNER_WA }]
        ]
      }
    }
  );
});

// ═══════════════════════════════════════
//  /alive COMMAND
// ═══════════════════════════════════════

bot.onText(/\/alive/, async (msg) => {
  const chatId = msg.chat.id;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);

  await bot.sendMessage(chatId,
    `╔══════════════════════╗\n` +
    `║  ✅ *𝐁𝐎𝐓 𝐈𝐒 𝐀𝐋𝐈𝐕𝐄!* ✅  ║\n` +
    `╚══════════════════════╝\n\n` +
    `🤖 *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓* is running 🔥\n` +
    `⏱️ *Uptime:* ${h}h ${m}m\n` +
    `💚 *Ping:* Online\n\n` +
    `_Made with ❤️ by_ *𝐀𝐇𝐌𝐀𝐃* 💀`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /owner COMMAND
// ═══════════════════════════════════════

bot.onText(/\/owner/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `╔══════════════════════════╗\n` +
    `║  👑 *𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎* 👑  ║\n` +
    `╚══════════════════════════╝\n\n` +
    `🧑 *Name:* 𝑨𝒉𝒎𝒂𝒅\n` +
    `📱 *WhatsApp:* +${OWNER_NUMBER}\n` +
    `✈️ *Telegram:* @yourstepdady9\n\n` +
    `_Feel free to contact for support_ 🔥`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✈️ 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦', url: OWNER_TG }, { text: '📱 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩', url: OWNER_WA }]
        ]
      }
    }
  );
});

// ═══════════════════════════════════════
//  /roll COMMAND
// ═══════════════════════════════════════

bot.onText(/\/roll/, async (msg) => {
  const chatId = msg.chat.id;
  const num = Math.floor(Math.random() * 100) + 1;
  await bot.sendMessage(chatId,
    `╔═══════════════════╗\n` +
    `║  🎲 *𝐃𝐈𝐂𝐄 𝐑𝐎𝐋𝐋*  ║\n` +
    `╚═══════════════════╝\n\n` +
    `🎯 *Result:* \`${num}\`\n` +
    `_You rolled a ${num}!_`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /flip COMMAND
// ═══════════════════════════════════════

bot.onText(/\/flip/, async (msg) => {
  const chatId = msg.chat.id;
  const result = Math.random() < 0.5 ? '🪙 𝐇𝐄𝐀𝐃𝐒' : '🪙 𝐓𝐀𝐈𝐋𝐒';
  await bot.sendMessage(chatId,
    `╔═══════════════════╗\n` +
    `║  🪙 *𝐂𝐎𝐈𝐍 𝐅𝐋𝐈𝐏*  ║\n` +
    `╚═══════════════════╝\n\n` +
    `🎯 *Result:* *${result}*`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /joke COMMAND
// ═══════════════════════════════════════

const jokes = [
  "Why don't scientists trust atoms?\n_Because they make up everything!_ 😂",
  "I told my wife she was drawing her eyebrows too high.\n_She looked surprised!_ 😂",
  "Why do programmers prefer dark mode?\n_Because light attracts bugs!_ 🐛😂",
  "Why did the scarecrow win an award?\n_He was outstanding in his field!_ 😂",
  "I'm reading a book about anti-gravity.\n_It's impossible to put down!_ 😂",
  "Why can't you give Elsa a balloon?\n_She'll let it go!_ 😂",
  "What do you call a fish without eyes?\n_A fsh!_ 🐟😂",
  "Why did the math book look so sad?\n_It had too many problems!_ 😂"
];

bot.onText(/\/joke/, async (msg) => {
  const chatId = msg.chat.id;
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await bot.sendMessage(chatId,
    `╔═══════════════════╗\n` +
    `║  😂 *𝐑𝐀𝐍𝐃𝐎𝐌 𝐉𝐎𝐊𝐄*  ║\n` +
    `╚═══════════════════╝\n\n` +
    `${joke}\n\n` +
    `_Enjoy!_ 🔥`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '😂 𝐀𝐧𝐨𝐭𝐡𝐞𝐫 𝐉𝐨𝐤𝐞', callback_data: 'another_joke' }]]
      }
    }
  );
});

// ═══════════════════════════════════════
//  /quote COMMAND
// ═══════════════════════════════════════

const quotes = [
  { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
  { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
  { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "Dream big and dare to fail.", a: "Norman Vaughan" },
  { q: "Hard work beats talent when talent doesn't work hard.", a: "Tim Notke" },
  { q: "In the middle of every difficulty lies opportunity.", a: "Albert Einstein" }
];

bot.onText(/\/quote/, async (msg) => {
  const chatId = msg.chat.id;
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  await bot.sendMessage(chatId,
    `╔══════════════════════════╗\n` +
    `║  💬 *𝐈𝐍𝐒𝐏𝐈𝐑𝐀𝐓𝐈𝐎𝐍 𝐐𝐔𝐎𝐓𝐄*  ║\n` +
    `╚══════════════════════════╝\n\n` +
    `❝ _${q.q}_ ❞\n\n` +
    `— *${q.a}* 🔥`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /time COMMAND
// ═══════════════════════════════════════

bot.onText(/\/time/, async (msg) => {
  const chatId = msg.chat.id;
  const now = new Date();
  const pkt = now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'medium' });
  const utc = now.toUTCString();
  await bot.sendMessage(chatId,
    `╔═════════════════════════╗\n` +
    `║  🕒 *𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐓𝐈𝐌𝐄 𝐙𝐎𝐍𝐄𝐒*  ║\n` +
    `╚═════════════════════════╝\n\n` +
    `🇵🇰 *Pakistan (PKT):*\n\`${pkt}\`\n\n` +
    `🌐 *UTC:*\n\`${utc}\`\n\n` +
    `_Powered by_ *𝐀𝐇𝐌𝐀𝐃* 🔥`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /calc COMMAND
// ═══════════════════════════════════════

bot.onText(/\/calc (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const expr = match[1].trim();
  try {
    const safe = expr.replace(/[^0-9+\-*/.()% ]/g, '');
    if (!safe) throw new Error('Invalid');
    // eslint-disable-next-line no-eval
    const result = Function(`"use strict"; return (${safe})`)();
    await bot.sendMessage(chatId,
      `╔═══════════════════╗\n` +
      `║  🧮 *𝐂𝐀𝐋𝐂𝐔𝐋𝐀𝐓𝐎𝐑*  ║\n` +
      `╚═══════════════════╝\n\n` +
      `📥 *Input:* \`${expr}\`\n` +
      `📤 *Result:* \`${result}\`\n\n` +
      `_Calculated by_ *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃* 🔥`,
      { parse_mode: 'Markdown' }
    );
  } catch {
    await bot.sendMessage(chatId, '❌ *Invalid expression!*\n\nExample: `/calc 5 * 8 + 2`', { parse_mode: 'Markdown' });
  }
});

// ═══════════════════════════════════════
//  /fancy COMMAND
// ═══════════════════════════════════════

const fancyMap = {
  a:'𝒂',b:'𝒃',c:'𝒄',d:'𝒅',e:'𝒆',f:'𝒇',g:'𝒈',h:'𝒉',i:'𝒊',j:'𝒋',
  k:'𝒌',l:'𝒍',m:'𝒎',n:'𝒏',o:'𝒐',p:'𝒑',q:'𝒒',r:'𝒓',s:'𝒔',t:'𝒕',
  u:'𝒖',v:'𝒗',w:'𝒘',x:'𝒙',y:'𝒚',z:'𝒛',
  A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',G:'𝑮',H:'𝑯',I:'𝑰',J:'𝑱',
  K:'𝑲',L:'𝑳',M:'𝑴',N:'𝑵',O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',S:'𝑺',T:'𝑻',
  U:'𝑼',V:'𝑽',W:'𝑾',X:'𝑿',Y:'𝒀',Z:'𝒁'
};

bot.onText(/\/fancy (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const fancy = text.split('').map(c => fancyMap[c] || c).join('');
  await bot.sendMessage(chatId,
    `╔════════════════════╗\n` +
    `║  🔤 *𝐅𝐀𝐍𝐂𝐘 𝐓𝐄𝐗𝐓*  ║\n` +
    `╚════════════════════╝\n\n` +
    `📥 *Input:* \`${text}\`\n` +
    `✨ *Fancy:* ${fancy}\n\n` +
    `_Made by_ *𝐀𝐇𝐌𝐀𝐃* 🔥`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /8ball COMMAND
// ═══════════════════════════════════════

const ballAnswers = [
  '✅ *Yes, definitely!*', '✅ *It is certain.*', '✅ *Without a doubt!*',
  '🤔 *Maybe...*', '🤔 *Ask again later.*', '🤔 *Cannot predict now.*',
  '❌ *Don\'t count on it.*', '❌ *My reply is no.*', '❌ *Very doubtful.*'
];

bot.onText(/\/8ball (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const question = match[1];
  const answer = ballAnswers[Math.floor(Math.random() * ballAnswers.length)];
  await bot.sendMessage(chatId,
    `╔══════════════════════╗\n` +
    `║  🎱 *𝐌𝐀𝐆𝐈𝐂 𝟖 𝐁𝐀𝐋𝐋*  ║\n` +
    `╚══════════════════════╝\n\n` +
    `❓ *Question:* _${question}_\n\n` +
    `🎱 *Answer:* ${answer}`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /password COMMAND
// ═══════════════════════════════════════

bot.onText(/\/password/, async (msg) => {
  const chatId = msg.chat.id;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const pass = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  await bot.sendMessage(chatId,
    `╔═══════════════════════╗\n` +
    `║  🔐 *𝐏𝐀𝐒𝐒𝐖𝐎𝐑𝐃 𝐆𝐄𝐍*  ║\n` +
    `╚═══════════════════════╝\n\n` +
    `🔑 *Generated Password:*\n` +
    `\`${pass}\`\n\n` +
    `⚠️ _Keep this safe! Don't share._\n` +
    `_By_ *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃* 🔥`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /encode & /decode COMMANDS
// ═══════════════════════════════════════

bot.onText(/\/encode (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const encoded = Buffer.from(text).toString('base64');
  await bot.sendMessage(chatId,
    `╔════════════════════╗\n` +
    `║  🔒 *𝐁𝐀𝐒𝐄𝟔𝟒 𝐄𝐍𝐂𝐎𝐃𝐄*  ║\n` +
    `╚════════════════════╝\n\n` +
    `📥 *Input:* \`${text}\`\n` +
    `🔒 *Encoded:*\n\`${encoded}\``,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/decode (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf8');
    await bot.sendMessage(chatId,
      `╔════════════════════╗\n` +
      `║  🔓 *𝐁𝐀𝐒𝐄𝟔𝟒 𝐃𝐄𝐂𝐎𝐃𝐄*  ║\n` +
      `╚════════════════════╝\n\n` +
      `📥 *Input:* \`${match[1]}\`\n` +
      `🔓 *Decoded:* \`${decoded}\``,
      { parse_mode: 'Markdown' }
    );
  } catch {
    bot.sendMessage(chatId, '❌ *Invalid Base64 string!*', { parse_mode: 'Markdown' });
  }
});

// ═══════════════════════════════════════
//  /weather COMMAND
// ═══════════════════════════════════════

bot.onText(/\/weather (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = match[1].trim();
  try {
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const d = res.data;
    const curr = d.current_condition[0];
    const area = d.nearest_area[0];
    const cityName = area.areaName[0].value;
    const country = area.country[0].value;
    const tempC = curr.temp_C;
    const tempF = curr.temp_F;
    const desc = curr.weatherDesc[0].value;
    const humidity = curr.humidity;
    const wind = curr.windspeedKmph;
    const feels = curr.FeelsLikeC;

    await bot.sendMessage(chatId,
      `╔══════════════════════════╗\n` +
      `║  🌦️ *𝐖𝐄𝐀𝐓𝐇𝐄𝐑 𝐑𝐄𝐏𝐎𝐑𝐓*  ║\n` +
      `╚══════════════════════════╝\n\n` +
      `📍 *${cityName}, ${country}*\n\n` +
      `🌡️ *Temp:* ${tempC}°C / ${tempF}°F\n` +
      `🤔 *Feels Like:* ${feels}°C\n` +
      `☁️ *Condition:* ${desc}\n` +
      `💧 *Humidity:* ${humidity}%\n` +
      `💨 *Wind:* ${wind} km/h\n\n` +
      `_By_ *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃* 🔥`,
      { parse_mode: 'Markdown' }
    );
  } catch {
    await bot.sendMessage(chatId, `❌ *City not found!*\n\nUsage: /weather Karachi`, { parse_mode: 'Markdown' });
  }
});

// ═══════════════════════════════════════
//  /stats COMMAND (Admin Only)
// ═══════════════════════════════════════

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (!isAdmin(userId)) {
    return bot.sendMessage(chatId, '❌ *Admin only command!*', { parse_mode: 'Markdown' });
  }
  const pairingPath = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  let paired = 0;
  try {
    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    paired = entries.filter(e => e.isDirectory() && e.name.endsWith('@s.whatsapp.net')).length;
  } catch {}
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);

  await bot.sendMessage(chatId,
    `╔══════════════════════╗\n` +
    `║  📊 *𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐒*  ║\n` +
    `╚══════════════════════╝\n\n` +
    `🔗 *Paired Users:* ${paired}\n` +
    `⏱️ *Uptime:* ${h}h ${m}m\n` +
    `👑 *Admins:* ${adminIDs.length}\n` +
    `🔥 *Status:* Online ✅\n\n` +
    `_Admin Panel — 𝐀𝐇𝐌𝐀𝐃 𝐌𝐃_ 💀`,
    { parse_mode: 'Markdown' }
  );
});

// ═══════════════════════════════════════
//  /pair COMMAND
// ═══════════════════════════════════════

bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  const text = match[1]?.trim();

  if (isGroup) return sendGroupMessage(chatId, msg.message_id);

  const joined = await checkUserJoinedChannels(userId);
  if (!joined) return sendChannelsRequiredMessage(chatId);

  if (!text) {
    userStates.set(userId, { step: 'awaiting_number' });
    return bot.sendMessage(chatId,
      `╔════════════════════════╗\n` +
      `║  🔗 *𝐏𝐀𝐈𝐑 𝐘𝐎𝐔𝐑 𝐖𝐀*  ║\n` +
      `╚════════════════════════╝\n\n` +
      `📱 *Send your WhatsApp number*\n\n` +
      `Example: \`923044975027\`\n\n` +
      `⚠️ _Include country code, no + sign_`,
      { parse_mode: 'Markdown' }
    );
  }

  if (/[a-z]/i.test(text)) return bot.sendMessage(chatId, '❌ *Letters not allowed.*\n\nNumbers only!', { parse_mode: 'Markdown' });
  if (!/^\d{7,15}$/.test(text)) return bot.sendMessage(chatId, '❌ *Invalid number format.*\n\nExample: `923044975027`', { parse_mode: 'Markdown' });
  if (text.startsWith('0')) return bot.sendMessage(chatId, '❌ *No leading 0.*\n\nInclude country code.', { parse_mode: 'Markdown' });

  const countryCode = text.slice(0, 3);
  if (["252", "201"].includes(countryCode)) return bot.sendMessage(chatId, '❌ *This country code is not supported.*', { parse_mode: 'Markdown' });

  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  if (!(await exists(pairingFolder))) await fs.mkdir(pairingFolder, { recursive: true });

  const files = await fs.readdir(pairingFolder);
  if (files.filter(f => f.endsWith('@s.whatsapp.net')).length >= 1000) {
    return bot.sendMessage(chatId, '❌ *Pairing limit reached.*\n\nTry again later.', { parse_mode: 'Markdown' });
  }

  userStates.delete(userId);

  try {
    const startpairing = require('./pair.js');
    const Xreturn = text + "@s.whatsapp.net";

    await bot.sendMessage(chatId,
      `╔════════════════════════╗\n` +
      `║  ⏳ *𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐈𝐍𝐆...*  ║\n` +
      `╚════════════════════════╝\n\n` +
      `🔄 Please wait a moment 🔥`,
      { parse_mode: 'Markdown' }
    );

    await startpairing(Xreturn);
    await sleep(4000);

    const pairingFile = path.join(pairingFolder, 'pairing.json');
    const cu = await fs.readFile(pairingFile, 'utf-8');
    const cuObj = JSON.parse(cu);
    delete require.cache[require.resolve('./pair.js')];

    return bot.sendMessage(chatId,
      `╔══════════════════════════════╗\n` +
      `║  🔗 *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 𝐂𝐎𝐃𝐄*  ║\n` +
      `╚══════════════════════════════╝\n\n` +
      `📝 *Your Code:*\n` +
      `┌─────────────────┐\n` +
      `│  👉  \`${cuObj.code}\`  👈  │\n` +
      `└─────────────────┘\n\n` +
      `📋 *𝐒𝐭𝐞𝐩𝐬 𝐭𝐨 𝐋𝐢𝐧𝐤:*\n` +
      `1️⃣ Open WhatsApp\n` +
      `2️⃣ Settings → Linked Devices\n` +
      `3️⃣ Tap "Link a Device"\n` +
      `4️⃣ Choose "Link with phone number"\n` +
      `5️⃣ Enter above code\n\n` +
      `⚠️ *Expires in 2 minutes!*\n\n` +
      `🔥 _Powered by_ *𝐀𝐇𝐌𝐀𝐃*`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: `📋 Copy: ${cuObj.code}`, callback_data: `copy_code_${cuObj.code}` }],
            [{ text: '👑 𝐎𝐰𝐧𝐞𝐫 - 𝐀𝐇𝐌𝐀𝐃', url: OWNER_TG }, { text: '📢 𝐖𝐀 𝐂𝐡𝐚𝐧𝐧𝐞𝐥', url: 'https://whatsapp.com/channel/0029VbCLBN8EwEk5DUkDta0K' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('PAIR COMMAND ERROR:', error);
    bot.sendMessage(chatId, '❌ *Pairing service unavailable.*\n\nPlease try again later.', { parse_mode: 'Markdown' });
  }
});

// ═══════════════════════════════════════
//  /unpair COMMAND
// ═══════════════════════════════════════

bot.onText(/\/unpair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1]?.trim();
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (isGroup) return bot.sendMessage(chatId, '❌ Use /unpair in my DM only.', { parse_mode: 'Markdown' });

  try {
    if (!input) return bot.sendMessage(chatId, '📋 Usage: `/unpair 923044975027`', { parse_mode: 'Markdown' });
    if (/[a-z]/i.test(input)) return bot.sendMessage(chatId, '❌ Letters not allowed.', { parse_mode: 'Markdown' });
    if (!/^\d{7,15}$/.test(input)) return bot.sendMessage(chatId, '❌ Invalid format. Example: `/unpair 923044975027`', { parse_mode: 'Markdown' });
    if (input.startsWith('0')) return bot.sendMessage(chatId, '❌ No leading 0.', { parse_mode: 'Markdown' });

    const pairingPath = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
    if (!(await exists(pairingPath))) return bot.sendMessage(chatId, '❌ No paired devices found.');

    const entries = await fs.readdir(pairingPath, { withFileTypes: true });
    const matched = entries.find(e => e.isDirectory() && e.name.includes(input));

    if (!matched) return bot.sendMessage(chatId, `❌ *No paired device for* \`${input}\``, { parse_mode: 'Markdown' });

    await fs.rm(path.join(pairingPath, matched.name), { recursive: true, force: true });

    return bot.sendMessage(chatId,
      `╔══════════════════════╗\n` +
      `║  ✅ *𝐔𝐍𝐏𝐀𝐈𝐑𝐄𝐃!*  ✅  ║\n` +
      `╚══════════════════════╝\n\n` +
      `🗑️ *${input}* removed successfully!\n\n` +
      `_By_ *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃* 🔥`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('UNPAIR ERROR:', err);
    bot.sendMessage(chatId, '❌ Failed to unpair. Try again later.');
  }
});

// ═══════════════════════════════════════
//  CALLBACK QUERY HANDLER
// ═══════════════════════════════════════

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  const chatId = msg.chat.id;

  if (data && data.startsWith('copy_code_')) {
    const code = data.replace('copy_code_', '');
    return bot.answerCallbackQuery(callbackQuery.id, { text: `✅ Code: ${code}`, show_alert: true });
  }

  if (data === 'check_join') {
    const joined = await checkUserJoinedChannels(userId);
    if (joined) {
      await bot.answerCallbackQuery(callbackQuery.id, { text: '✅ Joined! Use /pair now.', show_alert: true });
      await bot.sendMessage(chatId, '✅ *Thank you for joining!*\n\nNow send /pair to link your WhatsApp 🔥', { parse_mode: 'Markdown' });
    } else {
      await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Please join the channel first!', show_alert: true });
    }
    return;
  }

  if (data === 'start_pair') {
    userStates.set(userId, { step: 'awaiting_number' });
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Send your WA number!', show_alert: false });
    return bot.sendMessage(chatId,
      `📱 *Send your WhatsApp number*\n\nExample: \`923044975027\`\n\n⚠️ _Include country code, no + sign_`,
      { parse_mode: 'Markdown' }
    );
  }

  if (data === 'show_menu') {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Loading menu...', show_alert: false });
    return bot.sendMessage(chatId, '/menu', { parse_mode: 'Markdown' });
  }

  if (data === 'another_joke') {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    await bot.answerCallbackQuery(callbackQuery.id, { text: '😂 Here you go!', show_alert: false });
    return bot.sendMessage(chatId,
      `╔═══════════════════╗\n` +
      `║  😂 *𝐑𝐀𝐍𝐃𝐎𝐌 𝐉𝐎𝐊𝐄*  ║\n` +
      `╚═══════════════════╝\n\n` +
      `${joke}\n\n_Enjoy!_ 🔥`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '😂 𝐀𝐧𝐨𝐭𝐡𝐞𝐫 𝐉𝐨𝐤𝐞', callback_data: 'another_joke' }]]
        }
      }
    );
  }
});

// ═══════════════════════════════════════
//  TEXT MESSAGE HANDLER (state)
// ═══════════════════════════════════════

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (msg.chat.type !== 'private') return;
  if (!text || text.startsWith('/')) return;

  const userState = userStates.get(userId);
  if (!userState || userState.step !== 'awaiting_number') return;

  if (!/^\d{7,15}$/.test(text)) return;
  if (/[a-z]/i.test(text) || text.startsWith('0')) return;

  const countryCode = text.slice(0, 3);
  if (["252", "201"].includes(countryCode)) {
    return bot.sendMessage(chatId, '❌ Country code not supported.');
  }

  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  if (!(await exists(pairingFolder))) await fs.mkdir(pairingFolder, { recursive: true });

  const files = await fs.readdir(pairingFolder);
  if (files.filter(f => f.endsWith('@s.whatsapp.net')).length >= 1000) {
    return bot.sendMessage(chatId, '❌ Pairing limit reached. Try later.');
  }

  userStates.delete(userId);

  try {
    const startpairing = require('./pair.js');
    const Xreturn = text + "@s.whatsapp.net";

    await bot.sendMessage(chatId,
      `╔════════════════════════╗\n` +
      `║  ⏳ *𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐈𝐍𝐆...*  ║\n` +
      `╚════════════════════════╝\n\n` +
      `🔄 Please wait... 🔥`,
      { parse_mode: 'Markdown' }
    );

    await startpairing(Xreturn);
    await sleep(4000);

    const pairingFile = path.join(pairingFolder, 'pairing.json');
    const cu = await fs.readFile(pairingFile, 'utf-8');
    const cuObj = JSON.parse(cu);
    delete require.cache[require.resolve('./pair.js')];

    return bot.sendMessage(chatId,
      `╔══════════════════════════════╗\n` +
      `║  🔗 *𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 𝐂𝐎𝐃𝐄*  ║\n` +
      `╚══════════════════════════════╝\n\n` +
      `📝 *Your Code:*\n` +
      `┌─────────────────┐\n` +
      `│  👉  \`${cuObj.code}\`  👈  │\n` +
      `└─────────────────┘\n\n` +
      `1️⃣ Open WhatsApp\n` +
      `2️⃣ Settings → Linked Devices\n` +
      `3️⃣ Link a Device\n` +
      `4️⃣ Enter this code\n\n` +
      `⚠️ *Expires in 2 minutes!*\n\n` +
      `🔥 _Powered by_ *𝐀𝐇𝐌𝐀𝐃*`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: `📋 Copy: ${cuObj.code}`, callback_data: `copy_code_${cuObj.code}` }],
            [{ text: '👑 𝐎𝐰𝐧𝐞𝐫', url: OWNER_TG }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('PAIRING ERROR:', error);
    bot.sendMessage(chatId, '❌ Pairing failed. Try again later.');
  }
});

// ═══════════════════════════════════════
//  POLLING ERROR HANDLER
// ═══════════════════════════════════════

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// ═══════════════════════════════════════
//  BOT START
// ═══════════════════════════════════════

(async () => {
  await loadAdminIDs();
  const restartCount = parseInt(process.env.RESTART_COUNT || 0);
  process.env.RESTART_COUNT = String(restartCount + 1);
  console.log(chalk.cyan('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan('║   𝐀𝐇𝐌𝐀𝐃 𝐌𝐃 𝐁𝐎𝐓 𝐕𝟑 - 𝐎𝐍𝐋𝐈𝐍𝐄 🔥   ║'));
  console.log(chalk.cyan('╚══════════════════════════════════╝'));
  console.log(chalk.green('✅ Owner: Ahmad | +923044975027'));
  console.log(chalk.green('✅ Telegram: @yourstepdady9'));
  console.log(chalk.yellow('✅ Commands: /pair /unpair /menu /info /alive /owner /roll /flip /joke /quote /time /calc /fancy /8ball /password /encode /decode /weather /stats'));
})();

// ═══════════════════════════════════════
//  PROCESS HANDLERS
// ═══════════════════════════════════════

process.on("uncaughtException", (err) => { console.error('Uncaught Exception:', err); });
process.on("unhandledRejection", (err) => { console.error('Unhandled Rejection:', err); });
process.removeAllListeners("warning");
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('message', (msg) => { if (msg === 'shutdown') gracefulShutdown('PM2_SHUTDOWN'); });
