import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as uploadRouter } from './routes/upload.js';
import { router as folderRouter } from './routes/folder.js';
import fs from 'fs';
import helmet from 'helmet';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3033;

app.use(express.static(path.join(__dirname, '../public'))); // 使用静态文件服务器
app.use(express.json()); // 解析 JSON 格式的请求主体

// 允许来自主网域的跨域请求
const corsOptions = {
  origin: 'https://papperhelper.xyz', // 允许的前端域名
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // 允许的 HTTP 方法
  allowedHeaders: 'Content-Type,Authorization', // 允许的请求头
  credentials: true, // 如果需要支持跨域 cookie，设置为 true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 处理预检请求

// 配置 helmet 允许 iframe 嵌套
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameSrc: ["'self'", "https://papperhelper.xyz"], // 允许嵌套来源
        objectSrc: ["'none'"], // 禁止其他嵌套对象（如 Flash）
        scriptSrc: ["'self'"], // 限制脚本来源
        styleSrc: ["'self'", "'unsafe-inline'"], // 限制样式来源
      },
    },
  })
);

// 读取 config.yaml 文件
const config = yaml.load(fs.readFileSync('../../config.yaml', 'utf8'));

// Access a specific property
const pdf_folder = './../pdf_to_image';

console.log(pdf_folder);
const imageFolderPath = pdf_folder; // path.join(__dirname, '../uploads');

app.use('/uploads', express.static(imageFolderPath));

// 新增 API 路由来读取特定文件夹图片
app.get('/api/images', (req, res) => {
  fs.readdir(imageFolderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read directory', error: err });
    }

    // 过滤图片文件
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
    res.json(imageFiles.map((file) => `/uploads/${file}`)); // 返回图片 URL 列表
  });
});

// Routes
app.use('/api/upload', uploadRouter); // 处理上传图片的路由
app.use('/api/folder', folderRouter); // 处理文件夹相关的路由

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html')); // 发送 index.html 文件
});

app.listen(port, () => {
  console.log(`Imagecropper at http://localhost:${port}`);
});
