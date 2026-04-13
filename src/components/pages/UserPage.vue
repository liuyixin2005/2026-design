<template>
  <div class="page active user-container">
    <h1 class="page-title">个人中心</h1>

    <!-- 个人信息头部 -->
    <div class="profile-header">
      <div class="avatar-wrapper">
        <div class="avatar">👧</div>
      </div>
      <h3 class="username">{{ userInfo.username }}</h3>
      <p class="user-desc">{{ userInfo.desc }}</p>
    </div>

    <!-- 数据统计面板 -->
    <div class="stats-board card">
      <div class="stat-item">
        <span class="stat-label">✨ 当前等级</span>
        <span class="stat-value level-text">初级小农夫</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">🏆 总积分</span>
        <span class="stat-value score-text">{{ store.bestScore || 0 }}</span>
      </div>
    </div>

    <!-- 双栏功能区：勋章墙与排行榜 -->
    <div class="dashboard-grid">
      <!-- 勋章墙 -->
      <div class="card medals-section">
        <h3 class="section-title">🏅 我的勋章墙</h3>
        <p class="medals-tip">点击类别查看不同等级的勋章 👇</p>

        <!-- 一行平铺分类选项卡 -->
        <div class="medals-tabs">
          <div 
            v-for="cat in medalCategories" 
            :key="cat.id" 
            class="medal-tab"
            :class="{ active: expandedMedal === cat.id }"
            @click="expandedMedal = cat.id"
            :style="expandedMedal === cat.id ? { borderColor: cat.border, backgroundColor: cat.color } : {}"
          >
            <div class="tab-icon">{{ cat.tiers[0].icon }}</div>
            <div class="tab-name">{{ cat.name }}</div>
            <div class="unlocked-count">{{ cat.tiers.filter(t => t.unlocked).length }}/{{ cat.tiers.length }}</div>
          </div>
        </div>

        <!-- 详细勋章列表 (展示区) -->
        <div class="medal-content">
          <div class="medal-tiers" :key="expandedMedal">
            <div 
              v-for="(tier, index) in currentCategory.tiers" 
              :key="index"
              class="tier-card"
              :class="{ 'is-unlocked': tier.unlocked }"
            >
              <div class="tier-icon-wrap">
                <span class="tier-icon">{{ tier.icon }}</span>
                <div v-if="!tier.unlocked" class="lock-overlay">🔒</div>
              </div>
              <div class="tier-info">
                <h5>{{ tier.level }}</h5>
                <p>{{ tier.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="card leaderboard-section">
        <h3 class="section-title">🏆 荣誉排行榜</h3>
        <p class="medals-tip">全服小农夫排名展示 👇</p>
        <div class="leaderboard-list">
          <div 
            class="leaderboard-item" 
            v-for="(player, index) in leaderboardData" 
            :key="index"
            :class="{ 'is-me': player.isMe }"
          >
            <div class="rank-num">
              <span v-if="index === 0">🥇</span>
              <span v-else-if="index === 1">🥈</span>
              <span v-else-if="index === 2">🥉</span>
              <span v-else class="rank-text">{{ index + 1 }}</span>
            </div>
            <div class="player-avatar">{{ player.avatar }}</div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
            </div>
            <div class="player-score">{{ player.score }} 分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮区 -->
    <div class="action-bar">
      <button class="btn btn-primary" @click="showEditModal = true">编辑资料</button>
      <button class="btn btn-secondary">退出登录</button>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <h3>编辑资料</h3>
        <div class="form-group">
          <label>昵称</label>
          <input type="text" v-model="editForm.username" placeholder="请输入你的昵称" />
        </div>
        <div class="form-group">
          <label>个人签名</label>
          <input type="text" v-model="editForm.desc" placeholder="请输入个人签名" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancelEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { store } from '../../store'

const showEditModal = ref(false)

const expandedMedal = ref(1)

const medalCategories = computed(() => [
  {
    id: 1,
    name: '学习勋章',
    color: '#e8f8f5',
    border: '#1abc9c',
    tiers: [
      { level: '🥉 启航', icon: '🟢', unlocked: true, desc: '首次学习' },
      { level: '🥈 进阶', icon: '🌟', unlocked: false, desc: '累计3天' },
      { level: '🥇 学霸', icon: '👑', unlocked: false, desc: '累计7天' }
    ]
  },
  {
    id: 2,
    name: '答题勋章',
    color: '#fef9e7',
    border: '#f1c40f',
    tiers: [
      { level: '🥉 挑战', icon: '🟡', unlocked: store.bestLevel > 0, desc: '通过1关' },
      { level: '🥈 达人', icon: '⭐', unlocked: store.bestLevel >= 3, desc: '通过3关' },
      { level: '🥇 王者', icon: '🏆', unlocked: store.bestLevel >= 5, desc: '通过5关' }
    ]
  },
  {
    id: 3,
    name: '农场勋章',
    color: '#ebf5fb',
    border: '#3498db',
    tiers: [
      { level: '🥉 播种', icon: '🔵', unlocked: store.m3, desc: '种植1次' },
      { level: '🥈 丰收', icon: '🚜', unlocked: false, desc: '收获多次' },
      { level: '🥇 大亨', icon: '🌻', unlocked: false, desc: '满级农场' }
    ]
  },
  {
    id: 4,
    name: '游戏勋章',
    color: '#f4ecf8',
    border: '#9b59b6',
    tiers: [
      { level: '🥉 新手', icon: '🟣', unlocked: store.m4, desc: '体验游戏' },
      { level: '🥈 高手', icon: '🎯', unlocked: false, desc: '积分破500' },
      { level: '🥇 大神', icon: '👾', unlocked: false, desc: '霸榜第一' }
    ]
  }
])

const currentCategory = computed(() => {
  return medalCategories.value.find(c => c.id === expandedMedal.value) || medalCategories.value[0]
})

const userInfo = ref({
  username: '小农夫',
  desc: '热爱大自然，快乐学习中 🌱'
})

const leaderboardData = computed(() => {
  const data = [
    { name: '种地大师', avatar: '😎', score: 3200 },
    { name: '疯狂麦斯', avatar: '🤠', score: 2850 },
    { name: userInfo.value.username, avatar: '👧', score: store.bestScore || 1500, isMe: true },
    { name: '快乐果农', avatar: '👩‍🌾', score: 1200 },
    { name: '菜菜子', avatar: '👶', score: 400 }
  ]
  // 按照分数降序排序
  return data.sort((a, b) => b.score - a.score)
})

const editForm = ref({
  username: '',
  desc: ''
})

const cancelEdit = () => {
  showEditModal.value = false
}

const saveEdit = () => {
  if (!editForm.value.username.trim()) {
    alert('昵称不能为空哦！')
    return
  }
  userInfo.value.username = editForm.value.username
  userInfo.value.desc = editForm.value.desc
  showEditModal.value = false
}

watch(showEditModal, (newVal) => {
  if (newVal) {
    editForm.value.username = userInfo.value.username
    editForm.value.desc = userInfo.value.desc
  }
})
</script>

<style scoped>
.page { 
  display: block; 
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 30px;
}

.user-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.dashboard-grid .card {
  margin-bottom: 0;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
}

/* 个人头部信息 */
.profile-header {
  text-align: center;
  margin-bottom: 25px;
}

.avatar-wrapper {
  width: 110px;
  height: 110px;
  background: #FFE082;
  border: 4px solid #fff;
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.3);
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
}

.username {
  margin-top: 15px;
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.user-desc {
  color: #7f8c8d;
  font-size: 14px;
}

/* 卡片基础样式 */
.card { 
  background: white; 
  border-radius: 24px; 
  padding:25px;
  border: 4px solid #FFF3E0; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06); 
  margin-bottom: 30px;
}

/* 状态看板 */
.stats-board {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 25px 20px; /* 减小上下填充以降低高度 */
}

.stat-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1; /* 平分宽度，保证文字居中和对齐 */
  gap: 12px;
}

.stat-label {
  font-size: 16px;
  color: #95a5a6;
  font-weight: bold;
}

.stat-value {
  font-size: 26px; /* 增大数值的字号 */
  font-weight: 800;
}

.level-text { color: #2ecc71; }
.score-text { color: #f39c12; }

.stat-divider {
  width: 2px;
  height: 50px;
  background-color: #f1f2f6;
}

/* 勋章墙区 */
.section-title {
  margin: 0 0 5px 0;
  color: #34495e;
  font-size: 18px;
  text-align: center;
}

.medals-tip {
  text-align: center;
  font-size: 12px;
  color: #aeb6bf;
  margin-bottom: 20px;
}

.medals-tabs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
}

.medal-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 5px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.medal-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.medal-tab.active {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.tab-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.tab-name {
  font-size: 14px;
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 4px;
}

.unlocked-count {
  font-size: 12px;
  color: #95a5a6;
}

.medal-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px 10px;
  border: 1px dashed #ecf0f1;
}

.medal-tiers {
  display: flex;
  justify-content: space-between;
  animation: fadeInDown 0.3s ease;
}

.tier-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
  opacity: 0.4;
  filter: grayscale(1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tier-card.is-unlocked {
  opacity: 1;
  filter: grayscale(0);
}

.tier-card.is-unlocked:hover .tier-icon-wrap {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 5px 15px rgba(255, 213, 79, 0.6);
}

.tier-icon-wrap {
  position: relative;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.05);
  margin-bottom: 10px;
  transition: all 0.3s;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.75);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.tier-info h5 {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #34495e;
}

.tier-info p {
  margin: 0;
  font-size: 11px;
  color: #7f8c8d;
  white-space: nowrap;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 排行榜区 */
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateX(5px);
  background: #fdfefe;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.leaderboard-item.is-me {
  background: #fff9e6;
  border: 1px solid #ffd54f;
}

.rank-num {
  width: 35px;
  font-size: 22px;
  text-align: center;
  margin-right: 10px;
}

.rank-text {
  font-size: 16px;
  font-weight: bold;
  color: #7f8c8d;
}

.player-avatar {
  font-size: 26px;
  margin-right: 12px;
  background: #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 15px;
  font-weight: bold;
  color: #2c3e50;
}

.player-score {
  font-size: 14px;
  font-weight: 800;
  color: #f39c12;
}

/* 底部按钮 */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:active {
  transform: scale(0.95);
}

.btn-primary {
  background: #ffd54f;
  color: #d35400;
  box-shadow: 0 4px 12px rgba(255, 213, 79, 0.4);
}

.btn-secondary {
  background: #ecf0f1;
  color: #7f8c8d;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.modal {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #7f8c8d;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #ffd54f;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  gap: 15px;
}

.modal-actions .btn {
  flex: 1;
}

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(15px); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>