<template>
  <div class="page active">
      <div style="text-align:center">
          <h2>👶 个人中心</h2>
          <div style="margin:30px 0">
              <div style="width:110px;height:110px;background:#FFE082;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:45px">👧</div>
              <h3 style="margin-top:15px">小农夫</h3>
          </div>
          <div class="card">
              <h3>🏅 我的勋章</h3>
              <p style="margin:20px 0;font-size:18px">
                  🟢 学习勋章 <span>✅</span> &nbsp;&nbsp;
                  🟡 答题勋章 <span>{{ store.bestLevel > 0 ? '✅' : '⏳' }}</span> &nbsp;&nbsp;
                  🔵 农场勋章 <span>{{ store.m3 }}</span> &nbsp;&nbsp;
                  🟣 游戏勋章 <span>{{ store.m4 }}</span>
              </p>
              <p>等级：初级小农夫</p>
              <p>总分：<span>{{ store.bestScore }}</span></p>
          </div>
      </div>
  </div>
</template>
<script setup>
import { store } from '../../store'
</script>
<style scoped>
.page { display: block; animation: fadeIn 0.4s;}
.card { background: white; border-radius: 15px; padding: 35px; border: 3px solid #FFF3E0; box-shadow: 0 5px 12px rgba(0,0,0,0.05); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>