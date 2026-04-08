<template>
  <div class="page active">
      <div style="text-align:center;margin-bottom:25px"><h2>🤝 亲子实践营</h2></div>
      <div class="card">
          <h3>亲子农耕任务</h3>
          <ul style="font-size:18px;line-height:2;margin:20px 0;padding-left:20px">
              <li>和爸爸妈妈一起认识家里的蔬菜</li>
              <li>种植一盆小绿植，观察生长过程</li>
              <li>一起制作水果沙拉，认识农作物</li>
              <li>学习光盘行动，珍惜粮食</li>
              <li>了解农民伯伯的辛苦</li>
          </ul>
          <div style="text-align:center">
              <button class="quiz-btn" @click="showAlert('任务开始！完成后记得打卡哦～')">开始任务</button>
          </div>
      </div>
  </div>
</template>
<script setup>
const showAlert = (msg) => alert(msg)
</script>
<style scoped>
.page { display: block; animation: fadeIn 0.4s;}
.card { background: white; border-radius: 15px; padding: 35px; border: 3px solid #FFF3E0; box-shadow: 0 5px 12px rgba(0,0,0,0.05); }
.quiz-btn { background: #689F38; color: white; border: none; padding: 14px 35px; border-radius: 25px; font-size: 19px; cursor: pointer; transition: 0.3s; }
.quiz-btn:hover { transform: scale(1.08); background: #4CAF50; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>