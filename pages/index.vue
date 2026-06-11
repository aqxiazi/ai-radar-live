<template>
  <div>
    <section class="mb-8">
      <h1 class="text-2xl font-bold mb-2">🔥 今日 AI 前沿</h1>
      <p class="text-gray-400 text-sm">每日自动抓取全球 AI 工具、开源项目与论文</p>
    </section>

    <!-- 分类标签 -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="filter = cat"
        :class="[
          'px-3 py-1 rounded-full text-xs transition',
          filter === cat ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        ]"
      >{{ cat }}</button>
    </div>

    <!-- 文章列表 -->
    <div class="grid gap-4">
      <NuxtLink
        v-for="post in filteredPosts"
        :key="post._path"
        :to="post._path"
        class="block p-4 rounded-xl border border-gray-800 hover:border-cyan-700 transition group"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="inline-block px-2 py-0.5 rounded text-xs bg-gray-800 text-cyan-400 mb-2">{{ post.category }}</span>
            <h2 class="text-lg font-semibold group-hover:text-cyan-400 transition">{{ post.title }}</h2>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ post.description }}</p>
          </div>
          <time class="text-xs text-gray-600 whitespace-nowrap">{{ formatDate(post.date) }}</time>
        </div>
      </NuxtLink>
    </div>

    <p v-if="filteredPosts.length === 0" class="text-gray-500 text-center py-8">暂无内容，明天再来 🤖</p>
  </div>
</template>

<script setup>
const filter = ref('全部')
const categories = ref(['全部'])
const posts = ref([])
const filteredPosts = computed(() => {
  if (filter.value === '全部') return posts.value
  return posts.value.filter(p => p.category === filter.value)
})

async function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 加载文章数据 (修改路径以匹配 content/posts 目录)
const { data } = await useAsyncData('posts', () => queryContent('/posts').sort({ date: -1 }).find())
posts.value = data.value || []

// 提取分类
if (data.value?.length) {
  const cats = [...new Set(data.value.map(p => p.category).filter(Boolean))]
  categories.value = ['全部', ...cats]
}

useHead({ title: 'AI Daily Radar - 首页' })
</script>
