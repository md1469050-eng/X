const axios = require('axios');

// 🔥 শুধু ইন্ডিয়ান হট ভিডিও, রিমিক্স ও এডিটর কীওয়ার্ড
const SEARCH_TERMS = [
    "indian hot girl dance",
    "indian hot reels",
    "indian capcut edit hot",
    "indian viral girl dance",
    "indian hot remix",
    "indian hot edit",
    "indian girl dance remix",
    "indian hot viral reels",
    "desi hot dance reels",
    "indian college girl dance",
    "indian hot dance video",
    "indian remix dance",
    "indian hot edit reels",
    "indian trending girl",
    "desi hot remix",
    "indian aesthetic dance",
    "indian hot viral remix"
];

// ❌ বাইরের দেশি বা ফালতু ভিডিও বাদ দেওয়ার কীওয়ার্ড
const EXCLUDE_WORDS = [
    "pakistani", "bangladeshi", "nepali", "srilankan", "arab", "turkey", "iran",
    "american", "uk", "europe", "russian", "african", "chinese", "japanese",
    "korean", "thai", "vietnamese", "malay", "white girl", "foreign"
];

// একই ভিডিও বারবার আসা ঠেকাতে
let recentVideoIds = [];

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
];

module.exports = {
    config: {
        name: "hot",
        aliases: ["হট", "hotreels", "indianhot"],
        description: "শুধু ইন্ডিয়ান হট ভিডিও, রিমিক্স ও এডিটর কন্টেন্ট (বিদেশি ভিডিও বাদ)",
        usage: "hot",
        cooldown: 10,
        role: 0
    },
    run: async ({ api, event }) => {
        const wait = await api.sendMessage("🔥 ইন্ডিয়ান হট ভিডিও খুঁজে বের করছি...", event.threadID);
        try {
            let videoFound = false;
            let attempts = 0;
            let videoUrl = null;
            let videoTitle = null;
            let videoDigg = 0;

            while (!videoFound && attempts < 8) {
                const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
                const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

                const response = await axios.get(
                    `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(randomTerm)}&count=40`,
                    { headers: { 'User-Agent': randomUA }, timeout: 15000 }
                );

                let videos = response.data?.data?.videos;
                if (!videos || videos.length === 0) continue;

                let availableVideos = videos.filter(v => !recentVideoIds.includes(v.video_id));
                if (availableVideos.length === 0) {
                    recentVideoIds = [];
                    availableVideos = videos;
                }

                // এলোমেলো ভিডিও বাছাই করে চেক
                for (let i = 0; i < availableVideos.length; i++) {
                    const candidate = availableVideos[i];
                    const title = (candidate.title || "").toLowerCase();
                    const author = (candidate.author?.unique_id || "").toLowerCase();
                    
                    // শর্ত: ইন্ডিয়ান কন্টেন্ট নিশ্চিত এবং বাইরের দেশের নয়
                    let isIndian = title.includes("indian") || author.includes("indian") || 
                                   title.includes("desi") || author.includes("desi");
                    let isExcluded = EXCLUDE_WORDS.some(word => title.includes(word) || author.includes(word));
                    
                    // মেয়েদের ভিডিও নিশ্চিত করতে (ছেলেদের বাদ)
                    let isMale = title.includes("boy") || title.includes("male") || author.includes("boy");
                    
                    if (isIndian && !isExcluded && !isMale) {
                        videoUrl = candidate.play;
                        videoTitle = candidate.title;
                        videoDigg = candidate.digg_count || 0;
                        recentVideoIds.push(candidate.video_id);
                        if (recentVideoIds.length > 25) recentVideoIds.shift();
                        videoFound = true;
                        break;
                    }
                }
                attempts++;
            }

            if (!videoUrl) throw new Error("কোনো ইন্ডিয়ান হট ভিডিও পাওয়া যায়নি");

            const videoStream = await axios.get(videoUrl, { responseType: 'stream', timeout: 20000 }).then(r => r.data);
            await api.sendMessage({
                body: `💃 ইন্ডিয়ান হট ভিডিও:\n📹 ${videoTitle || "Indian Hot Dance"}\n❤️ লাইক: ${videoDigg}`,
                attachment: videoStream
            }, event.threadID);
            await api.unsendMessage(wait.messageID);
        } catch (error) {
            console.error("Indian Hot error:", error.message);
            api.sendMessage(`❌ ইন্ডিয়ান হট ভিডিও আনতে ব্যর্থ। আবার চেষ্টা করুন।`, event.threadID);
            await api.unsendMessage(wait.messageID);
        }
    }
};
