// 미리보기용 초경량 정적 서버 (라이브리로드 소켓 없음 → 스크린샷 네트워크 유휴 보장)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "_site");
const PORT = process.env.PORT || 8082;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".jpx": "image/jpeg",
  ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  let filePath = path.join(ROOT, urlPath);

  fs.stat(filePath, (err, stat) => {
    // 확장자 없는 깔끔한 URL(/about/ 형태) 대응
    if (err || stat.isDirectory()) {
      const alt = path.join(ROOT, urlPath, "index.html");
      return fs.readFile(alt, (e, data) => {
        if (e) { res.writeHead(404); return res.end("404"); }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      });
    }
    fs.readFile(filePath, (e, data) => {
      if (e) { res.writeHead(500); return res.end("500"); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  });
}).listen(PORT, () => console.log(`static server: http://localhost:${PORT}/`));
