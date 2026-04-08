<template>
  <div class="page active">
    <!-- 音乐按钮 -->
    <button class="music-btn" @click="toggleMusic()" id="musicBtn">{{ musicOn ? '🔊' : '🔇' }}</button>

    <!-- 游戏首页 -->
    <div v-if="quizState === 'home'" class="quiz-home active">
      <div class="wheat">🌾🌾🌾</div>
      <h2>🏆 农耕知识大闯关</h2>
      <p style="margin:10px 0">快乐答题，成为农耕小博士！</p>

      <!-- 勋章 -->
      <div class="medal-grid">
        <div class="medal" :class="{ unlocked: store.bestLevel >= 1 }"><div class="lock" v-if="store.bestLevel < 1">🔒</div>🌱</div>
        <div class="medal" :class="{ unlocked: store.bestLevel >= 2 }"><div class="lock" v-if="store.bestLevel < 2">🔒</div>🌿</div>
        <div class="medal" :class="{ unlocked: store.bestLevel >= 3 }"><div class="lock" v-if="store.bestLevel < 3">🔒</div>🌸</div>
        <div class="medal" :class="{ unlocked: store.bestLevel >= 4 }"><div class="lock" v-if="store.bestLevel < 4">🔒</div>🍇</div>
        <div class="medal" :class="{ unlocked: store.bestLevel >= 5 }"><div class="lock" v-if="store.bestLevel < 5">🔒</div>🏆</div>
      </div>

      <button class="quiz-btn" @click="startQuiz()">开始闯关</button>
      <button class="nav-btn" @click="showPreview()">查看题库</button>
      <button class="nav-btn" @click="showRecord()">历史成绩</button>
      <button class="nav-btn" @click="confirmBack()">返回首页</button>
    </div>

    <!-- 闯关主界面 -->
    <div v-if="quizState === 'game'">
      <div class="quiz-header">
        <button class="nav-btn" @click="confirmPause()">返回</button>
        <h2 :style="{ color: levelColors[gameLevel - 1] }">第 <span>{{ gameLevel }}</span> 关</h2>
        <button class="nav-btn" @click="pauseGame()">暂停</button>
      </div>

      <!-- 禾苗生长进度 -->
      <div class="grow-bar">
        <div class="grow-node" :class="{ done: store.bestLevel >= 1, current: gameLevel === 1 }">🌱</div>
        <div class="grow-line"></div>
        <div class="grow-node" :class="{ done: store.bestLevel >= 2, current: gameLevel === 2 }">🌿</div>
        <div class="grow-line"></div>
        <div class="grow-node" :class="{ done: store.bestLevel >= 3, current: gameLevel === 3 }">🌸</div>
        <div class="grow-line"></div>
        <div class="grow-node" :class="{ done: store.bestLevel >= 4, current: gameLevel === 4 }">🍇</div>
        <div class="grow-line"></div>
        <div class="grow-node" :class="{ done: store.bestLevel >= 5, current: gameLevel === 5 }">🏆</div>
      </div>

      <!-- 得分进度条 -->
      <div style="text-align:center; margin:5px 0">
        得分：<span>{{ gameScore }}</span> / 30 分
      </div>
      <div class="score-progress-box">
        <div class="score-progress" :style="{ width: Math.min(100, (gameScore/30)*100) + '%', background: (gameScore/30)*100 < 30 ? 'red' : ((gameScore/30)*100 < 70 ? 'orange' : '#689F38') }"></div>
      </div>

      <!-- 倒计时 -->
      <div class="countdown-circle" :class="{ warning: timeLeft <= 5 && timeLeft > 3, danger: timeLeft <= 3 }" :style="{ background: 'conic-gradient(#689F38 ' + (timeLeft/15*100) + '%, #eee ' + (timeLeft/15*100) + '%)' }">
        <div class="countdown-inner"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24px">{{ timeLeft }}</div>
      </div>

      <!-- 题目 -->
      <div class="question-card" v-if="currentQuestion">
        <div class="quiz-title">{{ currentQuestion.q }}</div>

        <div class="options">
            <template v-if="currentQuestion.type === 'img' || currentQuestion.type === 'choose' || currentQuestion.type === 'judge'">
                <div v-for="(item, i) in currentQuestion.o" :key="i" class="option" :class="{ selected: selectedAns === i }" @click="selectedAns = i">
                    <span class="option-icon">{{ item }}</span> {{ item }}
                </div>
            </template>
            <template v-else-if="currentQuestion.type === 'fill'">
                <input type="text" class="search-box" style="width: 80%; border-radius:10px; border:2px solid #ccc; padding:10px;" placeholder="请输入答案" v-model="selectedAnsText" />
            </template>
        </div>
        <p style="color:#888; margin-top:10px">{{ qTip }}</p>
      </div>

      <button class="quiz-btn" :disabled="submitDisabled" @click="submitAnswer()">提交答案</button>
      <button class="tip-btn" @click="useTip()">💡 提示({{ tipCount }}次)</button>
      <button class="retry-btn" v-show="retry" @click="retryQuestion()">再试一次</button>
    </div>

    <!-- 题库预览 -->
    <div class="quiz-modal" style="display:flex" v-if="previewModalVisible">
      <div class="quiz-modal-box">
        <h3>题库预览</h3>
        <p>1. 哪个是水稻？</p>
        <p>2. 小麦生长在？</p>
        <p>3. 玉米是什么颜色？</p>
        <button class="quiz-btn" @click="closeQModal()">关闭</button>
      </div>
    </div>

    <!-- 成绩弹窗 -->
    <div class="quiz-modal" style="display:flex" v-if="recordModalVisible">
      <div class="quiz-modal-box">
        <h3>历史成绩</h3>
        <p>最高关卡：<span>{{ store.bestLevel }}</span></p>
        <p>最高得分：<span>{{ store.bestScore }}</span></p>
        <button class="quiz-btn" @click="closeQModal()">关闭</button>
      </div>
    </div>

    <!-- 暂停弹窗 -->
    <div class="quiz-modal" style="display:flex" v-if="pauseModalVisible">
      <div class="quiz-modal-box">
        <h3>游戏暂停</h3>
        <button class="quiz-btn" style="margin-right:10px;" @click="resumeGame()">继续游戏</button>
        <button class="nav-btn" @click="confirmExit()">退出游戏</button>
      </div>
    </div>

    <!-- 提示弹窗 -->
    <div class="quiz-modal" style="display:flex" v-if="tipModalVisible">
      <div class="quiz-modal-box">
        <p>{{ tipText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, playVoice, showPage, unlockMedal, updateScore } from '../../store'

const musicOn = ref(true)
let audio = null

const toggleMusic = () => {
  if (!audio) {
    audio = new Audio()
    audio.loop = true
    audio.volume = 0.3
  }
  musicOn.value = !musicOn.value
  if(audio) audio.muted = !musicOn.value
}

const quizState = ref('home')
const gameLevel = ref(1)
const gameScore = ref(0)
const questionIndex = ref(0)
const timeLeft = ref(15)
const tipCount = ref(2)
const selectedAns = ref(null)
const selectedAnsText = ref('')
const retry = ref(false)
const qTip = ref('')

let timeInterval = null

const levelColors = ["#A5D6A7","#66BB6A","#FFCA28","#FF9800","#F44336"]

const questionBank = [
  [
    {type:"img", q:"哪个是水稻？", ans:0, o:["🌾","🌽","🥕"], tip:"水稻长在水里，是大米原料"} ,
    {type:"img", q:"哪个是小麦？", ans:1, o:["🌽","🌾","🥔"], tip:"小麦磨成面粉做馒头"} ,
    {type:"img", q:"哪个是玉米？", ans:1, o:["🥕","🌽","🍅"], tip:"玉米是黄色的粗粮"} ,
    {type:"img", q:"哪个是大豆？", ans:2, o:["🍅","🥔","🫘"], tip:"大豆能做豆腐豆浆"} ,
    {type:"img", q:"哪个是胡萝卜？", ans:0, o:["🥕","🍆","🌶️"], tip:"胡萝卜是红色长锥形"} ,
    {type:"img", q:"哪个是土豆？", ans:1, o:["🍅","🥔","🍠"], tip:"土豆长在土里"}
  ],
  [
    {type:"img", q:"哪个是白菜？", ans:0, o:["🥬","🧅","🧄"], tip:"白菜是绿色蔬菜"} ,
    {type:"img", q:"哪个是西瓜？", ans:1, o:["🍊","🍉","🍓"], tip:"西瓜夏天成熟"} ,
    {type:"img", q:"哪个是苹果？", ans:0, o:["🍎","🍌","🍇"], tip:"苹果是红色水果"} ,
    {type:"img", q:"哪个是香蕉？", ans:1, o:["🍊","🍌","🍑"], tip:"香蕉是黄色弯弯的"} ,
    {type:"img", q:"哪个是番茄？", ans:2, o:["🥕","🥒","🍅"], tip:"番茄也叫西红柿"} ,
    {type:"img", q:"哪个是黄瓜？", ans:1, o:["🍆","🥒","🌶️"], tip:"黄瓜绿色长条形"}
  ],
  [
    {type:"choose", q:"水稻喜欢长在哪里？", ans:1, o:["沙漠","水里","山上"], tip:"水稻生长在水田"} ,
    {type:"choose", q:"小麦能做成什么？", ans:0, o:["馒头","米饭","豆腐"], tip:"小麦=面粉=馒头"} ,
    {type:"choose", q:"玉米是什么颜色？", ans:2, o:["红色","蓝色","黄色"], tip:"成熟玉米是黄色"} ,
    {type:"choose", q:"土豆长在哪里？", ans:1, o:["树上","土里","水里"], tip:"土豆在地下生长"} ,
    {type:"choose", q:"农作物需要什么？", ans:0, o:["水","火","油"], tip:"植物生长需要水"} ,
    {type:"choose", q:"我们要怎样对粮食？", ans:2, o:["浪费","扔掉","珍惜"], tip:"要珍惜每一粒粮食"}
  ],
  [
    {type:"choose", q:"清明时节适合？", ans:0, o:["播种","收割","冬眠"], tip:"清明气温适合播种"} ,
    {type:"choose", q:"锄头用来做什么？", ans:1, o:["收割","除草","浇水"], tip:"锄头松土除草"} ,
    {type:"choose", q:"镰刀用来做什么？", ans:0, o:["收割","挖土","施肥"], tip:"镰刀收割粮食"} ,
    {type:"choose", q:"秋天是什么季节？", ans:1, o:["播种","丰收","休眠"], tip:"秋天收获粮食"} ,
    {type:"choose", q:"什么可以浇庄稼？", ans:2, o:["油","醋","水"], tip:"用水给农作物浇水"} ,
    {type:"choose", q:"种子种在哪里？", ans:0, o:["土里","水里","石头"], tip:"种子种在土地里"}
  ],
  [
    {type:"judge", q:"小麦是黄色的吗？", ans:1, o:["是","不是"], tip:"成熟小麦是金黄色"} ,
    {type:"judge", q:"水稻生长在水里？", ans:0, o:["是","不是"], tip:"水稻必须种在水田"} ,
    {type:"judge", q:"玉米是蔬菜？", ans:1, o:["是","不是"], tip:"玉米属于粮食作物"} ,
    {type:"judge", q:"我们要珍惜粮食？", ans:0, o:["是","不是"], tip:"珍惜粮食人人有责"} ,
    {type:"fill", q:"小麦可以做成：", ans:"馒头", tip:"馒头、面条、面包都可以"} ,
    {type:"fill", q:"水稻加工成：", ans:"大米", tip:"水稻去皮后就是大米"}
  ]
]

const currentQuestion = computed(() => {
    return questionBank[gameLevel.value - 1]?.[questionIndex.value] || null
})

const submitDisabled = computed(() => {
    if (currentQuestion.value?.type === 'fill') return !selectedAnsText.value
    return selectedAns.value === null
})

const startQuiz = () => {
    quizState.value = 'game'
    gameLevel.value = 1
    gameScore.value = 0
    questionIndex.value = 0
    tipCount.value = 2
    loadQuestion()
    if(audio && musicOn.value) audio.play()
}

const loadQuestion = () => {
    clearInterval(timeInterval)
    selectedAns.value = null
    selectedAnsText.value = ''
    retry.value = false
    timeLeft.value = 15
    qTip.value = ''
    startTimer()
}

const startTimer = () => {
    timeInterval = setInterval(() => {
        timeLeft.value--
        if(timeLeft.value <= 0) {
            clearInterval(timeInterval)
            showAnswer(false, true)
        }
    }, 1000)
}

const submitAnswer = () => {
    clearInterval(timeInterval)
    let correct = false
    if(currentQuestion.value.type === 'fill') {
        correct = selectedAnsText.value === currentQuestion.value.ans
    } else {
        correct = selectedAns.value === currentQuestion.value.ans
    }

    if(correct){
        gameScore.value += 10
        playVoice("答对啦！你真厉害～")
        showAnswer(true)
    } else {
        playVoice("没关系，再试一试！")
        showAnswer(false)
    }
}

const showAnswer = (correct, timeout = false) => {
    let ansText = currentQuestion.value.type === "fill" ? currentQuestion.value.ans : currentQuestion.value.o[currentQuestion.value.ans]
    qTip.value = "正确答案：" + ansText

    if(correct){
        setTimeout(next, 1500)
    } else {
        if(retry.value || timeout){
            setTimeout(next, 1500)
        } else {
            retry.value = true
        }
    }
}

const next = () => {
    questionIndex.value++
    if(questionIndex.value >= 6){
        if(gameScore.value >= 30){
            unlockMedal(gameLevel.value)
            gameLevel.value++
            if(gameLevel.value > 5){
                alert("🎉 恭喜通关！解锁隐藏知识：玉米每根须对应一粒玉米粒！")
                gameLevel.value = 5
            }
        }
        questionIndex.value = 0
        updateScore(gameScore.value)
        gameScore.value = 0
    }
    loadQuestion()
}

const retryQuestion = () => loadQuestion()

const previewModalVisible = ref(false)
const showPreview = () => { previewModalVisible.value = true }

const recordModalVisible = ref(false)
const showRecord = () => { recordModalVisible.value = true }

const pauseModalVisible = ref(false)
const pauseGame = () => {
    clearInterval(timeInterval)
    pauseModalVisible.value = true
}
const confirmPause = () => { pauseGame() }
const resumeGame = () => {
    pauseModalVisible.value = false
    startTimer()
}

const confirmExit = () => {
    if(confirm("退出游戏？")){
        pauseModalVisible.value = false
        quizState.value = 'home'
    }
}

const confirmBack = () => {
    if(confirm("确定返回？进度会保留")) showPage("home")
}

const tipModalVisible = ref(false)
const tipText = ref('')
const useTip = () => {
    if(tipCount.value <= 0) return
    tipCount.value--
    tipText.value = currentQuestion.value.tip
    tipModalVisible.value = true
    playVoice(currentQuestion.value.tip)
    setTimeout(() => {
        tipModalVisible.value = false
    }, 5000)
}

const closeQModal = () => {
    previewModalVisible.value = false
    recordModalVisible.value = false
    pauseModalVisible.value = false
    tipModalVisible.value = false
}
</script>

<style scoped>
.page { display: block; animation: fadeIn 0.4s; }
.quiz-home { text-align: center; animation: slideUp 0.6s ease; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.wheat { font-size: 30px; animation: swing 2s infinite ease-in-out; }
@keyframes swing { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.medal-grid { display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
.medal { width: 70px; height: 70px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 30px; filter: grayscale(1); opacity: 0.6; position: relative; transition: 0.3s; }
.medal.unlocked { filter: grayscale(0); opacity: 1; background: #FFE082; animation: star 0.6s ease; }
@keyframes star { 0% { transform: scale(0.8); box-shadow:0 0 0 gold; } 50% { transform: scale(1.2); box-shadow:0 0 20px gold; } 100% { transform: scale(1); } }
.medal:hover { transform: scale(1.15); }
.medal .lock { position: absolute; bottom: -5px; right: -5px; background: #666; color: white; width: 22px; height: 22px; border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.music-btn { position: fixed; top: 80px; right: 20px; background: #689F38; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 18px; cursor: pointer; z-index: 99; }
.quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.quiz-btn { background: #689F38; color: white; border: none; padding: 14px 35px; border-radius: 25px; font-size: 19px; cursor: pointer; transition: 0.3s; }
.quiz-btn:hover { transform: scale(1.08); background: #4CAF50; }
.quiz-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
.nav-btn { background: #FFE082; border: none; padding: 10px 18px; border-radius: 25px; color: #689F38; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; margin: 0 5px; }
.nav-btn:hover { transform: scale(1.1); background: #FFD54F; }
.grow-bar { display: flex; justify-content: center; align-items: center; margin: 25px 0; gap: 10px; }
.grow-node { width: 50px; height: 50px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 24px; filter: grayscale(1); transition: 0.4s; }
.grow-node.done { filter: grayscale(0); background: #81C784; }
.grow-node.current { filter: grayscale(0); background: #FFB74D; animation: pulse 1s infinite; }
@keyframes pulse { 0% { box-shadow:0 0 0 3px #FFE082; } 50% { box-shadow:0 0 0 8px #FFB74D; } 100% { box-shadow:0 0 0 3px #FFE082; } }
.grow-line { width: 30px; height: 4px; background: #ddd; }
.score-progress-box { width: 80%; height: 12px; background: #eee; border-radius: 10px; margin: 10px auto; overflow: hidden; }
.score-progress { height: 100%; width: 0%; transition: 0.5s ease; border-radius: 10px; }
.countdown-circle { width: 70px; height: 70px; position: relative; margin: 0 auto; border-radius: 50%; }
.countdown-inner { position: absolute; inset: 8px; border-radius: 50%; background: white; }
.countdown-circle.warning { color: orange; }
.countdown-circle.danger { color: red; animation: beat 0.5s infinite alternate; }
@keyframes beat { from { transform: scale(1); } to { transform: scale(1.1); } }
.question-card { background: white; border-radius: 15px; padding: 25px; margin: 15px 0; border: 2px dashed #FFE082; animation: fadeIn 0.4s; }
.option-icon { font-size: 24px; margin-right: 8px; }
.option { background: #FFE082; border-radius: 12px; padding: 20px; font-size: 19px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
.option:hover { background: #FFB74D; color: white; transform: scale(1.03); }
.option.selected { background: #689F38; color: white; border: 3px solid #388E3C; }
.options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
.tip-btn { background: #FFB74D; color: white; border: none; padding: 8px 16px; border-radius: 20px; margin: 5px; cursor: pointer; }
.retry-btn { background: #689F38; color: white; border: none; padding: 10px 20px; border-radius: 20px; margin-top: 10px; cursor: pointer; }
.quiz-modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.quiz-modal-box { background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 500px; text-align: center; }
.quiz-title { font-size:24px; margin-bottom:15px; font-weight:bold; color:#444; }
</style>
