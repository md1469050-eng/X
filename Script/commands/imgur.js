"use strict";
/*
╔══════════════════════════════════════════════════════╗
║   🤖 BELAL BOTX666 — imgur.js v3.0                  ║
║   ✅ fastStream — চোখের পলকে upload                 ║
║   ✅ multi-file support                              ║
║   ✅ image / video / gif / audio সব ধরন             ║
╚══════════════════════════════════════════════════════╝
*/

const axios   = require("axios");
const moment  = require("moment-timezone");

module.exports = {
  config: {
    name:        "imgur",
    aliases:     ["imgupload", "imglink"],
    version:     "3.0.0",
    author:      "BELAL BOTX666 🪬",
    countDown:   5,
    role:        0,
    hasPermssion: 0,
    category:    "Media",
    shortDescription: { en: "ছবি/ভিডিও/GIF Imgur এ upload করে direct link দেয়" },
    guide:       { en: "যেকোনো media তে reply দিয়ে {pn}imgur লিখো" },
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A | DD MMM YYYY");

    const header =
      "╔═══『 𝐈𝐌𝐆𝐔𝐑 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐑 』═══╗\n" +
      "║  ☁️  Fast Cloud Upload  ☁️  ║\n" +
      "╚══════════════════════════╝";

    const sig =
      "\n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄" +
      `\n⏰ ${bdTime}`;

    // ── Attachment check ────────────────────────────────────────
    if (!messageReply || !messageReply.attachments?.length) {
      return api.sendMessage(
        `${header}\n\n⚠️ কোনো ছবি/ভিডিও/GIF এ reply দিয়ে কমান্ড দাও!\n\n📌 ব্যবহার: media তে reply → imgur${sig}`,
        threadID, messageID
      );
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    // ── API key fetch ───────────────────────────────────────────
    let imgurAPI;
    try {
      const apis = await axios.get(
        "https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json",
        { timeout: 8000 }
      );
      imgurAPI = apis.data.imgur;
    } catch {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        `${header}\n\n❌ API সার্ভার এ সমস্যা হয়েছে!\n🔄 কিছুক্ষণ পরে আবার চেষ্টা করো।${sig}`,
        threadID, messageID
      );
    }

    // ── Upload all attachments ──────────────────────────────────
    const links  = [];
    const failed = [];

    for (let i = 0; i < messageReply.attachments.length; i++) {
      const att = messageReply.attachments[i];
      try {
        const url    = encodeURIComponent(att.url);
        const upload = await axios.get(`${imgurAPI}/imgur?link=${url}`, { timeout: 20000 });
        const link   = upload.data?.uploaded?.image;
        if (link) {
          links.push(`${i + 1}. 🔗 ${link}`);
        } else {
          failed.push(`${i + 1}. ❌ link পাওয়া যায়নি`);
        }
      } catch {
        failed.push(`${i + 1}. ❌ upload ব্যর্থ`);
      }
    }

    api.setMessageReaction(links.length > 0 ? "✅" : "❌", messageID, () => {}, true);

    // ── Build response ──────────────────────────────────────────
    let body = `${header}\n\n`;

    if (links.length > 0) {
      body += links.length === 1
        ? `✅ Upload সফল!\n\n🔗 Link:\n${links[0].replace("1. 🔗 ", "")}`
        : `✅ ${links.length}টি file upload সফল!\n\n${links.join("\n")}`;
    }

    if (failed.length > 0) {
      body += `\n\n❌ ব্যর্থ (${failed.length}টি):\n${failed.join("\n")}`;
    }

    body += sig;
    return api.sendMessage(body, threadID, messageID);
  },
};
