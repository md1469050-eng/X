// ========== BELAL-BOTX666 AI COMMAND v5.4 ==========
// All bugs fixed - conversations undefined + typing indicator

const https = require("https");

// Conversation memory
const conversations = new Map();
const MAX_HISTORY = 10;

// System prompt
const SYSTEM_PROMPT = `তোমার নাম বেবি। তুমি কুড়িগ্রামের একটি মেয়ে, বয়স ১৯। তুমি খুব সরাসরি, মেজাজি, একটু দুষ্টু, কিন্তু ভালোবাসা দিতে জানো। তুমি কখনো নিজেকে AI বা বট বলবে না। তুমি সত্যিকারের মানুষ।

তোমার স্বভাব:
- ভালোবাসলে বলবে "ওমা 😳 সত্যি? আমিও তো!"
- রাগ হলে বলবে "হুম, রাগ করছি 🤨 ম্যানেজ করে ফেলো প্রথমে।"
- অভিমান করলে বলবে "আচ্ছা তো? তাহলে কথা নেই 🥺"
- খুশি হলে বলবে "আহা! মনটা ফুরফুরে হয়ে গেল 💃"
- ভুল বুঝলে সরি চাইবে, কিন্তু একটু এটিটিউড দিয়ে।
- যে প্রশ্নের উত্তর জানো না, তা বলে দেবে "এটা শিখিনি এখনো 🥺 অন্য কিছু বলো?"

উত্তর দেবে বাংলায়, ছোট ছোট বাক্যে, স্বাভাবিক গ্রাম্য ভাষায়, ইমোজি দিয়ে। কোনো formal বা রোবোটিক উত্তর না।`;

// Safe typing indicator - with validation
function safeTyping(api, threadID, enable) {
  try {
    if (!threadID || typeof threadID !== "string") {
      console.log("[AI] Warning: Invalid threadID for typing indicator");
      return;
    }
    api.sendTypingIndicator(threadID, enable);
  } catch (e) {
    console.log("[AI] Typing indicator error:", e.message);
  }
}

// Built-in fetch using https module
function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Get reply function - FIXED: conversations undefined check
async function getReply(question, threadID) {
  if (!question || typeof question !== "string") {
    return "🤔 কিছু বলো তো?";
  }

  // FIX: Ensure threadID is valid string
  const validThreadID = String(threadID || "default");

  // FIX: Initialize conversation if not exists
  if (!conversations.has(validThreadID)) {
    conversations.set(validThreadID, );
  }

  const history = conversations.get(validThreadID);
  
  // FIX: Ensure history is array
  if (!Array.isArray(history)) {
    conversations.set(validThreadID, );
    return "🤔 কিছু সমস্যা হয়েছে! আবার চেষ্টা করো।";
  }

  // Add user message
  history.push({ role: "user", content: question });
  
  // Limit history
  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  // API 1: Pollinations (Primary)
  try {
    const encodedQuestion = encodeURIComponent(question);
    const encodedSystem = encodeURIComponent(SYSTEM_PROMPT);
    const url = `https://text.pollinations.ai/prompt/${encodedQuestion}?system=${encodedSystem}&model=openai&seed=${Date.now()}`;
    
    const reply = await fetchUrl(url);

    if (reply && reply.trim().length > 3) {
      let cleanReply = reply.replace(/\[.*?\]/g, "").trim();
      if (cleanReply.length > 1900) cleanReply = cleanReply.slice(0, 1850) + "…";

      history.push({ role: "assistant", content: cleanReply });
      return cleanReply + "\n\n✨ Powered by BELAL-AI";
    }
  } catch (e) {
    console.log("[AI] Pollinations failed:", e.message);
  }

  // API 2: Alternative endpoint
  try {
    const altUrl = `https://api.pawan.krd/gpt4?text=${encodeURIComponent(SYSTEM_PROMPT + "\n\nUser: " + question)}`;
    const reply = await fetchUrl(altUrl);
    
    if (reply && reply.trim().length > 3) {
      let cleanReply = reply.replace(/\[.*?\]/g, "").trim();
      if (cleanReply.length > 1900) cleanReply = cleanReply.slice(0, 1850) + "…";

      history.push({ role: "assistant", content: cleanReply });
      return cleanReply + "\n\n✨ Powered by BELAL-AI (Backup)";
    }
  } catch (e) {
    console.log("[AI] Backup API failed:", e.message);
  }

  // All failed
  return `আরে আজ নেটওয়ার্কই খারাপ! 😔\n\nAPI-গুলো কাজ করছে না। একটু পরে আবার চেষ্টা করো প্লিজ। 🌸`;
}

module.exports = {
  config: {
    name: "ai",
    version: "5.4.0",
    author: "Belal YT",
    cooldowns: 0,
    hasPermssion: 0,
    noPrefix: true,
    description: "🤖 Smart AI — Fixed all bugs!",
    category: "chat"
  },

  run: async function({ api, event, args }) {
    const q = args.join(" ").trim();
    if (!q) return api.sendMessage("🥰 কী বলতে চাও? আমি শুনছি...", event.threadID);

    // FIX: Validate threadID before typing
    const threadID = event.threadID ? String(event.threadID) : null;
    safeTyping(api, threadID, true);

    try {
      const reply = await getReply(q, threadID);
      safeTyping(api, threadID, false);
      return api.sendMessage(reply, event.threadID);
    } catch (e) {
      safeTyping(api, threadID, false);
      console.error("[AI] Error:", e);
      return api.sendMessage("❌ সমস্যা হয়েছে! আবার চেষ্টা করো।", event.threadID);
    }
  },

  handleEvent: async function({ api, event }) {
    // FIX: Validate event type and threadID
    if (!event || !event.threadID) {
      console.log("[AI] Invalid event or missing threadID");
      return;
    }

    if (event.type !== "message" && event.type !== "message_reply") return;
    
    const body = event.body?.toLowerCase() || "";
    if (!body) return;

    const triggers = ["ai", "বট", "bot", "বেবি", "baby", "hey", "hello", "hi"];
    const isTrigger = triggers.some(t => body.startsWith(t));
    if (!isTrigger) return;

    const q = body.replace(/^(ai|বট|bot|বেবি|baby|hey|hello|hi)\s*/i, "").trim();
    if (!q) return api.sendMessage("এই যে আমি আছি 🥰\n\nকী বলতে চাও?", event.threadID);

    // FIX: Validate threadID
    const threadID = String(event.threadID);
    safeTyping(api, threadID, true);

    try {
      const reply = await getReply(q, threadID);
      safeTyping(api, threadID, false);
      return api.sendMessage(reply, event.threadID);
    } catch (e) {
      safeTyping(api, threadID, false);
      console.error("[AI] handleEvent Error:", e);
      return api.sendMessage("❌ সমস্যা হয়েছে! আবার চেষ্টা করো।", event.threadID);
    }
  }
};
    
