<template>
  <div class="home">
    <header class="hero">
      <h1>2026 设计大赛</h1>
      <p>探索创意，展示才华</p>
    </header>

    <main class="content">
      <section class="features">
        <div class="feature-card">
          <h2>作品展示</h2>
          <p>浏览来自全国各地的优秀设计作品</p>
        </div>
        <div class="feature-card">
          <h2>参赛报名</h2>
          <p>提交您的设计作品，参与竞赛评选</p>
        </div>
        <div class="feature-card">
          <h2>专家评审</h2>
          <p>行业专家亲自评审，公正公平公开</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  background: linear-gradient(135deg, #4a90d9, #2c5f8a);
  color: white;
  text-align: center;
  padding: 80px 20px;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 16px;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h2 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #4a90d9;
}
</style>
