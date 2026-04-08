<template>
  <div class="page active">
      <div style="text-align:center;margin-bottom:25px">
          <h2>🌱 小小农场主</h2>
      </div>
      <div class="card">
          <div style="display:flex;gap:15px;justify-content:center;margin-bottom:25px;flex-wrap:wrap">
              <button class="nav-btn" @click="growCrop()">播种</button>
              <button class="nav-btn" @click="waterCrop()">浇水</button>
              <button class="nav-btn" @click="weedCrop()">除草</button>
              <button class="nav-btn" @click="harvestCrop()">收割</button>
          </div>
          <div class="farm-grid">
              <div class="field" v-for="c in cropsNode" :key="c.id">
                  <div class="crop" :class="{ 'grow-animation': c.animating }">{{ c.icon }}</div>
                  <p>农田{{ c.id }}</p>
              </div>
          </div>
          <div style="text-align:center;margin-top:25px;font-size:20px">
              {{ farmStatus }}
          </div>
      </div>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { store } from '../../store'

const farmStatus = ref('等待播种')
const cropsNode = reactive([
  { id: 1, icon: '🌱', animating: false },
  { id: 2, icon: '🌱', animating: false },
  { id: 3, icon: '🌱', animating: false },
])

const growCrop = () => {
    farmStatus.value = '已播种，等待发芽'
    cropsNode.forEach(c => {
        c.icon = '🌱'
        c.animating = true
        setTimeout(() => c.animating = false, 1000)
    })
}
const waterCrop = () => {
    farmStatus.value = '已浇水，茁壮成长'
    cropsNode.forEach(c => {
        c.icon = '🌿'
        c.animating = true
        setTimeout(() => c.animating = false, 1000)
    })
}
const weedCrop = () => {
    farmStatus.value = '已除草，干净整洁'
}
const harvestCrop = () => {
    farmStatus.value = '收割完成，大丰收！'
    const crops = ['🌾','🌽','🥕']
    cropsNode.forEach((c, i) => {
        c.icon = crops[i]
        c.animating = true
        setTimeout(() => c.animating = false, 1000)
    })
    store.m3 = '✅'
}
</script>
<style scoped>
.page { display: block; animation: fadeIn 0.4s; }
.card { background: white; border-radius: 15px; padding: 35px; border: 3px solid #FFF3E0; box-shadow: 0 5px 12px rgba(0,0,0,0.05); }
.farm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin: 20px 0; }
.field { background: #F5D76E; border-radius: 15px; padding: 20px; text-align: center; border: 3px solid #D4A834; transition: 0.5s; }
.crop { font-size: 40px; margin: 10px 0; transition: 0.5s; }
.grow-animation { animation: grow 1s ease-in-out; }
@keyframes grow { 0%{transform:scale(0.5); opacity:0.5;} 100%{transform:scale(1); opacity:1;} }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>