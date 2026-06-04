const axios = require('axios');

// 🎯 নির্দিষ্ট বাংলাদেশি ট্রল ভিডিওর ইউটিউব লিংক (যা সরাসরি কাজ করে)
const BRAZIL_TROLL_VIDEOS = [
    "https://www.youtube.com/watch?v=VKMnIILUhwk", // আর্জেন্টিনা vs ব্রাজিল মজার ভিডিও
    "https://www.youtube.com/watch?v=ALCBFT8pZDc", // দেশী ফুটবলার (বাংলা ফানি ভিডিও)
    "https://www.youtube.com/watch?v=QnSRu1wKB-0", // ব্রাজিল VS আর্জেন্টিনা (বাংলা ফানি ভিডিও)
    "https://www.youtube.com/watch?v=s3kJsjJj6IY"  // বাংলা ফানি ডাবিং (আর্জেন্টিনা নিয়ে)
];

// 🔥 আর্জেন্টিনাকে ট্রল করে এমন মজার ওয়ার্ড (বাংলাদেশি কন্টেন্টের জন্য)
const SEARCH_TERMS = [
    "Argentina funny troll Bangladesh",
    "আর্জেন্টিনা ট্রল মজার ভিডিও",
    "Argentina troll Brazilian meme Bangla",
    "Bangladeshi Argentina troll video",
    "Argentina vs Brazil Bangla funny video",
    "Argentina troll Bangladesh comedy",
    "Brazil vs Argentina মজার ভিডিও",
    "আর্জেন্টিনা নিয়ে মজার ভিডিও",
    "Argentina troll Bangladesh football fans",
    "Argentina troll meme Bengali"
];

// ইতিমধ্যে দেখা ভিডিও ট্র্যাক করা
let recentVideoIds = [];
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
];

module.exports = {
    config: {
        name: "brazil",
        aliases: ["brasil", "bratroll", "ব্রাজিল"],
        description: "🇧🇷 vs 🇦🇷 আর্জেন্টিনাকে ট্রল করে বাংলাদেশি ফানি ভিডিও (একদম জমজমাট)",
        usage: "brazil",
        cooldown: 12,
        role: 0
    },
    run: async ({ api, event }) => {
        const waitMsg = await api.sendMessage("⚽ বাংলাদেশের ফানি ট্রল ভিডিও খুঁজে বের করছি...", event.threadID);
        try {
            // 📌 50% চান্স বাংলাদেশি ভিডিও, 50% চান্স সার্চ করা ভিডিও
            const isBangladeshiVideo = Math.random() < 0.5; // 50% সময় সরাসরি লিংক

            let videoUrl = null;
            let videoTitle = null;

            if (isBangladeshiVideo && BRAZIL_TROLL_VIDEOS.length > 0) {
                // ১. সরাসরি বাংলাদেশি ভিডিও লিংক থেকে বাছাই (এলোমেলো)
                const randomIndex = Math.floor(Math.random() * BRAZIL_TROLL_VIDEOS.length);
                videoUrl = BRAZIL_TROLL_VIDEOS[randomIndex];
                videoTitle = "বাংলাদেশি আর্জেন্টিনা ট্রল ফানি ভিডিও";
            } else {
                // ২. TikTok API ব্যবহার করে সার্চ করা
                const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
                const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
                const response = await axios.get(
                    `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(randomTerm)}&count=25`,
                    { headers: { 'User-Agent': randomUA }, timeout: 15000 }
                );
                let videos = response.data?.data?.videos;
                if (!videos || videos.length === 0) throw new Error("ভিডিও পাওয়া যায়নি");

                let availableVideos = videos.filter(v => !recentVideoIds.includes(v.video_id));
                if (availableVideos.length === 0) {
                    recentVideoIds = [];
                    availableVideos = videos;
                }
                const randomVideo = availableVideos[Math.floor(Math.random() * availableVideos.length)];
                videoUrl = randomVideo.play;
                videoTitle = randomVideo.title || "Argentina Troll Video";
                if (!videoUrl) throw new Error("URL নেই");

                recentVideoIds.push(randomVideo.video_id);
                if (recentVideoIds.length > 25) recentVideoIds.shift();
            }

            if (!videoUrl) throw new Error("ভিডিও লিংক পাওয়া যায়নি");

            // ৩. ভিডিও স্ট্রিম করে মেসেঞ্জারে পাঠানো
            const videoStream = await axios.get(videoUrl, { responseType: 'stream', timeout: 20000 }).then(r => r.data);
            await api.sendMessage({
                body: `🎭 আর্জেন্টিনাকে ট্রল করে মজার ভিডিও:\n📹 ${videoTitle}\n❤️ লাইক কমেন্ট করো আর মজা নাও!`,
                attachment: videoStream
            }, event.threadID);

            await api.unsendMessage(waitMsg.messageID);
        } catch (err) {
            console.error("Brazil troll error:", err.message);
            // ❌ API কাজ না করলে ইউজারকে মেসেজ পাঠানো
            api.sendMessage(`❌ ভিডিও আনতে ব্যর্থ। আবার চেষ্টা করুন।`, event.threadID);
            await api.unsendMessage(waitMsg.messageID);
        }
    }
};
