"use strict";
/*
╔══════════════════════════════════════════════════════╗
║   🤖 BELAL BOTX666 — 4k.js v8.0                     ║
║   ✅ AI দিয়ে ছবি 4K enhance করে                    ║
║   ✅ fastStream — চোখের পলকে result                  ║
║   ✅ সুন্দর বাংলা design                            ║
╚══════════════════════════════════════════════════════╝
*/
const axios  = require("axios");
const fs     = require("fs-extra");
const path   = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name:            "4k",
    aliases:         ["enhance", "hd", "upscale"],
    version:         "8.0.0",
    author:          "BELAL BOTX666 🪬",
    countDown:       10,
    role:            0,
    hasPermssion:    0,
    commandCategory: "AI Tools",
    shortDescription: { en: "AI দিয়ে ছবি 4K enhance করে" },
    guide:           { en: "ছবিতে reply দিয়ে {pn}4k লিখো" },
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A | DD MMM YYYY");

    const header =
      "╔══『 𝟰𝗞 𝗔𝗜 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗥 』══╗\n" +
      "║  ✨ Ultra HD Upscaler ✨  ║\n" +
      "╚═══════════════════════╝";

    const sig =
      "\n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄\n⏰ " + bdTime;

    if (!messageReply?.attachments?.length) {
      return api.sendMessage(
        `${header}\n\n⚠️ ব্যবহার:\n• যেকোনো ছবিতে reply দাও\n• তারপর 4k লিখো\n\n💡 AI দিয়ে ছবি Ultra HD করে দেবে!${sig}`,
        threadID, messageID
      );
    }

    const imageUrl = messageReply.attachments[0]?.url;
    if (!imageUrl) return api.sendMessage(`${header}\n\n❌ ছবির URL পাওয়া যায়নি!${sig}`, threadID, messageID);

    api.setMessageReaction("📸", messageID, () => {}, true);

    const cacheDir = path.join(process.cwd(), "tmp");
    await fs.ensureDir(cacheDir);
    const tempPath = path.join(cacheDir, `4k_${Date.now()}.png`);

    const loadMsg = await api.sendMessage(
      `${header}\n\n🔄 AI processing চলছে...\n✨ ছবি enhance হচ্ছে!\n⚡ একটু অপেক্ষা করো।`,
      threadID
    );

    try {
      const res = await axios.get(
        `https://free-goat-api.onrender.com/4k?url=${encodeURIComponent(imageUrl)}`,
        { timeout: 30000 }
      );
      const processedUrl = res.data?.image;
      if (!processedUrl) throw new Error("Enhanced image URL পাওয়া যায়নি");

      // fastStream দিয়ে দ্রুত download
      const imgRes = await Promise.any([processedUrl, processedUrl, processedUrl].map(u =>
        axios({ method: "GET", url: u, responseType: "stream", timeout: 20000 })
      ));
      await new Promise((resolve, reject) => {
        const w = fs.createWriteStream(tempPath);
        imgRes.data.pipe(w);
        w.on("finish", resolve);
        w.on("error", reject);
      });

      await api.unsendMessage(loadMsg.messageID).catch(() => {});
      api.setMessageReaction("✨", messageID, () => {}, true);

      return api.sendMessage({
        body:
          `${header}\n\n` +
          `✅ 𝗘𝗻𝗵𝗮𝗻𝗰𝗲 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹!\n\n` +
          `🎨 Effect: Color Grading + HD\n` +
          `🛠️ Process: AI Deep Learning\n` +
          `🌈 Background: Optimized\n` +
          `📐 Quality: Ultra 4K\n` +
          sig,
        attachment: fs.createReadStream(tempPath),
      }, threadID, () => fs.remove(tempPath).catch(() => {}), messageID);

    } catch (e) {
      await api.unsendMessage(loadMsg.messageID).catch(() => {});
      await fs.remove(tempPath).catch(() => {});
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        `${header}\n\n❌ Enhance ব্যর্থ হয়েছে!\n📝 কারণ: ${e.message?.slice(0, 80)}\n🔄 আবার চেষ্টা করো।${sig}`,
        threadID, messageID
      );
    }
  },
};
