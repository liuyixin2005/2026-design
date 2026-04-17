import { reactive } from 'vue'

export const store = reactive({
  currentPage: 'home',
  bestLevel: parseInt(localStorage.getItem('quizBest') || 0),
  bestScore: parseInt(localStorage.getItem('quizScore') || 0),
  detailModalVisible: false,
  detailData: { title: '', img: '', text: '' },
  m3: '⏳',
  m4: '⏳'
})

export const showPage = (pageId) => {
  store.currentPage = pageId
  if (pageId === 'quiz') {
    store.bestLevel = parseInt(localStorage.getItem('quizBest') || 0)
    store.bestScore = parseInt(localStorage.getItem('quizScore') || 0)
  }
}

export const showDetail = (title, img, text) => {
  store.detailData = { title, img, text }
  store.detailModalVisible = true
}

export const closeDetailModal = () => {
  store.detailModalVisible = false
}

export const playVoice = (text) => {
  if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = text;
      msg.lang = 'zh-CN';
      msg.volume = 1;
      msg.rate = 1;
      window.speechSynthesis.speak(msg);
      return msg;
  }

  return null;
}

export const stopVoice = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export const unlockMedal = (lev) => {
  if (lev > store.bestLevel) {
    localStorage.setItem("quizBest", lev)
    store.bestLevel = lev
  }
}

export const updateScore = (score) => {
    let oldScore = parseInt(localStorage.getItem('quizScore') || 0)
    if (score > oldScore) {
        localStorage.setItem('quizScore', score)
        store.bestScore = score
    }
}
