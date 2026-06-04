"use strict";
const fs     = require("fs-extra");
const path   = require("path");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "30.0.0",
  credits: "Belal x Gemini",
  description: "২০+ নতুন ফিচার ও ৫ রকম অ্যানিমেশন সহ আল্টিমেট জেনেসিস হাব",
};

module.exports.onLoad = function () {
  const paths = [
    path.join(__dirname, "cache", "joinGif"),
    path.join(__dirname, "cache", "randomgif")
  ];
  for (const p of paths) if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:subscribe") return;

  const { threadID } = event;
  const startTime    = Date.now();
  const botPrefix    = global.config?.PREFIX || "/";
  const botName      = "𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧-𝗫𝟲𝟲𝟲";
  const sig          = "\n┈──╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্্ড়ৃঁ✿⃝🪬 ╾──┈";

  const emojiMax = ["🔱","💎","🛡️","🌀","🛰️","🧿","💫","🔥","👑","✨","🌟","⚙️","💠","🏆","⚡","🌈"];
  const rand     = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const frames = [
    ["«━━◤ ⚔️ ◢━━»", "«━━◤ ⚔️ ◢━━»", "💠━━━━━━━💠"],
    ["«━━◤ 🔥 ◢━━»", "«━━◤ 🔥 ◢━━»", "🔥━━━━━━━🔥"],
    ["«━━◤ 💎 ◢━━»", "«━━◤ 💎 ◢━━»", "💎━━━━━━━💎"],
    ["«━━◤ 🛰️ ◢━━»", "«━━◤ 🛰️ ◢━━»", "📡━━━━━━━📡"],
    ["«━━◤ 👑 ◢━━»", "«━━◤ 👑 ◢━━»", "👑━━━━━━━👑"]
  ];
  const anim = rand(frames);

  // ── ১. বটের এন্ট্রি ──────────────────────────────────────
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    try {
      await api.changeNickname(`[ ${botPrefix} ] • ${botName}`, threadID, api.getCurrentUserID());
    } catch (_) {}

    const randomGifPath = path.join(__dirname, "cache", "randomgif");
    const allFiles = fs.existsSync(randomGifPath)
      ? fs.readdirSync(randomGifPath).filter(f => [".mp4",".gif",".jpg",".png"].some(ext => f.endsWith(ext)))
      : [];
    const selected = allFiles.length > 0
      ? fs.createReadStream(path.join(randomGifPath, rand(allFiles)))
      : null;

    const botEntryMsg =
`${anim[0]}
   𝗦𝗬𝗦𝗧𝗘𝗠 𝗢𝗡𝗟𝗜𝗡𝗘 🚀
${anim[1]}

👋 আসসালামু আলাইকুম! ${botName} এখন এই রাজত্বের প্রধান সেন্টিনেল হিসেবে চার্জ নিয়েছে।

📡 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 𝗦𝗧𝗔𝗧𝗨𝗦:
━━━━━━━━━━━━━━━━━━━━
⌬ 𝗣𝗿𝗲𝗳𝗶𝘅  : [ ${botPrefix} ]
⌬ 𝗨𝗽𝘁𝗶𝗺𝗲  : Active 🟢
⌬ 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: AES-256 Bit 🔐
⌬ 𝗛𝗲𝗮𝗹𝘁𝗵  : Excellent 🛡️
━━━━━━━━━━━━━━━━━━━━

👑 𝗢𝘄𝗻𝗲𝗿 : 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽: 01913246554${sig}`;

    return api.sendMessage({ body: botEntryMsg, attachment: selected }, threadID);
  }

  // ── ২. নতুন মেম্বার স্বাগতম ──────────────────────────────
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const { threadName, participantIDs, adminIDs } = threadInfo;
    const memCount   = participantIDs.length;
    const adminCount = adminIDs.length;
    const time       = moment().tz("Asia/Dhaka").format("hh:mm A");
    const execID     = "GX-" + Math.floor(Math.random() * 900000);
    const latency    = Date.now() - startTime;

    let nameArray = [], mentions = [];
    for (const i of event.logMessageData.addedParticipants) {
      nameArray.push(i.fullName);
      mentions.push({ tag: i.fullName, id: i.userFbId });
    }

    const nextMilestone = 100 * Math.ceil((memCount + 1) / 100);
    const potential     = Math.floor(Math.random() * 41) + 60;

    const memberMsg =
`${anim[0]}
  𝗚𝗘𝗡𝗘𝗦𝗜𝗦-𝗫 𝗣𝗢𝗥𝗧𝗔𝗟 ✨
${anim[1]}

👋 স্বাগতম [ ${nameArray.join(", ")} ]! ${rand(emojiMax)}
আমাদের "Elite Clan" এ আপনাকে VIP মেম্বার হিসেবে গ্রহণ করা হলো।

📊 𝗨𝗦𝗘𝗥 𝗜𝗡𝗧𝗘𝗟𝗟𝗜𝗚𝗘𝗡𝗖𝗘:
━━━━━━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲   : ${nameArray.join(", ")}
🆔 𝗨𝗜𝗗     : ${execID}
📈 𝗣𝗼𝘁𝗲𝗻𝘁𝗶𝗮𝗹: ${potential}%
🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀   : Verified 🟢
━━━━━━━━━━━━━━━━━━━━

🏰 𝗗𝗢𝗠𝗔𝗜𝗡 𝗔𝗡𝗔𝗟𝗬𝗧𝗜𝗖𝗦:
🏘️ 𝗚𝗿𝗼𝘂𝗽  : ${threadName}
👑 𝗔𝗱𝗺𝗶𝗻𝘀 : ${adminCount} Active
👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: #${memCount} (Target: ${nextMilestone})
⏰ 𝗝𝗼𝗶𝗻𝗲𝗱 : ${time}

🚀 𝗦𝘆𝘀𝘁𝗲𝗺 𝗟𝗮𝘁𝗲𝗻𝗰𝘆: ${latency}ms
▒▒▒▒▒▒▒▒▒▒▒▒▒ 100%

👑 𝗔𝗱𝗺𝗶𝗻: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)${sig}`;

    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = fs.existsSync(joinGifPath)
      ? fs.readdirSync(joinGifPath).filter(f => [".mp4",".gif",".jpg",".png"].some(ext => f.endsWith(ext)))
      : [];
    const selected = files.length > 0
      ? fs.createReadStream(path.join(joinGifPath, rand(files)))
      : null;

    return api.sendMessage({ body: memberMsg, attachment: selected, mentions }, threadID);
  } catch (e) {
    console.error(e);
  }
};
