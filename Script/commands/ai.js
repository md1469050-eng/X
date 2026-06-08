const axios = require("axios");

// ========== BELAL-BOTX666 AI COMMAND v6.1 ==========
// Fixed: sendTypingIndicator requires threadID error

// Conversation memory per thread
const conversations = new Map();
const MAX_HISTORY = 10;

// System prompt - Bengali character personality
const SYSTEM_PROMPT = `তোমার নাম বেবি। তুমি কুড়িগ্রামের একটি মেয়ে, বয়স ১৯। তুমি খুব সরাসরি, মেজাজি, একটু দুষ্টু, কিন্তু ভালোবাসা দিতে জানো। তুমি কখনো নিজেকে AI বা বট বলবে না। তুমি সত্যিকারের মানুষ।

তোমার স্বভাব:
- ভালোবাসলে বলবে "ওমা 😳 সত্যি? আমিও তো!"
- রাগ হলে বলবে "হুম, রাগ করছি 🤨 ম্যানেজ করে ফেলো প্রথমে।"
- অভিমান করলে বলবে "আচ্ছা তো? তাহলে কথা নেই 🥺"
- খুশি হলে বলবে "আহা! মনটা ফুরফুরে হয়ে গেল 💃"
- ভুল বুঝলে সরি চাইবে, কিন্তু একটু এটিটিউড দিয়ে।
- যে প্রশ্নের উত্তর জানো না, তা বলে দেবে "এটা শিখিনি এখনো 🥺 অন্য কিছু বলো?"

উত্তর দেবে বাংলায়, ছোট ছোট বাক্যে, স্বাভাবিক গ্রাম্য ভাষায়, ইমোজি দিয়ে। কোনো formal বা রোবোটিক উত্তর না।`;

// Safe typing indicator - FIXED: proper threadID validation
function safeTyping(api, threadID, enable) {
  try {
    // Validate threadID - must be a non-empty string
    if (!threadID || typeof threadID !== "string" || threadID.trim() === "") {
      console.log("[AI] Warning: Invalid threadID for typing indicator, skipping");
      return;
    }
    // Ensure threadID is not undefined/null/empty
    const validThreadID = String(threadID).trim();
    if (!validThreadID) {
      console.log("[AI] Warning: Empty threadID, skipping typing indicator");
      return;
    }
    api.sendTypingIndicator(validThreadID, enable);
  } catch (e) {
    // Silently ignore typing errors - don't crash the bot
    console.log("[AI] Typing indicator error (non-critical):", e.message);
  }
}

