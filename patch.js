const fs = require('fs');

let content = fs.readFileSync('src/components/pages/ClassPage.vue', 'utf8');

// Replace template modal
content = content.replace(
  /<div v-if="showDetail" class="detail-modal" @click="closeDetail">[\s\S]*?<\/div>[\s]*<\/div>[\s]*<\/div>/g,
  \<div v-if="showDetail" class="detail-modal" @click="closeDetail">
      <div class="learning-modal-content" @click.stop>
        <button class="close-btn" @click="closeDetail">✖</button>
        
        <div v-if="detailType === 'crop' || detailType === 'tool'" class="learning-detail">
          <!-- 顶部区域 -->
          <div class="learning-top">
            <div class="learning-left">
              <h2>{{ detailData.name }} <span class="pinyin">({{ detailData.pinyin }})</span></h2>
              <div class="image-showcase">
                <div class="cartoon-img">{{ detailData.icon }}</div>
                <div class="real-img-placeholder">📷 实物图</div>
              </div>
            </div>
            <div class="learning-right">
              <div class="description" v-html="detailData.description"></div>
              <div class="detail-tip">💡 {{ detailData.tip }}</div>
            </div>
          </div>
          
          <!-- 中部视频与语音区 -->
          <div class="learning-middle">
            <div class="video-placeholder">▶️ 动画讲解视频</div>
            <div class="audio-control">
              <button class="audio-btn" @click="playAudio(detailData.name + '。' + detailData.description.replace(/<[^>]+>/g, ''))">🔊 语音讲解</button>
              <button class="audio-btn" @click="toggleRecording">
                {{ isRecording ? '⏹️ 停止录音' : '🎙️ 录音跟读' }}
              </button>
            </div>
            <div v-if="isRecording" class="recording-status">正在录音中，请大声朗读...</div>
          </div>

          <!-- 底部小提问区 -->
          <div class="learning-bottom" v-if="detailData.quiz">
            <div class="quiz-section">
              <h3>🧠 小提问</h3>
              <div class="question-container">
                <p class="question">Q: {{ detailData.quiz.question }}</p>
                <div class="quiz-options-inline">
                  <button
                    v-for="option in detailData.quiz.options"
                    :key="option"
                    class="quiz-option-btn"
                    @click="submitQuiz(option)"
                    :disabled="quizResult !== null"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
              <div v-if="quizResult !== null" class="quiz-result" :class="{ correct: isQuizCorrect }">
                {{ quizResultMsg }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="detailType === 'poem'" class="poem-detail">
          <h3>{{ detailData.title }}</h3>
          <p>作者：{{ detailData.author }}</p>
          <div class="poem-text">{{ detailData.text }}</div>
          <p>{{ detailData.explanation }}</p>
          <div class="poem-tip">{{ detailData.tip }}</div>
        </div>
      </div>
    </div>\
);

// Replace state variables
content = content.replace(
  /const detailData = ref\\(\\{\}\\)\\s*const showQuiz = ref\\(false\\)\\s*const quizData = ref\\(\\{\}\\)\\s*const completedSteps = ref\\(0\\)/g,
  \const detailData = ref({})
const completedSteps = ref(0)
const quizResult = ref(null)
const isQuizCorrect = ref(false)
const quizResultMsg = ref('')
const isRecording = ref(false)\
);

// Replace crops data
content = content.replace(
  /const crops = \\[[\\s\\S]*?\\n\\]/g,
  \const crops = [
  {
    id: 1,
    name: '水稻',
    pinyin: 'shuǐ dào',
    icon: '🌾',
    description: '我们吃的米饭就是水稻变来的，它<b>喜欢长在水里</b>，从种子发芽到成熟，需要<b>慢慢等待一段时间</b>。',
    tip: '水稻的种子藏在稻穗里，像一串串小珍珠～',
    audio: 'shuǐ dào',
    quiz: { question: '水稻喜欢长在哪里呀？', options: ['水里', '山上', '沙漠'], answer: '水里' }
  },
  {
    id: 2,
    name: '小麦',
    pinyin: 'xiǎo mài',
    icon: '🌾',
    description: '小麦是黄色的，它可以做成<b>面粉</b>，做<b>馒头、面包</b>。',
    tip: '小麦有一根根长长的芒须，风一吹就像一片金色的波浪！',
    audio: 'xiǎo mài',
    quiz: { question: '小麦是什么颜色的呀？', options: ['黄色', '红色', '蓝色'], answer: '黄色' }
  }
]\
);

// Replace tools data
content = content.replace(
  /const tools = \\[[\\s\\S]*?\\n\\]/g,
  \const tools = [
  {
    id: 1,
    name: '锄头',
    pinyin: 'chú tóu',
    icon: '⛏️',
    description: '锄头用来<b>除草、松土</b>，让农作物呼吸更顺畅。',
    tip: '锄头是农民伯伯的好帮手，使用时要注意安全哦！',
    audio: 'chú tóu',
    quiz: { question: '锄头主要用来做什么呀？', options: ['浇水', '松土除草', '收获'], answer: '松土除草' }
  },
  {
    id: 2,
    name: '镰刀',
    pinyin: 'lián dāo',
    icon: '🪝',
    description: '镰刀弯弯的像月亮，主要用来<b>收割庄稼</b>。',
    tip: '镰刀的刃非常锋利，小朋友们不能随便玩耍。',
    audio: 'lián dāo',
    quiz: { question: '镰刀的形状像什么呀？', options: ['太阳', '月亮', '星星'], answer: '月亮' }
  }
]\
);

content = content.replace(
  /const showCropDetail = \\(crop\\) => \\{[\\s\\S]*?showDetail.value = true\\s*\\}\\s*const showToolDetail = \\(tool\\) => \\{[\\s\\S]*?showDetail.value = true\\s*\\}\\s*const showPoemDetail = \\(poem\\) => \\{[\\s\\S]*?showDetail.value = true\\s*\\}\\s*const closeDetail = \\(\\) => \\{\\s*showDetail.value = false\\s*\\}\\s*const closeQuiz = \\(\\) => \\{\\s*showQuiz.value = false\\s*\\}/g,
  \const showCropDetail = (crop) => {
  playAudio(crop.name)
  detailType.value = 'crop'
  detailData.value = crop
  quizResult.value = null
  showDetail.value = true
}

const showToolDetail = (tool) => {
  playAudio(tool.name)
  detailType.value = 'tool'
  detailData.value = tool
  quizResult.value = null
  showDetail.value = true
}

const showPoemDetail = (poem) => {
  detailType.value = 'poem'
  detailData.value = poem
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  isRecording.value = false
}\
);

// Replace startQuiz and answerQuiz
content = content.replace(
  /const startQuiz = \\(data\\) => \\{[\\s\\S]*?showQuiz.value = false\\s*\\}/g,
  \const submitQuiz = (option) => {
  quizResult.value = option
  if (option === detailData.value.quiz.answer) {
    isQuizCorrect.value = true
    quizResultMsg.value = '🎉 答对了！太棒啦，获得 1 枚“知识小勋章”！🏅'
  } else {
    isQuizCorrect.value = false
    quizResultMsg.value = '🤔 哎呀，再想想看！正确答案是：' + detailData.value.quiz.answer
  }
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    setTimeout(() => {
      if (isRecording.value) {
        isRecording.value = false
        if ('speechSynthesis' in window) {
           alert("录音完成！你的发音很棒哦~ 🌟")
        }
      }
    }, 3000)
  }
}\
);

// Remove the standalone quiz modal
content = content.replace(
  /<div v-if="showQuiz" class="quiz-modal" @click="closeQuiz">[\s\S]*?<\/div>\s*<\/div>\s*/g,
  ''
);

fs.writeFileSync('src/components/pages/ClassPage.vue', content, 'utf8');
