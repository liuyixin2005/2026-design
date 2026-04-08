<template>
  <div class="page active">
      <div class="main-container">
          <!-- 左侧菜单 -->
          <div class="left-menu">
              <div class="left-menu-item" :class="{ active: currentTab === 'crop' }" @click="openTab('crop')">
                  <span class="left-menu-icon">🌾</span> 农作物认知
              </div>
              <div class="left-menu-item" :class="{ active: currentTab === 'tool' }" @click="openTab('tool')">
                  <span class="left-menu-icon">🛠️</span> 农具认知
              </div>
              <div class="left-menu-item" :class="{ active: currentTab === 'step' }" @click="openTab('step')">
                  <span class="left-menu-icon">🔄</span> 农耕流程
              </div>
              <div class="left-menu-item" :class="{ active: currentTab === 'season' }" @click="openTab('season')">
                  <span class="left-menu-icon">☀️</span> 节气与农耕
              </div>
              <div class="left-menu-item" :class="{ active: currentTab === 'custom' }" @click="openTab('custom')">
                  <span class="left-menu-icon">🎉</span> 农耕民俗
              </div>
              <div class="left-menu-item" :class="{ active: currentTab === 'poem' }" @click="openTab('poem')">
                  <span class="left-menu-icon">📜</span> 农耕古诗词
              </div>
          </div>

          <!-- 右侧内容 -->
          <div class="right-content">
              <!-- 农作物 -->
              <div class="tab fade-in active" v-if="currentTab === 'crop'">
                  <div class="content-title">🌾 农作物认知</div>
                  <div class="grid-box">
                      <div class="item-card" @contextmenu.prevent="playVoice('水稻是我国主要粮食，生长在水里，是我们每天吃的米饭来源。')" @click="showDetail('水稻','https://img0.baidu.com/it/u=856767111,2933321207&fm=253&fmt=auto','水稻是我国最重要的粮食作物，喜欢温暖湿润的环境，生长在水田里，经过加工后变成白白的大米，是我们每天吃的米饭的原料哦！')">
                          <img src="https://img0.baidu.com/it/u=856767111,2933321207&fm=253&fmt=auto" class="item-img">
                          <div class="item-name">水稻</div>
                          <div class="item-tip">长按听讲解</div>
                      </div>
                      <div class="item-card" @contextmenu.prevent="playVoice('小麦磨成面粉，可以做面包、馒头、饺子。')" @click="showDetail('小麦','https://img2.baidu.com/it/u=2299340699,321082300&fm=253&fmt=auto','小麦是北方主要粮食，磨成面粉后可以制作面包、馒头、饺子、面条等食物，营养丰富，是我们的主食之一。')">
                          <img src="https://img2.baidu.com/it/u=2299340699,321082300&fm=253&fmt=auto" class="item-img">
                          <div class="item-name">小麦</div>
                          <div class="item-tip">长按听讲解</div>
                      </div>
                  </div>
              </div>
              
              <!-- 农具 -->
              <div class="tab fade-in active" v-if="currentTab === 'tool'">
                  <div class="content-title">🛠️ 农具认知</div>
                  <div class="grid-box">
                      <div class="item-card" @contextmenu.prevent="playVoice('锄头用来除草、松土，让农作物呼吸更顺畅。')" @click="showDetail('锄头','https://pic.588ku.com/background/00/00/01/01666666666661.jpg','锄头是农民最常用的工具，用来给田地松土、清除杂草，让农作物长得更好。')">
                          <img src="https://pic.588ku.com/background/00/00/01/01666666666661.jpg" class="item-img">
                          <div class="item-name">锄头</div>
                      </div>
                  </div>
              </div>

              <!-- 流程 -->
              <div class="tab fade-in active" v-if="currentTab === 'step'">
                 <div class="content-title">🔄 完整农耕流程</div>
                  <ul class="simple-list">
                      <li><strong>1. 翻土松土</strong>：用锄头把土地翻松，让种子能呼吸</li>
                      <li><strong>2. 播种</strong>：把种子种进土里，等待发芽</li>
                  </ul>
              </div>

              <!-- 节气 -->
              <div class="tab fade-in active" v-if="currentTab === 'season'">
                  <div class="content-title">☀️ 二十四节气与农耕</div>
                  <ul class="simple-list">
                      <li><strong>立春</strong>：春天开始，准备播种</li>
                  </ul>
              </div>

              <!-- 民俗 -->
              <div class="tab fade-in active" v-if="currentTab === 'custom'">
                  <div class="content-title">🎉 传统农耕民俗</div>
                  <ul class="simple-list">
                      <li><strong>立春祭农</strong>：祭拜土地，祈求丰收</li>
                  </ul>
              </div>

              <!-- 诗词 -->
              <div class="tab fade-in active" v-if="currentTab === 'poem'">
                  <div class="content-title">📜 农耕古诗词</div>
                  <div class="poem-item" @contextmenu.prevent="playVoice('锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。')">
                      <div class="poem-title">悯农</div>
                      <div class="poem-content">
                          锄禾日当午，汗滴禾下土。<br>
                          谁知盘中餐，粒粒皆辛苦。
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { playVoice, showDetail } from '../../store'

const currentTab = ref('crop')
const openTab = (tabId) => {
  currentTab.value = tabId
}
</script>

<style scoped>
.page { display: block; }
.main-container { max-width: 1300px; margin: 20px auto 30px; display: flex; gap: 25px; padding: 15px; }
.left-menu { width: 260px; background: white; border-radius: 18px; padding: 25px 20px; box-shadow: 0 5px 12px rgba(0,0,0,0.06); height: fit-content; position: sticky; top: 100px; }
.left-menu-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; margin: 10px 0; border-radius: 12px; cursor: pointer; transition: 0.3s; font-size: 17px; font-weight: bold; color: #555; }
.left-menu-item:hover, .left-menu-item.active { background: #FFE082; color: #689F38; transform: translateX(6px); }
.left-menu-icon { font-size: 24px; }
.right-content { flex: 1; background: white; border-radius: 18px; padding: 40px; box-shadow: 0 5px 12px rgba(0,0,0,0.06); }
.content-title { font-size: 28px; color: #689F38; margin-bottom: 25px; display: flex; align-items: center; gap: 12px; font-weight: bold; }
.grid-box { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 22px; margin: 25px 0; }
.item-card { background: #FFF9EB; border-radius: 15px; padding: 22px; text-align: center; border: 3px solid #FFE082; cursor: pointer; transition: 0.3s; user-select: none; }
.item-card:hover { transform: translateY(-6px) scale(1.04); border-color: #FFB74D; box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
.item-img { width: 90px; height: 90px; object-fit: contain; margin: 0 auto 12px; display: block; }
.item-name { font-size: 17px; font-weight: bold; color: #444; }
.item-tip { font-size: 13px; color: #888; margin-top: 5px; }
.simple-list { font-size: 18px; line-height: 2.2; padding-left: 25px; margin: 20px 0; }
.poem-item { background: #FFF9EB; padding: 20px; border-radius: 12px; margin: 15px 0; border-left: 6px solid #689F38; }
.poem-title { font-size: 20px; font-weight: bold; color: #689F38; margin-bottom: 8px; }
.poem-content { font-size: 17px; line-height: 1.9; color: #444; }
.fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>
