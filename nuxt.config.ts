export default defineNuxtConfig({
  compatibilityDate: '2025-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/content'],
  content: {
    markdown: {
      toc: { depth: 3, searchDepth: 3 },
    },
  },
  ssr: true, // 恢复 SSR 模式，确保内容被预渲染到 HTML 中
  app: {
    baseURL: '/ai-radar-live/', // GitHub Pages 仓库名路径
    head: {
      title: 'AI Daily Radar - 每日 AI 前沿',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '全自动 AI 资讯导航站，每日更新全球 AI 工具与前沿技术' },
      ],
    },
  },
});
