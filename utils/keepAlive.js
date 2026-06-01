/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *   BELAL BOTX666 — Keep Alive Server
 *   Render.com এ bot জীবিত রাখে
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

"use strict";

const express = require("express");
const axios   = require("axios");
const logger  = require("./log");

module.exports = function keepAlive() {
  const app  = express();
  const PORT = global.config?.Render?.port || process.env.PORT || 3000;

  app.get("/", (req, res) => {
    res.json({
      status:   "🟢 Online",
      bot:      "BELAL BOTX666",
      version:  "7.0.0",
      master:   "Belal YT — চাঁদের পাহাড়",
      uptime:   Math.floor(process.uptime()) + "s",
      commands: global.client?.commands?.size || 0,
      events:   global.client?.events?.size   || 0,
      time:     new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }),
    });
  });

  app.get("/ping",   (req, res) => res.send("🏓 Pong!"));
  app.get("/health", (req, res) => res.json({ status: "healthy" }));

  const server = app.listen(PORT, () => {
    logger.success(`🌐 Keep-Alive Server চালু: Port ${PORT}`);
  });

  // Port ব্যবহারে থাকলে পরের port try করো
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      const fallback = PORT + 1;
      logger.warn(`⚠️ Port ${PORT} busy, port ${fallback} এ চেষ্টা করছি...`);
      app.listen(fallback, () => {
        logger.success(`🌐 Keep-Alive Server চালু: Port ${fallback}`);
      });
    } else {
      logger.warn(`Keep-Alive error: ${e.message}`);
    }
  });

  // নিজেই নিজেকে ping করে জীবিত রাখে
  const pingURL = global.config?.Render?.pingURL;
  if (pingURL) {
    const interval = global.config?.Render?.keepAliveInterval || 840000;
    setInterval(async () => {
      try {
        await axios.get(pingURL + "/ping", { timeout: 10000 });
        logger.info("🏓 Keep-alive ping সফল!");
      } catch {
        logger.warn("⚠️ Keep-alive ping ব্যর্থ!");
      }
    }, interval);
  }
};
                 
