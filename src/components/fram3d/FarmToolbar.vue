<template>
    <div class="toolbar">
        <button v-for="tool in tools"
                :key="tool.key"
                class="tool-btn"
                :class="{ active: selectedTool === tool.key }"
                @click="$emit('change-tool', tool.key)">
            <span class="icon">{{ tool.icon }}</span>
            <span class="label">{{ tool.name }}</span>
        </button>
    </div>
</template>

<script setup>
defineProps({
  selectedTool: {
    type: String,
    default: 'seed'
  }
})

defineEmits(['change-tool'])

const tools = [
  { key: 'seed', name: '播种', icon: '🌱' },
  { key: 'water', name: '浇水', icon: '💧' },
  { key: 'fertilize', name: '施肥', icon: '🧺' },
  { key: 'weed', name: '除草', icon: '🌿' },
  { key: 'pest', name: '除虫', icon: '🐞' },
  { key: 'harvest', name: '收割', icon: '🌾' }
]
</script>

<style scoped>
    .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px;
        border-radius: 20px;
        background: rgba(255,255,255,0.78);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 30px rgba(63, 88, 41, 0.12);
    }

    .tool-btn {
        border: none;
        border-radius: 16px;
        min-width: 92px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 700;
        color: #5f4820;
        background: linear-gradient(180deg, #fff7dd, #f3e2ae);
        transition: .22s;
        box-shadow: 0 6px 14px rgba(0,0,0,0.08);
    }

        .tool-btn:hover {
            transform: translateY(-2px);
        }

        .tool-btn.active {
            color: #fff;
            background: linear-gradient(180deg, #58ba51, #2e9541);
        }

    .icon {
        display: block;
        font-size: 20px;
        margin-bottom: 4px;
    }

    .label {
        font-size: 13px;
    }
</style>