"use strict";
const axios  = require("axios");
const fs     = require("fs-extra");
const path   = require("path");
const Canvas = require("canvas");
const moment = require("moment-timezone");

module.exports.config = {
  name: "leaveNoti",
  eventType: ["log:unsubscribe"],
  version: "17.0.0",
  credits: "Belal x Gemini",
  description: "স্পেশাল ডার্ক নিওন কার্ড লিভ ডিজাইন",
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  if (event.logMessageType !== "log:unsubscribe") return;
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const { threadID } = event;
  const leftID       = event.logMessageData.leftParticipantFbId;

  // নাম বের করা
  let name = "Facebook User";
  try {
    name = global.data.userName.get(String(leftID)) || await Users.getNameUser(leftID);
  } catch (_) {}

  const time = moment.tz("Asia/Dhaka").format("hh:mm A | DD/MM/YYYY");

  const emojiMax = ["🔱","💎","🛡️","🛸","🌀","🛰️","🦾","🧿","💫","🎐","🐉","🔥","👑","🌠","🌌","🏙️","🏮","🎭","🎮","🍾","🥃","✨","🌟","🎇","🔮","🧪","⚙️","🔋","📡","🧊","💠","🏆","🦾","🎖️","⚡","🌈","🎋","🍃","🌹"];
  const rand     = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const roastTxt = (event.author == leftID)
    ? `নিজে নিজেই পালালি? ${rand(emojiMax)} রাস্তা মাপ আবাল! যা ভাগ! 💩`
    : `থাকার যোগ্যতা নেই তোর! 😡 তোকে সজোরে একটা লাথি মেরে বের করে দেওয়া হলো! 👞💥`;

  // ── ১. টেক্সট মেসেজ আগে পাঠাও (তাৎক্ষণিক) ─────────────
  const finalMsg =
`┏━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┓
   ⚠️ 𝗟𝗢𝗦𝗘𝗥 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 ⚠️
┗━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┛

আহারে ${name}! ${rand(emojiMax)}
${roastTxt}

👑 𝗔𝗱𝗺𝗶𝗻: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
┈──╼ ┄┉❈${rand(emojiMax)}⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ${rand(emojiMax)}`;

  api.sendMessage(finalMsg, threadID); // await নেই — সাথে সাথে পাঠাও

  // ── ২. ইমেজ background এ বানাও ও পাঠাও ─────────────────
  const cacheDir  = path.join(__dirname, "cache");
  const cachePath = path.join(cacheDir, `leave_${leftID}.png`);
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  try {
    // শুধু avatar — local gradient bg (দ্রুত)
    const avatarUrl = `https://graph.facebook.com/${leftID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarRes = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 6000 })
      .catch(() => axios.get("https://i.imgur.com/6ve9YAs.png", { responseType: "arraybuffer", timeout: 6000 }));

    const canvas = Canvas.createCanvas(1200, 700);
    const ctx    = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড — local gradient (কোনো URL নেই)
    const bg = ctx.createLinearGradient(0, 0, 1200, 700);
    bg.addColorStop(0,    "#06000F");
    bg.addColorStop(0.35, "#1B0026");
    bg.addColorStop(0.65, "#22000F");
    bg.addColorStop(1,    "#06000F");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 700);

    // গ্রিড
    ctx.strokeStyle = "rgba(255,0,60,0.07)";
    ctx.lineWidth   = 1;
    for (let x = 0; x < 1200; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,700); ctx.stroke(); }
    for (let y = 0; y < 700;  y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1200,y); ctx.stroke(); }

    // গ্লাস কার্ড
    ctx.save();
    ctx.shadowColor = "#FF0000"; ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(440,190); ctx.lineTo(1110,190);
    ctx.quadraticCurveTo(1150,190,1150,230);
    ctx.lineTo(1150,560); ctx.quadraticCurveTo(1150,600,1110,600);
    ctx.lineTo(440,600); ctx.quadraticCurveTo(400,600,400,560);
    ctx.lineTo(400,230); ctx.quadraticCurveTo(400,190,440,190);
    ctx.closePath();
    ctx.fillStyle   = "rgba(0,0,0,0.80)"; ctx.fill();
    ctx.strokeStyle = "#FF0000"; ctx.lineWidth = 8; ctx.stroke();
    ctx.restore();

    // প্রোফাইল সার্কেল
    ctx.save();
    ctx.shadowColor = "#FF0000"; ctx.shadowBlur = 45;
    ctx.beginPath(); ctx.arc(230,375,170,0,Math.PI*2);
    ctx.fillStyle = "#FF0000"; ctx.fill();
    ctx.beginPath(); ctx.arc(230,375,160,0,Math.PI*2); ctx.clip();
    ctx.drawImage(await Canvas.loadImage(avatarRes.data), 70,215,320,320);
    ctx.restore();

    // REST IN HELL
    ctx.save();
    ctx.font="bold 72px Arial"; ctx.fillStyle="#FF0000";
    ctx.shadowColor="#FF0000"; ctx.shadowBlur=20;
    ctx.fillText("REST IN HELL", 430,155);
    ctx.restore();

    // USER EXIT
    ctx.save();
    ctx.font="bold 30px Arial"; ctx.fillStyle="#00FFFF";
    ctx.shadowColor="#00FFFF"; ctx.shadowBlur=10;
    ctx.fillText("━━━━━━━ 𝗨𝗦𝗘𝗥 𝗘𝗫𝗜𝗧 ━━━━━━━", 430,280);
    ctx.restore();

    // ইনফো
    ctx.save();
    ctx.font="38px Arial"; ctx.fillStyle="#FFFFFF";
    ctx.shadowColor="#000000"; ctx.shadowBlur=8;
    ctx.fillText(`👤 𝗡𝗮𝗺𝗲 : ${name.length>20?name.slice(0,20)+"…":name}`, 430,360);
    ctx.fillText(`🆔 𝗜𝗗   : ${leftID}`, 430,430);
    ctx.fillText(`⏰ 𝗧𝗶𝗺𝗲 : ${time}`, 430,500);
    ctx.restore();

    // Admin ব্যাজ
    ctx.save();
    ctx.font="bold 36px Arial"; ctx.fillStyle="#FFD700";
    ctx.shadowColor="#FFD700"; ctx.shadowBlur=15;
    ctx.fillText("👑 𝗔𝗱𝗺𝗶𝗻 : 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)", 430,575);
    ctx.restore();

    fs.writeFileSync(cachePath, canvas.toBuffer());

    // ইমেজ পাঠাও
    api.sendMessage(
      { attachment: fs.createReadStream(cachePath) },
      threadID,
      () => { try { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); } catch (_) {} }
    );

  } catch (e) {
    console.error(e);
  }
};
