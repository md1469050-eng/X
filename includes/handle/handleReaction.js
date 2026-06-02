"use strict";
module.exports = function ({ api, models, Users, Threads, Currencies }) {
  return async function ({ event }) {
    const { handleReaction } = global.client;
    const { reaction, userID, messageID, threadID } = event;

    const adminList = (global.config?.ADMINBOT || []).map(String);
    const isAdmin = adminList.includes(String(userID));

    // ══════════════════════════════════════════════════
    //  😡🚫 বট এডমিন রিয়েক্ট → মেসেজ ডিলিট
    // ══════════════════════════════════════════════════
    const deleteReacts = ["😡", "🚫"];
    if (deleteReacts.includes(reaction) && isAdmin) {
      try {
        await api.unsendMessage(messageID);
        global.log.success(`[ডিলিট] Admin (${userID}) → msg ${messageID} ডিলিট হয়েছে`);
      } catch (err) {
        global.log.error(`[ডিলিট] ব্যর্থ: ${err.message}`);
      }
      return;
    }

    // ══════════════════════════════════════════════════
    //  ⚠️ বট এডমিন রিয়েক্ট → মেসেজ sender কে kick
    // ══════════════════════════════════════════════════
    const kickReacts = ["⚠️"];
    if (kickReacts.includes(reaction) && isAdmin) {
      try {
        const botID = String(api.getCurrentUserID());

        // cache থেকে sender বের করো
        const cached = global.client.messageCache?.get(messageID);
        const targetID = cached ? String(cached.senderID) : null;

        if (!targetID) {
          await api.sendMessage("⚠️ মেসেজটি cache এ নেই, বট চালু হওয়ার আগের মেসেজে কাজ করবে না।", threadID);
          return;
        }

        if (targetID === botID) {
          await api.sendMessage("⚠️ বটের নিজের মেসেজে kick হবে না।", threadID);
          return;
        }

        // বট অ্যাডমিন কিনা চেক করো
        const threadInfo = await api.getThreadInfo(threadID);
        const botIsAdmin = threadInfo.adminIDs?.some(a => String(a.id) === botID);
        if (!botIsAdmin) {
          await api.sendMessage("⚠️ বট গ্রুপ অ্যাডমিন নয়, kick করা সম্ভব হয়নি।", threadID);
          return;
        }

        // টার্গেট অ্যাডমিন কিনা চেক করো
        const targetIsAdmin = threadInfo.adminIDs?.some(a => String(a.id) === targetID);
        if (targetIsAdmin) {
          await api.sendMessage("⚠️ অ্যাডমিনকে kick করা যাবে না।", threadID);
          return;
        }

        await api.removeUserFromGroup(targetID, threadID);
        await api.sendMessage(`✅ ইউজার (${targetID}) কে গ্রুপ থেকে বের করা হয়েছে।`, threadID);
        global.log.success(`[KICK] Admin (${userID}) → user ${targetID} kicked`);

      } catch (err) {
        global.log.error(`[KICK] ব্যর্থ: ${err.message}`);
        await api.sendMessage(`❌ kick ব্যর্থ: ${err.message}`, threadID);
      }
      return;
    }

    // ══════════════════════════════════════════════════
    //  পুরনো reactUnsend: বট নিজের মেসেজে
    // ══════════════════════════════════════════════════
    const reactUnsend = global.config.BOT_MODES?.reactUnsend || ["🤧", "😤", "😠"];
    if (reactUnsend.includes(reaction) && userID === api.getCurrentUserID()) {
      try { api.unsendMessage(messageID); } catch {}
      return;
    }

    // ══════════════════════════════════════════════════
    //  handleReaction queue (কমান্ড-ভিত্তিক)
    // ══════════════════════════════════════════════════
    for (const handler of handleReaction) {
      if (handler.messageID !== messageID) continue;
      try {
        const cmd = global.client.commands.get(handler.commandName);
        if (cmd?.handleReaction)
          await cmd.handleReaction({ api, event, models, Users, Threads, Currencies, ...handler });
      } catch (err) {
        global.log.error(`Reaction handler ত্রুটি: ${err.message}`);
      }
    }
  };
};
        
