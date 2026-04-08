<template>
  <div class="detail-modal" style="display:flex" v-if="store.detailModalVisible" @click.self="closeDetailModal()">
      <div class="modal-box">
          <span class="close-btn" @click="closeDetailModal()">×</span>
          <img :src="store.detailData.img" class="detail-img">
          <h2 style="text-align:center; margin-bottom:15px; color:#689F38">{{ store.detailData.title }}</h2>
          <p class="detail-text">{{ store.detailData.text }}</p>
          <p class="voice-tip">👉 长按页面听语音讲解</p>
      </div>
  </div>
</template>

<script setup>
import { store, closeDetailModal } from '../../store'
</script>

<style scoped>
.detail-modal { position: fixed; top: 0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-box { background: white; padding: 45px; border-radius: 20px; text-align: center; animation: pop 0.3s ease; width: 90%; max-width: 700px; position: relative; max-height: 85vh; overflow-y: auto; }
@keyframes pop { 0%{transform:scale(0.8);} 100%{transform:scale(1);} }
.close-btn { position: absolute; top: 20px; right: 25px; font-size: 28px; cursor: pointer; color: #666; }
.detail-img { width: 160px; margin: 0 auto 20px; display: block; }
.detail-text { font-size: 18px; line-height: 1.9; color: #333; text-align: center; margin-top: 15px; }
.voice-tip { text-align: center; margin-top: 25px; font-size: 16px; color: #689F38; font-weight: bold; }
</style>