// Get reply function - GLOBAL scope (no this context issues)
async function getReply(question, threadID) {
  // Validate input
  if (!question || typeof question !== "string") {
    return "🤔 কিছু বলো তো?";
  }

  // Ensure valid threadID
  const validThreadID = String(threadID || "default");

  // Initialize conversation history if not exists
  if (!conversations.has(validThreadID)) {
    conversations.set(validThreadID, );
  }

  const history = conversations.get(validThreadID);
  
  // Safety check - ensure history is array
  if (!Array.isArray(history)) {
    conversations.set(validThreadID, );
    return "🤔 কিছু সমস্যা হয়েছে! আবার চেষ্টা করো।";
  }

  // Add user message
  history.push({ role: "user", content: question });
  
  // Limit history size
  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  // API 1: Pollinations AI (Primary - 100% free, no API key required)
  try {
    const encodedQuestion = encodeURIComponent(question);
    const encodedSystem = encodeURIComponent(SYSTEM_PROMPT);
    const url = `https://text.pollinations.ai/prompt/${encodedQuestion}?system=${encodedSystem}&model=openai&seed=${Date.now()}`;
    
    const res = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    let reply = res.data;
    if (reply && typeof reply === "string" && reply.trim().length > 3) {
      // Clean response
      reply = reply.replace(/\[.*?\]/g, "").trim();
      if (reply.length > 1900) reply = reply.slice(0, 1850) + "…";

      // Add to history
      history.push({ role: "assistant", content: reply });
      return reply + "\n\n✨ Powered by BELAL-AI";
    }
  } catch (e) {
    console.log("[AI] Pollinations failed:", e.message);
  }

  // API 2: Blackbox AI (Fallback - 100% free, no API key required)
  try {
    const res = await axios.post(
      "https://www.blackbox.ai/api/chat",
      {
        messages: [{ role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question }],
        model: "gpt-4o"
      },
      { 
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    let reply = res.data?.response || res.data?.text;
    if (reply && typeof reply === "string" && reply.trim().length > 3) {
      // Clean response
      reply = reply.replace(/\[.*?\]/g, "").trim();
      if (reply.length > 1900) reply = reply.slice(0, 1850) + "…";

      // Add to history
      history.push({ role: "assistant", content: reply });
      return reply + "\n\n✨ Powered by BELAL-AI (Backup)";
    }
  } catch (e) {
    console.log("[AI] Blackbox failed:", e.message);
  }

  // All APIs failed
  return `আরে আজ নেটওয়ার্কই খারাপ! 😔\n\nদুইটা API-ই কাজ করছে না। একটু পরে আবার চেষ্টা করো প্লিজ। 🌸`;
}

// Auto cleanup old conversations every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of conversations.entries()) {
    // Remove conversations older than 30 minutes
    const lastMessage = val[val.length - 1];
    if (lastMessage && lastMessage.timestamp) {
      if (now - lastMessage.timestamp > 30 * 60 * 1000) {
        conversations.delete(key);
      }
    }
  }
}, 30 * 60 * 1000);

module.exports = {
  config: {
    name: "ai",
    version: "6.1.0",
    author: "Belal YT",
    cooldowns: 0,
    hasPermssion: 0,
    noPrefix: true,
    description: "🤖 Smart AI — 100% Free, No API Key, Multiple Fallback APIs",
    category: "chat",
    guide: {
      en: "{pn} <question> - Ask AI anything\nExample: {pn} হ্যালো",
      bn: "{pn} <প্রশ্ন> - AI কে যেকোনো কিছু জিজ্ঞেস করুন\nউদাহরণ: {pn} হ্যালো"
    }
  },

  // Main run function for command with prefix
  run: async function({ api, event, args }) {
    const q = args.join(" ").trim();
    if (!q) return api.sendMessage("🥰 কী বলতে চাও? আমি শুনছি...", event.threadID);

    // Validate threadID before using
    const threadID = event.threadID ? String(event.threadID).trim() : null;
    
    // Show typing indicator with validated threadID
    safeTyping(api, threadID, true);

    try {
      const reply = await getReply(q, threadID);
      safeTyping(api, threadID, false);
      return api.sendMessage(reply, event.threadID);
    } catch (e) {
      safeTyping(api, threadID, false);
      console.error("[AI] run Error:", e);
      return api.sendMessage("❌ সমস্যা হয়েছে! আবার চেষ্টা করো।", event.threadID);
    }
  },

  // handleEvent for noPrefix trigger words
  handleEvent: async function({ api, event }) {
    // Validate event object and threadID
    if (!event || !event.threadID) {
      console.log("[AI] Invalid event or missing threadID");
      return;
    }

    // Only respond to message events
    if (event.type !== "message" && event.type !== "message_reply") return;
    
    const body = event.body?.toLowerCase() || "";
    if (!body) return;

    // Trigger words for noPrefix mode
    const triggers = ["ai", "বট", "bot", "বেবি", "baby", "hey", "hello", "hi"];
    const isTrigger = triggers.some(t => body.startsWith(t));
    
    if (!isTrigger) return;

    // Extract question from trigger word
    const q = body.replace(/^(ai|বট|bot|বেবি|baby|hey|hello|hi)\s*/i, "").trim();
    
    if (!q) return api.sendMessage("এই যে আমি আছি 🥰\n\nকী বলতে চাও?", event.threadID);

    // Validate threadID
    const threadID = event.threadID ? String(event.threadID).trim() : null;
    
    // Show typing indicator with validated threadID
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
