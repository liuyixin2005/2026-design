<template>
  <div class="page active">
      <div class="banner">
          <img src="https://pic.ibaotu.com/00/05/51/368888888889.jpg" class="img1">
          <img src="https://pic.588ku.com/background/00/00/40/498888888842.jpg" class="img2">
          走进农耕，拥抱自然
          <br>
          <span style="font-size:20px;margin-top:10px">学习植物知识，成为快乐小农夫</span>
      </div>

      <div class="menu-grid">
          <div class="menu-item" @click="showPage('class')">
              <div class="menu-icon">📚</div>
              <div class="menu-title">农耕小课堂</div>
          </div>
          <div class="menu-item" @click="showPage('quiz')">
              <div class="menu-icon">🏆</div>
              <div class="menu-title">知识大闯关</div>
          </div>
          <div class="menu-item" @click="showPage('farm')">
              <div class="menu-icon">🌱</div>
              <div class="menu-title">小小农场主</div>
          </div>
          <div class="menu-item" @click="showPage('parent')">
              <div class="menu-icon">🤝</div>
              <div class="menu-title">亲子实践营</div>
          </div>
          <div class="menu-item" @click="showPage('wiki')">
              <div class="menu-icon">📖</div>
              <div class="menu-title">农耕小百科</div>
          </div>
          <div class="menu-item" @click="showPage('game')">
              <div class="menu-icon">🎮</div>
              <div class="menu-title">趣味小游戏</div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { showPage } from '../../store'
</script>

<style scoped>
.page { display: block; }
.banner { width: 100%; height: 320px; background: linear-gradient(120deg, #FFE082, #81C784); border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.2); margin-bottom: 30px; animation: fade 4s infinite; position: relative; overflow: hidden; }
.banner img { position: absolute; width: 100px; opacity: 0.3; }
.banner .img1 { top:20px; left:30px; animation: float 3s infinite; }
.banner .img2 { bottom:20px; right:50px; animation: float 4s infinite; }
@keyframes fade { 0%,100%{opacity:1;} 50%{opacity:0.92;} }
@keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
.menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
.menu-item { background: white; border-radius: 15px; padding: 30px; text-align: center; border: 3px solid #FFF3E0; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 10px rgba(0,0,0,0.05); }
.menu-item:hover { transform: translateY(-8px) scale(1.05); border-color: #FFB74D; box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
.menu-icon { width: 110px; height: 110px; background: #FFE082; border-radius: 50%; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 45px; color: #689F38; }
.menu-title { font-size: 20px; font-weight: bold; color: #212121; }
</style>
