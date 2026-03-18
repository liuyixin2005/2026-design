<template>
  <div class="about">
    <h1>关于本项目</h1>
    <p>本项目是2026年计算机设计大赛参赛作品，同时作为web开发课程的大作业。</p>
    <p>项目采用前后端分离架构：</p>
    <ul>
      <li>前台：Vue 3 + Vite</li>
      <li>后台：Node.js + Express + MongoDB</li>
    </ul>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
}

.about h1 {
  font-size: 2rem;
  margin-bottom: 24px;
  color: #4a90d9;
}

.about p {
  margin-bottom: 16px;
  font-size: 1.1rem;
  line-height: 1.8;
}

.about ul {
  padding-left: 24px;
  font-size: 1.1rem;
  line-height: 2;
}
</style>
