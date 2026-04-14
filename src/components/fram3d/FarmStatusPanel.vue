<template>
    <div class="status-panel">
        <div class="card">
            <h3>当前工具</h3>
            <p class="highlight">{{ toolText }}</p>
        </div>

        <div class="card">
            <h3>农场总览</h3>
            <div class="stats">
                <div class="stat-item">
                    <span>已播种</span>
                    <strong>{{ summary.planted }}</strong>
                </div>
                <div class="stat-item">
                    <span>已成熟</span>
                    <strong>{{ summary.mature }}</strong>
                </div>
                <div class="stat-item">
                    <span>缺水地块</span>
                    <strong>{{ summary.dry }}</strong>
                </div>
                <div class="stat-item">
                    <span>有杂草</span>
                    <strong>{{ summary.weeds }}</strong>
                </div>
                <div class="stat-item">
                    <span>有害虫</span>
                    <strong>{{ summary.pests }}</strong>
                </div>
                <div class="stat-item">
                    <span>总地块</span>
                    <strong>{{ summary.totalPlots }}</strong>
                </div>
            </div>
        </div>

        <div class="card" v-if="activePlot">
            <h3>当前地块</h3>
            <div class="plot-detail">
                <p><span>编号：</span>地块 {{ activePlot.id }}</p>
                <p><span>作物：</span>{{ cropText(activePlot.cropType) }}</p>
                <p><span>阶段：</span>{{ stageText(activePlot.stage) }}</p>
                <p><span>湿度：</span>{{ activePlot.moisture }}</p>
                <p><span>肥力：</span>{{ activePlot.fertility }}</p>
                <p><span>成熟度：</span>{{ activePlot.growth }}</p>
                <p><span>杂草：</span>{{ activePlot.hasWeeds ? '有' : '无' }}</p>
                <p><span>害虫：</span>{{ activePlot.hasPests ? '有' : '无' }}</p>
            </div>
        </div>

        <div class="card toast-card">
            <h3>操作提示</h3>
            <p>{{ toastText }}</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedTool: {
    type: String,
    default: 'seed'
  },
  summary: {
    type: Object,
    default: () => ({})
  },
  activePlot: {
    type: Object,
    default: null
  },
  toastText: {
    type: String,
    default: ''
  }
})

const toolText = computed(() => {
  const map = {
    seed: '播种：点击空地开始种植',
    water: '浇水：为缺水地块补充水分',
    fertilize: '施肥：提高肥力，加快成长',
    weed: '除草：清理杂草，避免争夺养分',
    pest: '除虫：清除害虫，恢复健康状态',
    harvest: '收割：成熟后才可以收获'
  }
  return map[props.selectedTool]
})

function cropText(type) {
  const map = {
    wheat: '小麦',
    corn: '玉米',
    carrot: '胡萝卜',
    rice: '稻苗',
    none: '无'
  }
  return map[type] || '无'
}

  function stageText(stage) {
        const map = {
            0: '空地',
            1: '播种',
            2: '发芽',
            3: '幼苗',
            4: '生长中',
            5: '茂盛',
            6: '成熟'
        }
        return map[stage] || '未知'
    }
</script>

<style scoped>
    .status-panel {
        display: flex;
        flex-direction: column;
        gap: 14px;
        height: 100%;
    }

    .card {
        padding: 18px;
        border-radius: 22px;
        background: rgba(255,255,255,0.84);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 30px rgba(63, 88, 41, 0.12);
    }

        .card h3 {
            margin: 0 0 12px;
            color: #6c4717;
            font-size: 18px;
        }

    .highlight {
        color: #2d9340;
        font-weight: 700;
        line-height: 1.7;
    }

    .stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .stat-item {
        padding: 10px 12px;
        border-radius: 14px;
        background: linear-gradient(180deg, #fff9e8, #f1ebd2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #6d552e;
    }

    .plot-detail p {
        margin: 8px 0;
        color: #6f6046;
    }

    .plot-detail span {
        font-weight: 700;
        color: #5e451d;
    }

    .toast-card p {
        line-height: 1.8;
        color: #7b6645;
    }
</style>