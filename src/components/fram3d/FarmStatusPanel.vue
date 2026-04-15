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
                    <strong>{{ safeSummary.planted }}</strong>
                </div>
                <div class="stat-item">
                    <span>已成熟</span>
                    <strong>{{ safeSummary.mature }}</strong>
                </div>
                <div class="stat-item">
                    <span>缺水地块</span>
                    <strong>{{ safeSummary.dry }}</strong>
                </div>
                <div class="stat-item">
                    <span>有杂草</span>
                    <strong>{{ safeSummary.weeds }}</strong>
                </div>
                <div class="stat-item">
                    <span>有害虫</span>
                    <strong>{{ safeSummary.pests }}</strong>
                </div>
                <div class="stat-item">
                    <span>总地块</span>
                    <strong>{{ safeSummary.totalPlots }}</strong>
                </div>
            </div>
        </div>

        <div class="card" v-if="currentPlot">
            <h3>当前地块</h3>
            <div class="plot-detail">
                <p><span>编号：</span>地块 {{ currentPlot.id }}</p>
                <p><span>作物：</span>{{ currentCropText }}</p>
                <p><span>阶段：</span>{{ currentStageText }}</p>
                <p><span>湿度：</span>{{ currentPlot.moisture }}</p>
                <p><span>肥力：</span>{{ currentPlot.fertility }}</p>
                <p><span>成熟度：</span>{{ currentPlot.growth }}</p>
                <p><span>杂草：</span>{{ currentPlot.hasWeeds ? '有' : '无' }}</p>
                <p><span>害虫：</span>{{ currentPlot.hasPests ? '有' : '无' }}</p>
            </div>
        </div>

        <div class="card toast-card">
            <h3>操作提示</h3>
            <p>{{ toastText }}</p>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'

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

    /**
     * 本地缓存一份当前地块，避免父组件对象引用复用或更新节奏问题
     */
    const currentPlot = ref(null)

    watch(
        () => props.activePlot,
        (val) => {
            if (!val) {
                currentPlot.value = null
                return
            }

            // 每次复制一份，确保状态栏拿到的是“当前时刻”的快照
            currentPlot.value = {
                id: val.id ?? 0,
                cropType: val.cropType ?? 'none',
                cropTypeText: val.cropTypeText ?? '',
                stage: val.stage ?? 0,
                stageText: val.stageText ?? '',
                moisture: val.moisture ?? 0,
                fertility: val.fertility ?? 0,
                growth: val.growth ?? 0,
                hasWeeds: !!val.hasWeeds,
                hasPests: !!val.hasPests
            }
        },
        {
            immediate: true,
            deep: true
        }
    )

    const safeSummary = computed(() => {
        return {
            planted: props.summary?.planted ?? 0,
            mature: props.summary?.mature ?? 0,
            dry: props.summary?.dry ?? 0,
            weeds: props.summary?.weeds ?? 0,
            pests: props.summary?.pests ?? 0,
            totalPlots: props.summary?.totalPlots ?? 0
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
        return map[props.selectedTool] || '请选择工具后进行操作'
    })

    const currentCropText = computed(() => {
        if (!currentPlot.value) return '无'
        return currentPlot.value.cropTypeText || cropText(currentPlot.value.cropType)
    })

    const currentStageText = computed(() => {
        if (!currentPlot.value) return '空地'
        return currentPlot.value.stageText || stageText(currentPlot.value.stage)
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