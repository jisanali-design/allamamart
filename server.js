// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var rawPort = parseInt(process.env.DEFAULT_APP_PORT || "3000", 10);
var PORT = process.env.PORT && process.env.PORT !== "8080" ? parseInt(process.env.PORT, 10) : rawPort;
app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var publicDir = path.resolve(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
var distDir = path.resolve(__dirname, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => {
    if (path.extname(req.path)) {
      res.status(404).end();
      return;
    }
    res.sendFile(path.resolve(distDir, "index.html"));
  });
} else {
  app.get("*", (_req, res) => {
    res.status(503).send("Application is still building. Please refresh in a few moments.");
  });
}
var server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
