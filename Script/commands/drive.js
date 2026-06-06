"use strict";
/*
╔══════════════════════════════════════════════════════╗
║   🤖 BELAL BOTX666 — drive.js v3.0                  ║
║   ✅ fastStream — চোখের পলকে upload                 ║
║   ✅ reply + direct URL দুইভাবেই কাজ করে            ║
║   ✅ সুন্দর বাংলা design                            ║
╚══════════════════════════════════════════════════════╝
*/

const axios  = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name:         "drive",
    aliases:      ["gdrive", "googledrive", "gd"],
    version:      "3.0.0",
    author:       "BELAL BOTX666 🪬",
    countDown:    5,
    role:         0,
    hasPermssion: 0,
    category:     "Media",
    shortDescription: { en: "media Google Drive এ upload করে shareable link দেয়" },
    guide:        { en: "media তে reply → {pn}drive অথবা {pn}drive [url]" },
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A | DD MMM YYYY");

    const header =
      "╔════『 𝐆𝐎𝐎𝐆𝐋𝐄 𝐃𝐑𝐈𝐕𝐄 』════╗\n" +
      "║  ☁️  Cloud Storage Upload  ☁️  ║\n" +
      "╚═══════════════════════════╝";

    const sig =
      "\n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄" +
      `\n⏰ ${bdTime}`;

    // ── Input URL নাও ─────────────────────────────────────────
    let inputUrl = null;
    let fileName = "media";

    if (messageReply?.attachments?.length > 0) {
      inputUrl = messageReply.attachments[0].url;
      fileName = messageReply.attachments[0].filename || "media";
    } else if (args.length > 0) {
      inputUrl = args[0];
    }

    if (!inputUrl) {
      return api.sendMessage(
        `${header}\n\n` +
        `⚠️ ব্যবহার করো:\n` +
        `• কোনো media তে reply দিয়ে drive লিখো\n` +
        `• অথবা drive [url] লিখো` +
        sig,
        threadID, messageID
      );
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const loadMsg = await api.sendMessage(
      `${header}\n\n☁️ Google Drive এ upload হচ্ছে...\n⚡ একটু অপেক্ষা করো!`,
      threadID
    );

    try {
      // ── Google Drive API call ─────────────────────────────────
      const apiURL = `https://aryan-xyz-google-drive.vercel.app/drive?url=${encodeURIComponent(inputUrl)}&apikey=ArYAN`;

      const res = await axios.get(apiURL, { timeout: 30000 });
      const data = res.data || {};
      const driveLink = data.driveLink || data.driveLIink || data.link;

      await api.unsendMessage(loadMsg.messageID).catch(() => {});

      if (!driveLink) throw new Error(data.error || "Drive link পাওয়া যায়নি");

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        `${header}\n\n` +
        `✅ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥!\n\n` +
        `📁 ফাইল: ${fileName}\n\n` +
        `🔗 𝐃𝐫𝐢𝐯𝐞 𝐋𝐢𝐧𝐤:\n${driveLink}` +
        sig,
        threadID, messageID
      );

    } catch (e) {
      await api.unsendMessage(loadMsg.messageID).catch(() => {});
      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        `${header}\n\n` +
        `❌ Upload ব্যর্থ হয়েছে!\n` +
        `📝 কারণ: ${e.message?.slice(0, 100)}\n` +
        `🔄 কিছুক্ষণ পরে আবার চেষ্টা করো।` +
        sig,
        threadID, messageID
      );
    }
  },
};
