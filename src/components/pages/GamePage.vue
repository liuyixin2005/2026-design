<template>
  <div class="page active">
      <div style="text-align:center;margin-bottom:25px"><h2>🎮 趣味小游戏</h2></div>
      <div class="card" style="text-align:center">
          <h3>丰收连连看</h3>
          <div class="game-grid">
              <div v-for="item in gameItems" :key="item.id" class="game-item" :style="{ visibility: item.visible ? 'visible' : 'hidden', background: item.selected ? '#689F38' : '', color: item.selected ? 'white' : '' }" @click="matchGame(item)">
                  {{ item.type }}
              </div>
          </div>
          <p style="font-size:18px;margin-top:20px">点击相同的农作物配单！</p>
      </div>
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { store } from '../../store'

let matchedCount = 0
let lastItem = null

const gameItems = reactive([
  { id: 1, type: '🌾', visible: true, selected: false },
  { id: 2, type: '🌽', visible: true, selected: false },
  { id: 3, type: '🌾', visible: true, selected: false },
  { id: 4, type: '🌽', visible: true, selected: false },
  { id: 5, type: '🥕', visible: true, selected: false },
  { id: 6, type: '🍅', visible: true, selected: false },
  { id: 7, type: '🥕', visible: true, selected: false },
  { id: 8, type: '🍅', visible: true, selected: false }
])

const matchGame = (item) => {
    if (!lastItem) {
        lastItem = item
        item.selected = true
    } else {
        if (item !== lastItem && item.type === lastItem.type) {
            item.visible = false
            lastItem.visible = false
            matchedCount++
            if (matchedCount === 4) {
                alert('恭喜通关！')
                store.m4 = '✅'
            }
        } else {
            lastItem.selected = false
            item.selected = false
        }
        lastItem = null
    }
}
</script>
<style scoped>
.page { display: block; animation: fadeIn 0.4s;}
.card { background: white; border-radius: 15px; padding: 35px; border: 3px solid #FFF3E0; box-shadow: 0 5px 12px rgba(0,0,0,0.05); }
.game-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 15px; margin: 20px 0; }
.game-item { background: #FFE082; border-radius: 12px; padding: 20px; font-size: 30px; cursor: pointer; text-align: center; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>