<template>
  <div class="navbar">
      <div class="logo">🌾 小小农夫成长营</div>
      <div class="top-right" style="display:flex;align-items:center;gap:15px">
          <input type="text" class="search-box" placeholder="搜索农作物、节气、诗词...">
          <button class="nav-btn" @click="showPage('home')">首页</button>
          <button class="nav-btn" @click="showPage('user')">个人中心</button>
      </div>
  </div>
</template>

<script setup>
import { showPage } from '../../store'
</script>

<style scoped>
.navbar { width: 100%; height: 70px; background-color: #689F38; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; border-radius: 0 0 15px 15px; position: fixed; top: 0; z-index: 999; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.logo { display: flex; align-items: center; gap: 10px; color: white; font-size: 24px; font-weight: bold; }
.nav-btn { background: #FFE082; border: none; padding: 10px 18px; border-radius: 25px; color: #689F38; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; margin: 0 5px; }
.nav-btn:hover { transform: scale(1.1); background: #FFD54F; }
.search-box { width: 220px; height: 40px; background: white; border-radius: 20px; padding: 0 15px; border: none; outline: none; font-size: 15px; }
</style>
