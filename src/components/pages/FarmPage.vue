<template>
    <div class="little-farmer-3d-page">
        <div class="page-bg"></div>

        <div class="top-bar">
            <div class="title-box">
                <h1>🌾 小小农场主 · 真实农耕体验</h1>
                <p>体验播种、浇水、除草、除虫、施肥、收割的完整农作过程</p>
            </div>

            <FarmToolbar :selected-tool="selectedTool"
                         @change-tool="handleToolChange" />
        </div>

        <div class="main-layout">
            <div class="scene-wrap">
                <FarmScene :selected-tool="selectedTool"
                           @toast="handleToast"
                           @plot-update="handlePlotUpdate"
                           @summary-update="handleSummaryUpdate" />
            </div>

            <FarmStatusPanel :selected-tool="selectedTool"
                             :summary="summary"
                             :active-plot="activePlot"
                             :toast-text="toastText" />
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import FarmToolbar from '@/components/fram3d/FarmToolbar.vue'
    import FarmStatusPanel from '@/components/fram3d/FarmStatusPanel.vue'
    import FarmScene from '@/components/fram3d/FarmScene.vue'

    const selectedTool = ref('seed')
    const toastText = ref('欢迎来到小小农场主，先选择工具，再点击地块进行操作吧！')
    const activePlot = ref(null)

    const summary = ref({
        totalPlots: 6,
        planted: 0,
        mature: 0,
        dry: 0,
        weeds: 0,
        pests: 0
    })

    function speak(text) {
        if (!('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'zh-CN'
        utter.rate = 1
        utter.pitch = 1.15
        utter.volume = 1
        window.speechSynthesis.speak(utter)
    }

    function handleToast(text, speakIt = false) {
        toastText.value = text
        if (speakIt) speak(text)
    }

    function handlePlotUpdate(plot) {
        activePlot.value = plot
    }

    function handleSummaryUpdate(data) {
        summary.value = data
    }

    function handleToolChange(tool) {
        selectedTool.value = tool
    }
</script>

<style scoped>
    .little-farmer-3d-page {
        min-height: 100vh;
        padding: 16px;
        background: linear-gradient(180deg, #bde7ff 0%, #dff5ff 28%, #dff2cf 68%, #b8de88 100%);
        overflow: hidden;
    }

    .page-bg {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at 12% 12%, rgba(255,255,255,0.45), transparent 18%), radial-gradient(circle at 80% 10%, rgba(255,245,180,0.28), transparent 16%);
    }

    .top-bar {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
    }

    .title-box {
        flex: 1;
        padding: 18px 22px;
        border-radius: 22px;
        background: rgba(255,255,255,0.78);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 30px rgba(63, 88, 41, 0.12);
    }

        .title-box h1 {
            margin: 0 0 8px;
            font-size: 30px;
            color: #6c4717;
        }

        .title-box p {
            margin: 0;
            color: #786549;
            font-size: 14px;
        }

    .main-layout {
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 16px;
        height: calc(100vh - 126px);
    }

    .scene-wrap {
        min-width: 0;
        height: 100%;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 36px rgba(46, 70, 29, 0.18);
    }

    @media (max-width: 1100px) {
        .main-layout {
            grid-template-columns: 1fr;
            height: auto;
        }

        .scene-wrap {
            height: 72vh;
        }

        .top-bar {
            flex-direction: column;
        }
    }
</style>