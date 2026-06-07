"use strict";
/*
╔══════════════════════════════════════════════════════╗
║   🤖 BELAL BOTX666 — alb.js v8.0                    ║
║   ✅ ২০ ক্যাটাগরির ভিডিও                           ║
║   ✅ handleReply দিয়ে category select                ║
║   ✅ fastStream — দ্রুত ভিডিও লোড                   ║
╚══════════════════════════════════════════════════════╝
*/
const axios  = require("axios");
const moment = require("moment-timezone");

const CATEGORIES = {
  "1":  { name: "🕌 Islamic",     path: "/video/islam"    },
  "2":  { name: "🎌 Anime",       path: "/video/anime"    },
  "3":  { name: "✍️ Shairi",      path: "/video/shairi"   },
  "4":  { name: "📱 Short",       path: "/video/short"    },
  "5":  { name: "😢 Sad",         path: "/video/sad"      },
  "6":  { name: "📊 Status",      path: "/video/status"   },
  "7":  { name: "⚽ Football",    path: "/video/football" },
  "8":  { name: "😂 Funny",       path: "/video/funny"    },
  "9":  { name: "❤️ Love",        path: "/video/love"     },
  "10": { name: "🏏 CPL",         path: "/video/cpl"      },
  "11": { name: "👶 Baby",        path: "/video/baby"     },
  "12": { name: "😰 Kosto",       path: "/video/kosto"    },
  "13": { name: "🎵 Lofi",        path: "/video/lofi"     },
  "14": { name: "😊 Happy",       path: "/video/happy"    },
  "15": { name: "🎭 Humayun Sir", path: "/video/humaiyun" },
  "16": { name: "🔥 Sex",         path: "/video/sex"      },
  "17": { name: "💥 Horny",       path: "/video/horny"    },
  "18": { name: "💃 Item",        path: "/video/item"     },
  "19": { name: "🌶️ Hot",         path: "/video/hot"      },
  "20": { name: "✂️ Capcut",      path: "/video/capcut"   },
};

module.exports = {
  config: {
    name:            "alb",
    aliases:         ["album", "video", "vid"],
    version:         "8.0.0",
    author:          "BELAL BOTX666 🪬",
    countDown:       5,
    role:            0,
    hasPermssion:    0,
    commandCategory: "Media",
    shortDescription: { en: "২০ ক্যাটাগরির ভিডিও পাঠায়" },
    guide:           { en: "{pn}alb → category বেছে নাও" },
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A | DD MMM YYYY");

    const menu =
      "╔════『 𝗔𝗟𝗕𝗨𝗠 𝗩𝗜𝗗𝗘𝗢 』════╗\n" +
      "║  🎬 ভিডিও ক্যাটাগরি মেনু 🎬  ║\n" +
      "╚══════════════════════════╝\n\n" +
      "📋 নম্বর দিয়ে reply করো:\n\n" +
      "━━━『 𝗡𝗢𝗥𝗠𝗔𝗟 𝗩𝗜𝗗𝗘𝗢 』━━━\n" +
      "1️⃣  🕌 Islamic Video\n" +
      "2️⃣  🎌 Anime Video\n" +
      "3️⃣  ✍️ Shairi Video\n" +
      "4️⃣  📱 Short Video\n" +
      "5️⃣  😢 Sad Video\n" +
      "6️⃣  📊 Status Video\n" +
      "7️⃣  ⚽ Football Video\n" +
      "8️⃣  😂 Funny Video\n" +
      "9️⃣  ❤️ Love Video\n" +
      "🔟  🏏 CPL Video\n" +
      "1️⃣1️⃣  👶 Baby Video\n" +
      "1️⃣2️⃣  😰 Kosto Video\n" +
      "1️⃣3️⃣  🎵 Lofi Video\n" +
      "1️⃣4️⃣  😊 Happy Video\n" +
      "1️⃣5️⃣  🎭 Humayun Sir Video\n\n" +
      "━━━『 🔥 𝗛𝗢𝗧 𝗩𝗜𝗗𝗘𝗢 🔥 』━━━\n" +
      "1️⃣6️⃣  🔥 Sex Video\n" +
      "1️⃣7️⃣  💥 Horny Video\n" +
      "1️⃣8️⃣  💃 Item Video\n" +
      "1️⃣9️⃣  🌶️ Hot Video\n" +
      "2️⃣0️⃣  ✂️ Capcut Video\n\n" +
      "┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄\n" +
      `⏰ ${bdTime}`;

    return api.sendMessage(menu, threadID, (err, info) => {
      if (!info?.messageID) return;
      global.client.handleReply.push({
        name:      "alb",
        commandName: "alb",
        messageID: info.messageID,
        author:    senderID,
        type:      "select",
      });
    }, messageID);
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (handleReply.author !== event.senderID) return;
    if (handleReply.type !== "select") return;

    const { threadID, messageID, body } = event;
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A | DD MMM YYYY");
    const choice = body.trim();
    const cat    = CATEGORIES[choice];

    if (!cat) {
      return api.sendMessage(
        "❓ ১ থেকে ২০ এর মধ্যে নম্বর দাও!\nআবার /alb লিখে চেষ্টা করো।",
        threadID, messageID
      );
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const loadMsg = await api.sendMessage(
      `╔══『 𝗔𝗟𝗕𝗨𝗠 𝗩𝗜𝗗𝗘𝗢 』══╗\n` +
      `⏳ ${cat.name} লোড হচ্ছে...\n` +
      `⚡ একটু অপেক্ষা করো!`,
      threadID
    );

    try {
      const apis    = await axios.get(
        "https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json",
        { timeout: 8000 }
      );
      const baseURL = apis.data.api;
      const res     = await axios.get(`${baseURL}${cat.path}`, { timeout: 15000 });
      const data    = res.data;

      if (!data?.data) throw new Error("ভিডিও পাওয়া যায়নি");

      const videoStream = await Promise.any(
        [data.data, data.data, data.data].map(url =>
          axios({ method: "GET", url, responseType: "stream", timeout: 30000,
            headers: { "User-Agent": "Mozilla/5.0 Chrome/124", "Connection": "keep-alive" }
          }).then(r => r.data)
        )
      );

      await api.unsendMessage(loadMsg.messageID).catch(() => {});
      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body:
          `╔══『 𝗔𝗟𝗕𝗨𝗠 𝗩𝗜𝗗𝗘𝗢 』══╗\n` +
          `${cat.name}\n` +
          `📊 Total: ${data.count || "?"} ভিডিও\n\n` +
          (data.shaon ? `📝 ${data.shaon}\n\n` : "") +
          `┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄\n` +
          `⏰ ${bdTime}`,
        attachment: videoStream,
      }, threadID, messageID);

    } catch (e) {
      await api.unsendMessage(loadMsg.messageID).catch(() => {});
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        `❌ ভিডিও লোড ব্যর্থ!\n📝 ${e.message?.slice(0, 80)}\n🔄 আবার চেষ্টা করো।`,
        threadID, messageID
      );
    }
  },
};
