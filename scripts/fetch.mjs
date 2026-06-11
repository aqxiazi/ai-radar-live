import fs from 'fs';
import path from 'path';
import axios from 'axios';
import TurndownService from 'turndown';

const turndown = new TurndownService();
const CONTENT_DIR = path.join('content', 'posts');
const PUBLIC_DIR = path.join('public');
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const RSS_SOURCES = [
  { name: 'HackerNews AI', url: 'https://hnrss.org/newest?q=AI&count=10', category: 'AI' },
  { name: 'HackerNews Top', url: 'https://news.ycombinator.com/rss', category: '热门' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: '资讯' },
];

// 简单的 RSS 解析器
function parseRSS(xml) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '').replace(/&#\d+;/g, '');
    const link = item.match(/<link>(.*?)<\/link>/)?.[1];
    const rawDesc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || item.match(/<description>(.*?)<\/description>/)?.[1] || '';
    const description = turndown.turndown(rawDesc.replace(/&#\d+;/g, ''));
    if (title && link) {
      items.push({ title, link, description });
    }
  }
  return items;
}

// 模拟 LLM 调用 (实际部署时替换为 Jellyfish API)
async function summarizeWithAI(item, source) {
  // 这里模拟 AI 生成，实际可接入 OpenAI/Jellyfish
  // 示例：返回结构化的 Markdown
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const date = new Date().toISOString().split('T')[0];
  
  // 提取真实摘要用于展示 (前 150 字符)
  let descPreview = item.description.replace(/"/g, '').substring(0, 150).replace(/\n/g, ' ');
  if (!descPreview || descPreview.length < 10) {
    descPreview = "点击查看原文以获取详细内容";
  }
  
  const content = `---
title: "${item.title.replace(/"/g, '\\"')}"
date: ${date}
category: "${source.category}"
description: "${descPreview}..."
source: "${source.name}"
affiliateLink: "${item.link}"
---

## 简介

${item.description.length > 50 ? item.description.substring(0, 300) : "请点击阅读原文查看详细内容。"}...

## 核心功能

1. **智能生成**：利用最新 AI 模型提升效率。
2. **自动化流程**：一键完成复杂任务。

> 💡 **提示**: 通过上方链接访问官网，体验最新功能。

[阅读原文](${item.link})
`;
  return { slug, content };
}

async function fetchAndSave() {
  console.log('🔍 开始抓取数据...');
  
  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在抓取 ${source.name}...`);
      const res = await axios.get(source.url, {
        headers: { 'User-Agent': 'AI-Daily-Radar/1.0' },
        timeout: 10000
      });
      
      const items = parseRSS(res.data);
      
      for (const item of items.slice(0, 3)) { // 每个源只取前 3 条
        const { slug, content } = await summarizeWithAI(item, source);
        const filePath = path.join(CONTENT_DIR, `${slug}.md`);
        
        // 总是更新内容，确保摘要和分类是最新的
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ 已保存/更新: ${slug}`);
      }
    } catch (err) {
      console.error(`❌ ${source.name} 抓取失败:`, err.message);
    }
  }
  
  console.log('🎉 抓取完成！');

  // 生成 public/posts.json 供前端直接读取
  const posts = [];
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const match = content.match(/---\n([\s\S]*?)---/);
    if (match) {
      const meta = {};
      match[1].split('\n').forEach(line => {
        const [k, v] = line.split(': ');
        if (k && v) meta[k.trim()] = v.replace(/"/g, '').trim();
      });
      posts.push(meta);
    }
  }
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'posts.json'), JSON.stringify(posts, null, 2), 'utf-8');
  console.log(`📄 已生成 ${PUBLIC_DIR}/posts.json 包含 ${posts.length} 篇文章`);
}

fetchAndSave();
