<template>
  <div class="page active farm-page" ref="farmRootRef">
    <header class="farm-topbar">
      <h2>🚜 小小农场主</h2>
      <div class="weather-badge" :class="weatherType">
        {{ weatherType === 'sunny' ? '☀️ 晴朗' : '☁️ 多云' }}
      </div>
      <div class="top-actions">
        <button class="nav-btn" @click="goBack">返回</button>
        <button class="nav-btn" @click="showMyFarm = true">我的农场</button>
        <button class="nav-btn" @click="showHelp = true">帮助</button>
      </div>
    </header>

    <div class="farm-layout">
      <aside class="tool-sidebar">
        <button
          v-for="tool in toolList"
          :key="tool.key"
          class="tool-btn"
          :class="{ active: selectedTool === tool.key, lock: tool.key !== 'toolbox' && !isToolUnlocked(tool.key) }"
          @click="selectTool(tool.key)"
        >
          <span>{{ tool.icon }}</span>
          <small>{{ tool.name }}</small>
        </button>
        <p class="tool-tip">{{ operationTip }}</p>
      </aside>

      <main class="farm-main">
        <section class="farm-card farmland-3d">
          <h3>🌾 我的农田（已解锁 {{ unlockedPlotCount }}/6）</h3>
          <div class="farm-stage" :class="{ 'tool-cursor-active': !!cursorToolIcon }" @mousemove="onFarmMouseMove" @mouseleave="onFarmMouseLeave">
          <div class="scene-overlay" aria-hidden="true">
            <span class="sun">☀️</span>
            <span class="cloud cloud-1">☁️</span>
            <span class="cloud cloud-2">☁️</span>
          </div>
          <div
            v-if="cursorVisible && cursorToolIcon"
            class="tool-cursor"
            :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
            aria-hidden="true"
          >
            {{ cursorToolIcon }}
          </div>
          <div class="plots-grid">
            <div
              v-for="plot in plots"
              :key="plot.id"
              class="plot"
              :class="[
                plot.stage >= 0 ? `stage-${plot.stage}` : 'stage-empty',
                { locked: !plot.unlocked, weedy: plot.weedy, mature: plot.stage === 3, fertile: plot.fertilized, wet: plot.wet, press: plot.press }
              ]"
              @click="handlePlotClick(plot, $event)"
            >
              <div class="plot-id">地块{{ plot.id }}</div>
              <div class="plot-crop" :class="[plot.anim, { 'mature-wave': plot.stage === 3 }]">{{ getPlotIcon(plot) }}</div>
              <div v-if="plot.stage === 3" class="mature-sparkles" aria-hidden="true">
                <span class="spark s1">✨</span>
                <span class="spark s2">✨</span>
                <span class="spark s3">✨</span>
              </div>
              <div v-if="plot.stage >= 0" class="growth-mini">
                <div class="growth-mini-fill" :style="{ width: getGrowthPercent(plot) + '%' }"></div>
              </div>
              <div v-if="plot.weedy" class="plot-weed">🌿</div>
              <div v-if="plot.fx === 'water'" class="plot-fx">💧</div>
              <div v-if="plot.fx === 'water'" class="plot-ripple"></div>
              <div class="dust-layer" aria-hidden="true">
                <span class="dust d1">·</span>
                <span class="dust d2">·</span>
                <span class="dust d3">·</span>
              </div>
              <div v-if="!plot.unlocked" class="plot-lock">🔒 {{ plotUnlockText(plot.id) }}</div>
            </div>
          </div>
          </div>
        </section>

        <section class="farm-card split">
          <div>
            <h3>🐣 饲养区</h3>
            <div class="animal-zone">
              <button
                v-for="animal in animals"
                :key="animal.key"
                class="animal-card"
                :class="animal.motion"
                @click="interactAnimal(animal)"
              >
                <div class="animal-icon">{{ animal.icon }}</div>
                <p>{{ animal.name }}</p>
                <small>饥饿值：{{ animal.hunger }}%</small>
                <span v-if="animal.moodFx" class="mood-fx">💗</span>
              </button>
            </div>
            <button class="nav-btn" @click="feedAnimals">喂食小动物</button>
          </div>

          <div ref="warehousePanelRef">
            <h3>📦 仓库</h3>
            <div class="warehouse-grid">
              <div class="warehouse-item">🌾 小麦：{{ warehouse.wheat }}</div>
              <div class="warehouse-item">🌽 玉米：{{ warehouse.corn }}</div>
              <div class="warehouse-item">🥕 胡萝卜：{{ warehouse.carrot }}</div>
            </div>
            <div class="warehouse-actions">
              <button class="nav-btn" @click="shareHarvest">分享给家长</button>
              <button class="nav-btn" @click="showParentGuide = true">家长指南</button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <footer class="farm-status">
      <div class="status-main">{{ farmStatus }}</div>
      <div class="status-sub">生长进度：{{ growthText }} ｜ {{ animalStatusText }}</div>
      <div class="status-sub">农场积分：{{ farmPoints }} ｜ 勋章：{{ farmMedals }}</div>
      <div class="status-actions">
        <button class="nav-btn" @click="showTaskModal = true">每日任务</button>
        <button class="nav-btn" @click="showToolboxModal = true">工具库</button>
      </div>
    </footer>

    <div v-if="showTaskModal" class="farm-modal" @click="showTaskModal = false">
      <div class="farm-modal-box" @click.stop>
        <h3>📋 每日任务</h3>
        <div class="task-list">
          <div v-for="task in dailyTasks" :key="task.key" class="task-item">
            <strong>{{ task.title }}</strong>
            <span>{{ task.progress }}/{{ task.target }}</span>
            <button class="nav-btn" :disabled="task.claimed || task.progress < task.target" @click="claimTask(task)">
              {{ task.claimed ? '已领取' : '领取奖励' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToolboxModal" class="farm-modal" @click="showToolboxModal = false">
      <div class="farm-modal-box" @click.stop>
        <h3>🧰 工具库</h3>
        <div class="toolbox-list">
          <button class="nav-btn" :disabled="farmPoints < 40" @click="sprinkleAll">一键浇水（40积分解锁）</button>
          <button class="nav-btn" :disabled="farmPoints < 80" @click="autoWeed">自动除草（80积分解锁）</button>
          <button class="nav-btn" :disabled="farmPoints < 120" @click="boostGrow">成长加速（120积分解锁）</button>
        </div>
      </div>
    </div>

    <div v-if="showHelp" class="farm-modal" @click="showHelp = false">
      <div class="farm-modal-box" @click.stop>
        <h3>❓ 操作帮助</h3>
        <p>先在左侧选择工具，再点击地块执行操作。</p>
        <p>禾苗宝宝渴了就浇水，有杂草就除草，成熟后记得收割～</p>
        <p>点击小动物可获得协助效果，完成每日任务能拿积分和勋章。</p>
      </div>
    </div>

    <div v-if="showMyFarm" class="farm-modal" @click="showMyFarm = false">
      <div class="farm-modal-box" @click.stop>
        <h3>🏡 我的农场档案</h3>
        <p>农场等级：Lv.{{ farmLevel }}</p>
        <p>积分：{{ farmPoints }}</p>
        <p>已解锁地块：{{ unlockedPlotCount }}/6</p>
        <p>累计收获：{{ totalHarvest }} 颗</p>
      </div>
    </div>

    <div v-if="showParentGuide" class="farm-modal" @click="showParentGuide = false">
      <div class="farm-modal-box" @click.stop>
        <h3>👨‍👩‍👧 家长指南</h3>
        <p>可引导孩子按“播种→浇水→除草/施肥→收割”的顺序完成农事。</p>
        <p>建议每天完成任务，鼓励孩子分享收获，培养责任感与坚持性。</p>
      </div>
    </div>

    <div class="harvest-fly-layer" aria-hidden="true">
      <span
        v-for="item in flyingHarvests"
        :key="item.id"
        class="fly-item"
        :style="{
          left: item.startX + 'px',
          top: item.startY + 'px',
          '--dx': item.dx + 'px',
          '--dy': item.dy + 'px'
        }"
      >{{ item.icon }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { store, showPage, playVoice } from '../../store'

const selectedTool = ref('sow')
const farmStatus = ref('🌞 欢迎认领你的农场，先点击“播种”开始吧！')
const operationTip = ref('点击“播种”，再点地块即可播种。')
const farmPoints = ref(0)
const farmMedals = ref(0)
const weatherType = ref('sunny')
const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)
const flyingHarvests = ref([])
const farmRootRef = ref(null)
const warehousePanelRef = ref(null)

const showTaskModal = ref(false)
const showToolboxModal = ref(false)
const showHelp = ref(false)
const showMyFarm = ref(false)
const showParentGuide = ref(false)

const toolList = [
  { key: 'sow', name: '播种', icon: '🌰' },
  { key: 'water', name: '浇水', icon: '💧' },
  { key: 'weed', name: '除草', icon: '🌿' },
  { key: 'fertilize', name: '施肥', icon: '🧪' },
  { key: 'harvest', name: '收割', icon: '🧺' },
  { key: 'toolbox', name: '工具库', icon: '🧰' }
]

const createPlot = (id) => ({ id, unlocked: id <= 3, stage: -1, growthBuffer: 0, crop: 'wheat', weedy: false, fertilized: false, wet: false, press: false, anim: '', fx: '' })
const plots = reactive(Array.from({ length: 6 }, (_, i) => createPlot(i + 1)))

const animals = reactive([
  { key: 'chick', name: '小鸡', icon: '🐥', motion: 'move-a', hunger: 25, ability: 'weed', moodFx: false },
  { key: 'duck', name: '小鸭', icon: '🦆', motion: 'move-b', hunger: 30, ability: 'water', moodFx: false },
  { key: 'sheep', name: '小羊', icon: '🐑', motion: 'move-c', hunger: 20, ability: 'fertilize', moodFx: false }
])

const warehouse = reactive({ wheat: 0, corn: 0, carrot: 0 })
const dailyTasks = reactive([
  { key: 'sow', title: '播种2次', progress: 0, target: 2, reward: 8, claimed: false },
  { key: 'water', title: '浇水3次', progress: 0, target: 3, reward: 10, claimed: false },
  { key: 'harvest', title: '收获1次', progress: 0, target: 1, reward: 15, claimed: false }
])

const farmLevel = computed(() => Math.min(6, 1 + Math.floor(farmPoints.value / 60)))
const unlockedPlotCount = computed(() => plots.filter((p) => p.unlocked).length)
const plantedPlots = computed(() => plots.filter((p) => p.unlocked && p.stage >= 0))
const maturePlots = computed(() => plots.filter((p) => p.unlocked && p.stage === 3))
const growthText = computed(() => (plantedPlots.value.length === 0 ? '暂无作物，快去播种吧！' : `成熟 ${maturePlots.value.length}/${plantedPlots.value.length}`))
const animalStatusText = computed(() => {
  const hungry = animals.find((a) => a.hunger >= 70)
  return hungry ? `${hungry.name}饿了，需要喂食` : '小动物状态良好'
})
const totalHarvest = computed(() => warehouse.wheat + warehouse.corn + warehouse.carrot)

let hungerTimer = null
let weatherTimer = null
const cropMatureIcon = { wheat: '🌾', corn: '🌽', carrot: '🥕' }

const cursorToolIcon = computed(() => {
  if (selectedTool.value === 'water') return '🚿'
  if (selectedTool.value === 'weed') return '🪏'
  return ''
})

const onFarmMouseMove = (e) => {
  if (!cursorToolIcon.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  cursorX.value = e.clientX - rect.left
  cursorY.value = e.clientY - rect.top
  cursorVisible.value = true
}

const onFarmMouseLeave = () => {
  cursorVisible.value = false
}

const getGrowthPercent = (plot) => {
  if (plot.stage < 0) return 0
  const base = [15, 40, 75, 100][Math.max(0, Math.min(3, plot.stage))]
  if (plot.stage >= 3) return 100
  return Math.min(100, base + Math.round((plot.growthBuffer || 0) * 20))
}

const applyGrowthByWeather = (plot, baseStep = 1) => {
  const weatherFactor = weatherType.value === 'sunny' ? 1 : 0.5
  const total = baseStep * weatherFactor
  const whole = Math.floor(total)
  const frac = total - whole
  plot.stage = Math.min(3, plot.stage + whole)
  plot.growthBuffer = (plot.growthBuffer || 0) + frac
  if (plot.stage < 3 && plot.growthBuffer >= 1) {
    plot.stage += 1
    plot.growthBuffer -= 1
  }
}

const pressPlot = (plot) => {
  plot.press = true
  setTimeout(() => {
    plot.press = false
  }, 180)
}

const saveFarm = () => {
  localStorage.setItem('farm-page-save', JSON.stringify({
    farmPoints: farmPoints.value,
    farmMedals: farmMedals.value,
    plots: plots.map((p) => ({ id: p.id, unlocked: p.unlocked, stage: p.stage, growthBuffer: p.growthBuffer || 0, crop: p.crop, weedy: p.weedy, fertilized: p.fertilized, wet: p.wet })),
    warehouse: { ...warehouse },
    dailyTasks: dailyTasks.map((t) => ({ ...t }))
  }))
}

const loadFarm = () => {
  const raw = localStorage.getItem('farm-page-save')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    farmPoints.value = data.farmPoints || 0
    farmMedals.value = data.farmMedals || 0
    if (Array.isArray(data.plots)) {
      data.plots.forEach((saved, idx) => {
        if (!plots[idx]) return
        plots[idx].unlocked = !!saved.unlocked
        plots[idx].stage = saved.stage ?? -1
        plots[idx].growthBuffer = saved.growthBuffer || 0
        plots[idx].crop = saved.crop || 'wheat'
        plots[idx].weedy = !!saved.weedy
        plots[idx].fertilized = !!saved.fertilized
        plots[idx].wet = !!saved.wet
      })
    }

const triggerHarvestFly = (cropType, event) => {
  const farmRect = farmRootRef.value?.getBoundingClientRect()
  const warehouseRect = warehousePanelRef.value?.getBoundingClientRect()
  const plotRect = event?.currentTarget?.getBoundingClientRect()
  if (!farmRect || !warehouseRect || !plotRect) return

  const startX = plotRect.left + plotRect.width / 2 - farmRect.left
  const startY = plotRect.top + plotRect.height / 2 - farmRect.top
  const endX = warehouseRect.left + warehouseRect.width * 0.55 - farmRect.left
  const endY = warehouseRect.top + 44 - farmRect.top

  const item = {
    id: Date.now() + Math.random(),
    icon: cropMatureIcon[cropType] || '🌾',
    startX,
    startY,
    dx: endX - startX,
    dy: endY - startY
  }
  flyingHarvests.value.push(item)
  setTimeout(() => {
    flyingHarvests.value = flyingHarvests.value.filter((x) => x.id !== item.id)
  }, 900)
}
    if (data.warehouse) {
      warehouse.wheat = data.warehouse.wheat || 0
      warehouse.corn = data.warehouse.corn || 0
      warehouse.carrot = data.warehouse.carrot || 0
    }
    if (Array.isArray(data.dailyTasks)) {
      data.dailyTasks.forEach((saved, i) => {
        if (!dailyTasks[i]) return
        dailyTasks[i].progress = saved.progress || 0
        dailyTasks[i].claimed = !!saved.claimed
      })
    }
  } catch {
    // ignore
  }
}

const isToolUnlocked = (toolKey) => (toolKey === 'fertilize' ? farmPoints.value >= 20 || store.bestLevel >= 2 : true)

const selectTool = (toolKey) => {
  if (toolKey === 'toolbox') {
    showToolboxModal.value = true
    operationTip.value = '工具库可解锁一键浇水、自动除草、成长加速。'
    playVoice('打开工具库，看看解锁了哪些新工具吧')
    return
  }
  if (!isToolUnlocked(toolKey)) {
    farmStatus.value = '🧰 这个工具还没解锁，先完成任务拿积分吧！'
    playVoice('这个工具还没有解锁')
    return
  }
  selectedTool.value = toolKey
  const tips = {
    sow: '点击播种按钮，选择种子，点击农田播种。',
    water: '禾苗宝宝渴了，快点地块给它浇水。',
    weed: '有杂草时点击地块，帮禾苗清理环境。',
    fertilize: '施肥能让作物更快成长。',
    harvest: '成熟后点击地块进行收割。'
  }
  operationTip.value = tips[toolKey] || '请选择要执行的农场操作。'
  playVoice(operationTip.value)
}

const getPlotIcon = (plot) => {
  if (!plot.unlocked) return '🔒'
  if (plot.stage < 0) return '🟫'
  if (plot.stage === 0) return '🌰'
  if (plot.stage === 1) return '🌱'
  if (plot.stage === 2) return '🌿'
  return cropMatureIcon[plot.crop] || '🌾'
}

const randomCrop = () => ['wheat', 'corn', 'carrot'][Math.floor(Math.random() * 3)]

const setPlotAnim = (plot, anim = 'pop') => {
  plot.anim = anim
  setTimeout(() => {
    if (plot.anim === anim) plot.anim = ''
  }, 600)
}

const setPlotFx = (plot, fx = 'water') => {
  plot.fx = fx
  if (fx === 'water') {
    plot.wet = true
    setTimeout(() => {
      plot.wet = false
    }, 2200)
  }
  setTimeout(() => {
    if (plot.fx === fx) plot.fx = ''
  }, 500)
}

const unlockPlotsByLevel = () => {
  const shouldUnlock = Math.min(6, 3 + Math.floor(farmPoints.value / 80))
  plots.forEach((plot) => {
    if (plot.id <= shouldUnlock) plot.unlocked = true
  })
}

const updateTaskProgress = (key, amount = 1) => {
  const task = dailyTasks.find((t) => t.key === key)
  if (!task || task.claimed) return
  task.progress = Math.min(task.target, task.progress + amount)
}

const handlePlotClick = (plot, event) => {
  pressPlot(plot)
  if (!plot.unlocked) {
    farmStatus.value = `🔒 地块${plot.id}未解锁，升级农场可开启。`
    return
  }

  switch (selectedTool.value) {
    case 'sow':
      if (plot.stage >= 0) {
        farmStatus.value = '🌱 这块地已经种上作物啦！'
      } else {
        plot.crop = randomCrop()
        plot.stage = 0
        plot.growthBuffer = 0
        plot.weedy = false
        plot.fertilized = false
        setPlotAnim(plot)
        farmStatus.value = '🌰 播种成功！禾苗宝宝在土里睡觉啦。'
        updateTaskProgress('sow')
      }
      break
    case 'water':
      if (plot.stage < 0) {
        farmStatus.value = '💧 先播种再浇水哦～'
      } else {
        applyGrowthByWeather(plot, plot.fertilized ? 2 : 1)
        if (plot.stage >= 2 && Math.random() < 0.35) plot.weedy = true
        setPlotFx(plot, 'water')
        setPlotAnim(plot)
        farmStatus.value = plot.stage === 3 ? '✨ 禾苗宝宝成熟啦，快来收割！' : '💧 禾苗宝宝喝饱水，又长大一点啦！'
        updateTaskProgress('water')
      }
      break
    case 'weed':
      if (plot.stage < 0) {
        farmStatus.value = '🌿 这块地没有作物，不需要除草。'
      } else if (!plot.weedy) {
        farmStatus.value = '🌿 这块地很干净，暂时没有杂草。'
      } else {
        plot.weedy = false
        setPlotAnim(plot)
        farmStatus.value = '🧹 杂草欺负不了禾苗宝宝啦，清理完成！'
      }
      break
    case 'fertilize':
      if (plot.stage < 0) {
        farmStatus.value = '🧪 先播种后再施肥哦。'
      } else {
        plot.fertilized = true
        plot.stage = Math.min(3, plot.stage + 1)
        setPlotAnim(plot)
        farmStatus.value = '🧪 施肥成功，禾苗宝宝更有营养啦！'
      }
      break
    case 'harvest':
      if (plot.stage !== 3) {
        farmStatus.value = '🧺 还没成熟，先继续照顾它吧。'
      } else if (plot.weedy) {
        farmStatus.value = '🌿 有杂草会影响收成，先除草再收割。'
      } else {
        warehouse[plot.crop] += 10
        triggerHarvestFly(plot.crop, event)
        farmPoints.value += 15
        farmStatus.value = `🎉 收获啦！你获得了10颗${plot.crop === 'wheat' ? '小麦' : plot.crop === 'corn' ? '玉米' : '胡萝卜'}，真棒～`
        updateTaskProgress('harvest')
        plot.stage = -1
        plot.growthBuffer = 0
        plot.crop = 'wheat'
        plot.weedy = false
        plot.fertilized = false
        setPlotAnim(plot)
        store.m3 = '✅'
      }
      break
  }

  unlockPlotsByLevel()
  saveFarm()
}

const plotUnlockText = (id) => `${id <= 3 ? '已解锁' : `Lv.${Math.max(2, id - 1)}解锁`}`

const feedAnimals = () => {
  animals.forEach((a) => {
    a.hunger = Math.max(0, a.hunger - 35)
    a.moodFx = true
    setTimeout(() => {
      a.moodFx = false
    }, 700)
  })
  farmStatus.value = '🍚 小动物吃饱啦，干活更有劲！'
  playVoice('小动物吃饱了，会更愿意帮忙')
}

const interactAnimal = (animal) => {
  animal.hunger = Math.max(0, animal.hunger - 15)
  animal.moodFx = true
  setTimeout(() => {
    animal.moodFx = false
  }, 700)
  playVoice(`${animal.name}来帮忙啦`)
  const activePlots = plots.filter((p) => p.unlocked && p.stage >= 0)
  if (!activePlots.length) {
    farmStatus.value = `${animal.name}说：先种点作物，我再来帮你！`
    return
  }
  if (animal.ability === 'weed') {
    const target = activePlots.find((p) => p.weedy)
    if (target) {
      target.weedy = false
      setPlotAnim(target)
      farmStatus.value = '🐥 小鸡帮你把杂草啄走啦！'
    }
  }
  if (animal.ability === 'water') {
    const target = activePlots.find((p) => p.stage < 3)
    if (target) {
      applyGrowthByWeather(target, 1)
      setPlotFx(target, 'water')
      setPlotAnim(target)
      farmStatus.value = '🦆 小鸭帮忙浇水，禾苗更精神了！'
    }
  }
  if (animal.ability === 'fertilize') {
    const target = activePlots.find((p) => !p.fertilized)
    if (target) {
      target.fertilized = true
      target.stage = Math.min(3, target.stage + 1)
      setPlotAnim(target)
      farmStatus.value = '🐑 小羊施肥成功，作物长势超棒！'
    }
  }
  saveFarm()
}

const claimTask = (task) => {
  if (task.claimed || task.progress < task.target) return
  task.claimed = true
  farmPoints.value += task.reward
  farmMedals.value += 1
  store.m4 = '✅'
  farmStatus.value = `🏅 任务完成：${task.title}，获得${task.reward}积分！`
  playVoice('任务奖励领取成功，继续加油')
  unlockPlotsByLevel()
  saveFarm()
}

const sprinkleAll = () => {
  if (farmPoints.value < 40) return
  plots.forEach((plot) => {
    if (plot.unlocked && plot.stage >= 0 && plot.stage < 3) {
      applyGrowthByWeather(plot, 1)
      setPlotFx(plot, 'water')
    }
  })
  farmStatus.value = '💦 一键浇水完成，农田湿润润！'
  showToolboxModal.value = false
  saveFarm()
}

const autoWeed = () => {
  if (farmPoints.value < 80) return
  plots.forEach((plot) => {
    if (plot.unlocked) plot.weedy = false
  })
  farmStatus.value = '🌿 自动除草完成，农田干净整洁！'
  showToolboxModal.value = false
  saveFarm()
}

const boostGrow = () => {
  if (farmPoints.value < 120) return
  plots.forEach((plot) => {
    if (plot.unlocked && plot.stage >= 0 && plot.stage < 3) {
      plot.stage = Math.min(3, plot.stage + 1)
      setPlotAnim(plot)
    }
  })
  farmStatus.value = '⚡ 成长加速成功，禾苗宝宝飞快长大！'
  showToolboxModal.value = false
  saveFarm()
}

const shareHarvest = () => {
  if (totalHarvest.value <= 0) {
    farmStatus.value = '📦 仓库还没有收获，先去农田努力吧！'
    return
  }
  farmStatus.value = `📤 你已向家长分享了${totalHarvest.value}颗农作物，亲子互动+1！`
  playVoice('你把收获分享给家长了，真棒')
  store.m4 = '✅'
}

const goBack = () => showPage('home')

onMounted(() => {
  loadFarm()
  hungerTimer = setInterval(() => {
    animals.forEach((a) => {
      a.hunger = Math.min(100, a.hunger + Math.floor(Math.random() * 8))
    })
  }, 8000)

  weatherTimer = setInterval(() => {
    weatherType.value = weatherType.value === 'sunny' ? 'cloudy' : 'sunny'
  }, 15000)
})

onBeforeUnmount(() => {
  if (hungerTimer) clearInterval(hungerTimer)
  if (weatherTimer) clearInterval(weatherTimer)
})
</script>

<style scoped>
.farm-page { min-height: 100vh; padding: 16px; background: linear-gradient(180deg, #eef9ff 0%, #f9fff2 50%, #fff9ef 100%); animation: fadeIn .35s ease; }
.farm-page { position: relative; }
.farm-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.farm-topbar h2 { margin: 0; color: #2e7d32; font-size: 34px; }
.weather-badge { background: #fff; border: 2px solid #dcedc8; border-radius: 999px; padding: 4px 12px; font-weight: 700; color: #4e7a39; }
.weather-badge.cloudy { color: #607d8b; border-color: #cfd8dc; }
.top-actions { display: flex; gap: 10px; }
.farm-layout { display: grid; grid-template-columns: 170px 1fr; gap: 14px; align-items: start; }
.tool-sidebar { background: #fff; border: 2px solid #dcedc8; border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.tool-btn { border: none; border-radius: 12px; padding: 10px 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; background: #f4fbec; color: #4f6b52; cursor: pointer; font-weight: 700; }
.tool-btn.active { background: linear-gradient(180deg, #66bb6a, #43a047); color: #fff; }
.tool-btn.lock { opacity: .55; }
.tool-tip { margin: 6px 0 0; color: #ef6c00; font-size: 13px; line-height: 1.5; }
.farm-main { display: flex; flex-direction: column; gap: 12px; }
.farm-card { background: #fff; border: 2px solid #dcedc8; border-radius: 14px; padding: 12px; }
.farm-card h3 { margin: 0 0 10px; color: #2e7d32; }
.farmland-3d {
  position: relative;
  background: linear-gradient(180deg, #ffffff, #f7fff2 70%, #eefbe6);
  box-shadow: 0 12px 30px rgba(67, 160, 71, 0.12);
  overflow: hidden;
}
.dust-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.dust {
  position: absolute;
  color: rgba(120, 78, 21, 0.45);
  opacity: 0;
  font-size: 16px;
}
.d1 { left: 22%; bottom: 20%; }
.d2 { left: 48%; bottom: 16%; }
.d3 { left: 68%; bottom: 18%; }
.plot:hover .dust {
  animation: dustLift .6s ease-out;
}
.farm-stage {
  perspective: 1100px;
  transform-style: preserve-3d;
  padding: 16px 10px 20px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.farm-stage.tool-cursor-active {
  cursor: none;
}

.tool-cursor {
  position: absolute;
  z-index: 5;
  transform: translate(-50%, -50%) rotate(-12deg);
  pointer-events: none;
  font-size: 28px;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,.25));
  animation: cursorBob .5s ease-in-out infinite alternate;
}

.scene-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.sun {
  position: absolute;
  right: 22%;
  top: 4px;
  animation: sunPulse 3s ease-in-out infinite;
  opacity: .7;
}
.cloud {
  position: absolute;
  opacity: .65;
}
.cloud-1 { left: 8%; top: 8px; animation: cloudMove 18s linear infinite; }
.cloud-2 { left: 40%; top: 24px; animation: cloudMove 22s linear infinite; }

.farm-stage::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 46%;
  width: 72%;
  height: 58%;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(208, 233, 169, 0.85), rgba(164, 205, 112, 0.92));
  transform: translate(-50%, -50%) rotateX(64deg) rotateZ(-30deg);
  box-shadow: 0 24px 32px rgba(67, 108, 44, 0.28);
  z-index: 0;
}
.plots-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; position: relative; z-index: 1; }
.plot {
  position: relative;
  border-radius: 12px;
  min-height: 120px;
  background: linear-gradient(180deg, #ffe9a6, #f5c96d);
  border: 2px solid #d4a834;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transform: rotateX(10deg) rotateZ(-1deg) translateZ(0);
  transform-style: preserve-3d;
  transition: transform .28s ease, box-shadow .28s ease;
  box-shadow: inset 0 2px 0 rgba(255,255,255,.42), 0 10px 0 #b1782b, 0 14px 20px rgba(90, 62, 21, 0.25);
}

.plot::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 12px;
  background: linear-gradient(180deg, #aa7329, #8a5a1d);
  border-radius: 0 0 10px 10px;
  z-index: 0;
}

.plot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: repeating-linear-gradient(
    -12deg,
    rgba(120, 78, 21, 0.18) 0,
    rgba(120, 78, 21, 0.18) 2px,
    transparent 2px,
    transparent 10px
  );
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 0;
}

.plot:hover {
  transform: rotateX(10deg) rotateZ(-1deg) translateY(-6px) scale(1.02);
}
.plot.press {
  transform: rotateX(10deg) rotateZ(-1deg) translateY(-2px) scale(0.995);
}
.plot.stage-empty { background: linear-gradient(180deg, #f5dfb8, #e2c08e); }
.plot.stage-1 { background: linear-gradient(180deg, #fff1a8, #f2d96b); }
.plot.stage-2 { background: linear-gradient(180deg, #e9f7c0, #c7eb8f); }
.plot.stage-3 { background: linear-gradient(180deg, #d4f4b0, #9edb66); }
.plot.locked { filter: grayscale(1); cursor: not-allowed; }
.plot.mature { box-shadow: 0 0 18px rgba(255, 214, 77, .85); }
.plot.fertile::after { content: '✨'; position: absolute; right: 6px; top: 6px; }
.plot-id { position: relative; z-index: 1; font-size: 12px; color: #6d4c41; }
.plot-crop {
  position: relative;
  z-index: 1;
  font-size: 44px;
  margin-top: 20px;
  transform: translateZ(20px);
  filter: drop-shadow(0 4px 2px rgba(0,0,0,.2));
}
.plot-crop.pop { animation: pop .5s ease; }
.plot-crop.mature-wave { animation: matureWave 1.6s ease-in-out infinite; }

.mature-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.spark {
  position: absolute;
  font-size: 14px;
  opacity: 0;
  animation: sparkle 1.8s ease-in-out infinite;
}

.spark.s1 { left: 22%; top: 34%; animation-delay: .1s; }
.spark.s2 { right: 22%; top: 40%; animation-delay: .6s; }
.spark.s3 { left: 48%; top: 24%; animation-delay: 1s; }
.plot-weed { position: absolute; left: 6px; bottom: 6px; font-size: 22px; z-index: 1; }
.plot-fx { position: absolute; right: 8px; bottom: 8px; font-size: 20px; z-index: 1; animation: floatUp .5s ease; }
.plot-ripple {
  position: absolute;
  left: 50%;
  top: 58%;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(78, 180, 255, 0.55);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  animation: ripple 1s ease-out forwards;
}
.growth-mini {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,.5);
  overflow: hidden;
  z-index: 1;
}
.growth-mini-fill {
  height: 100%;
  background: linear-gradient(90deg, #8bc34a, #43a047);
}
.plot.wet {
  background: linear-gradient(180deg, #d8f1ff, #c8e6ff 44%, #a8d9ff 100%);
}
.plot-lock { position: absolute; inset: 0; background: rgba(255,255,255,.7); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #5d4037; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.animal-zone { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; }
.animal-card { border: 2px solid #dcedc8; border-radius: 12px; background: #f8fff2; padding: 8px; cursor: pointer; }
.animal-icon { font-size: 34px; }
.animal-card p { margin: 4px 0 2px; font-weight: 800; color: #33691e; }
.animal-card small { color: #607d8b; }
.mood-fx { position: absolute; right: 8px; top: 6px; animation: floatUp .6s ease-out; }
.move-a { animation: wobble 2.2s ease-in-out infinite; }
.move-b { animation: wobble 2.5s ease-in-out infinite; }
.move-c { animation: wobble 2.8s ease-in-out infinite; }
.warehouse-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 10px; }
.warehouse-item { background: #fffde7; border: 1px dashed #ffe082; border-radius: 10px; padding: 8px; color: #5d4037; font-weight: 700; }
.warehouse-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.farm-status { margin-top: 12px; border: 2px solid #ffe0b2; background: linear-gradient(180deg, #fff8e1, #fff3e0); border-radius: 12px; padding: 10px 12px; }
.status-main { color: #ef6c00; font-weight: 800; }
.status-sub { color: #6d4c41; margin-top: 4px; }
.status-actions { margin-top: 8px; display: flex; gap: 8px; }
.nav-btn { border: none; border-radius: 999px; padding: 8px 14px; background: #ffe082; color: #5d4037; cursor: pointer; font-weight: 800; }
.farm-modal { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.farm-modal-box { width: min(640px, 92vw); background: #fff; border-radius: 14px; border: 2px solid #dcedc8; padding: 16px; }
.harvest-fly-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}
.fly-item {
  position: absolute;
  font-size: 24px;
  transform: translate(0, 0);
  animation: harvestFly .9s cubic-bezier(.2,.6,.2,1) forwards;
  filter: drop-shadow(0 3px 3px rgba(0,0,0,.25));
}
.task-list { display: flex; flex-direction: column; gap: 8px; }
.task-item { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; background: #f8fff2; border-radius: 10px; padding: 8px; }
.toolbox-list { display: flex; flex-direction: column; gap: 10px; }
@keyframes pop { 0% { transform: scale(.7); opacity: .5; } 100% { transform: scale(1); opacity: 1; } }
@keyframes floatUp { 0% { transform: translateY(8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes wobble { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: .9; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}
@keyframes sunPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
@keyframes cloudMove { from { transform: translateX(0); } to { transform: translateX(180px); } }
@keyframes cursorBob { from { transform: translate(-50%, -50%) rotate(-14deg); } to { transform: translate(-50%, -52%) rotate(-10deg); } }
@keyframes matureWave { 0%,100% { transform: translateZ(20px) rotate(-2deg); } 50% { transform: translateZ(20px) rotate(2deg); } }
@keyframes sparkle {
  0%,100% { opacity: 0; transform: translateY(4px) scale(.8); }
  50% { opacity: 1; transform: translateY(-4px) scale(1.1); }
}
@keyframes dustLift {
  0% { opacity: 0; transform: translateY(0) scale(.8); }
  40% { opacity: .9; }
  100% { opacity: 0; transform: translateY(-14px) scale(1.2); }
}
@keyframes harvestFly {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  55% { opacity: 1; transform: translate(calc(var(--dx) * .55), calc(var(--dy) * .35 - 70px)) scale(1.08); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.5); }
}
@media (max-width: 980px) {
  .farm-layout { grid-template-columns: 1fr; }
  .tool-sidebar { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  .split { grid-template-columns: 1fr; }
  .plots-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>


