const axios = require('axios');

// 🔥 শুধু মেয়েদের হট ড্যান্স, রিমিক্স ও এডিটের নির্দিষ্ট কীওয়ার্ড (টার্গেটেড)
const SEARCH_TERMS = [
    "hot girl dance",
    "hot girls reels",
    "maishayourqueen",
    "capcut_edit girl",
    "hot girls edit",
    "tiktok hot girl dance",
    "hot dance girl viral",
    "dansarbabyshop",
    "hot dance viral remix girl",
    "trending girl remix",
    "hot edit girl",
    "hotgirlsdance",
    "bestgirlschallenges",
    "sexy dance girl",
    "girl dance capcut"
];

// ❌ বাদ দেওয়ার জন্য কীওয়ার্ড (ছেলে, পুরুষ, ইত্যাদি যাতে না আসে)
const EXCLUDE_WORDS = ["boy", "male", "guy", "man", "bro", "dude", "ছেলে", "পুরুষ"];

// একই ভিডিও বারবার আসা ঠেকাতে
let recentVideoIds = [];

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
];

module.exports = {
    config: {
        name: "hot",
        aliases: ["হট", "hotreels", "hotgirls"],
        description: "শুধু হট গার্লস ড্যান্স, রিমিক্স ও ক্যাপকাট এডিট ভিডিও (ছেলের ভিডিও বাদ)",
        usage: "hot",
        cooldown: 10,
        role: 0
    },
    run: async ({ api, event }) => {
        const wait = await api.sendMessage("🔥 শুধু হট গার্লস ভিডিও খুঁজে বের করছি...", event.threadID);
        try {
            let videoFound = false;
            let attempts = 0;
            let videoUrl = null;
            let videoTitle = null;
            let videoDigg = 0;

            // ৫ বার চেষ্টা করবে যতক্ষণ না একটি গ্রহণযোগ্য ভিডিও পাওয়া যায়
            while (!videoFound && attempts < 5) {
                const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
                const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

                const response = await axios.get(
                    `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(randomTerm)}&count=40`,
                    { headers: { 'User-Agent': randomUA }, timeout: 15000 }
                );

                let videos = response.data?.data?.videos;
                if (!videos || videos.length === 0) continue;

                // আগে দেখা ভিডিও বাদ
                let availableVideos = videos.filter(v => !recentVideoIds.includes(v.video_id));
                if (availableVideos.length === 0) {
                    recentVideoIds = [];
                    availableVideos = videos;
                }

                // এলোমেলো ভিডিও বাছাই করে চেক করো বাদ পড়ার শর্ত আছে কিনা
                for (let i = 0; i < availableVideos.length; i++) {
                    const candidate = availableVideos[i];
                    const title = (candidate.title || "").toLowerCase();
                    // চেক করো টাইটেলে কোন এক্সক্লুড ওয়ার্ড আছে কিনা
                    let containsExclude = EXCLUDE_WORDS.some(word => title.includes(word));
                    if (!containsExclude) {
                        // অতিরিক্ত চেক: ভিডিওর ইউজারের নামেও যেন "boy" না থাকে
                        const authorName = (candidate.author?.unique_id || "").toLowerCase();
                        if (!EXCLUDE_WORDS.some(word => authorName.includes(word))) {
                            videoUrl = candidate.play;
                            videoTitle = candidate.title;
                            videoDigg = candidate.digg_count || 0;
                            recentVideoIds.push(candidate.video_id);
                            if (recentVideoIds.length > 25) recentVideoIds.shift();
                            videoFound = true;
                            break;
                        }
                    }
                }
                attempts++;
            }

            if (!videoUrl) throw new Error("কোনো গ্রহণযোগ্য ভিডিও পাওয়া যায়নি");

            const videoStream = await axios.get(videoUrl, { responseType: 'stream', timeout: 20000 }).then(r => r.data);
            await api.sendMessage({
                body: `💃 আপনার জন্য হট গার্লস ভিডিও:\n📹 ${videoTitle || "Hot Dance"}\n❤️ লাইক: ${videoDigg}`,
                attachment: videoStream
            }, event.threadID);
            await api.unsendMessage(wait.messageID);
        } catch (error) {
            console.error("Hot command error:", error.message);
            api.sendMessage(`❌ ভিডিও আনতে ব্যর্থ। আবার চেষ্টা করুন।`, event.threadID);
            await api.unsendMessage(wait.messageID);
        }
    }
};
