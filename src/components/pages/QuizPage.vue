<template>
    <div class="page active">
        <!-- 背景氛围层 -->
        <div class="farm-skin" aria-hidden="true">
            <div class="sun">🌞</div>
            <div class="rainbow">🌈</div>
            <span class="cloud c1">☁️</span>
            <span class="cloud c2">☁️</span>
            <span class="cloud c3">☁️</span>
            <span class="bird b1">🐦</span>
            <span class="bird b2">🦋</span>
            <span class="flower f1">🌼</span>
            <span class="flower f2">🌸</span>
            <span class="flower f3">🌻</span>
            <span class="star s1">✨</span>
            <span class="star s2">✨</span>
            <span class="star s3">✨</span>
        </div>

        <!-- 音乐按钮 -->
        <button class="music-btn" @click="toggleMusic()" id="musicBtn">
            <span class="music-icon">{{ musicOn ? '🔊' : '🔇' }}</span>
        </button>

        <div class="quiz-shell">

            <!-- 游戏首页 -->
            <div v-if="quizState === 'home'" class="quiz-home active">
                <div class="home-hero">
                    <div class="home-badge">🌾 儿童农耕闯关乐园 🌾</div>
                    <div class="farm-house">🏡</div>
                    <h2>农耕知识大闯关</h2>
                    <p class="home-desc">快乐答题，收集勋章，成为最棒的农耕小博士！</p>
                    <div class="hero-tags">
                        <span>🎮 趣味闯关</span>
                        <span>🏅 收集勋章</span>
                        <span>🌱 学习知识</span>
                    </div>
                </div>

                <!-- 勋章 -->
                <div class="medal-section">
                    <div class="section-title">🏆 我的勋章收集册</div>
                    <div class="medal-grid">
                        <div v-for="(medal, idx) in medalMeta"
                             :key="medal.name"
                             class="medal"
                             :class="{ unlocked: store.bestLevel >= idx + 1, sparkle: newUnlockedMedal === idx + 1 }">
                            <div class="lock" v-if="store.bestLevel < idx + 1">🔒</div>
                            <span>{{ medal.icon }}</span>
                            <div class="medal-tip">
                                <strong>{{ medal.name }}</strong>
                                <small>{{ medal.condition }}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="home-actions">
                    <button class="quiz-btn primary-btn" @click="startQuiz()">开始闯关</button>
                    <button class="nav-btn soft-yellow" @click="showPreview()">查看题库</button>
                    <button class="nav-btn soft-blue" @click="showRecord()">历史成绩</button>
                    <button class="nav-btn soft-pink" @click="confirmBack()">返回首页</button>
                </div>
            </div>

            <!-- 闯关主界面 -->
            <div v-if="quizState === 'game'" class="game-stage">
                <div class="quiz-header">
                    <button class="nav-btn soft-pink" @click="confirmPause()">返回</button>

                    <div class="header-center">
                        <h2 class="level-badge" :style="{ background: levelColors[gameLevel - 1] }">
                            第 <span>{{ gameLevel }}</span> 关
                        </h2>
                        <div class="level-goal">本关目标：答满 30 分即可通关 🎯</div>
                    </div>

                    <button class="nav-btn soft-blue" @click="pauseGame()">暂停</button>
                </div>

                <!-- 禾苗成长进度 -->
                <div class="grow-panel">
                    <div class="grow-title">🌱 成长之路</div>
                    <div class="grow-bar">
                        <template v-for="(medal, idx) in medalMeta" :key="`grow-${medal.name}`">
                            <div class="grow-node"
                                 :class="{ done: store.bestLevel >= idx + 1, current: gameLevel === idx + 1 }"
                                 :title="`${medal.name}（30分过关）`">
                                {{ medal.icon }}
                            </div>
                            <div v-if="idx < medalMeta.length - 1"
                                 class="grow-line"
                                 :class="{ grow: growAnimatingIndex === idx + 1 }"></div>
                        </template>
                    </div>
                </div>

                <!-- 顶部状态区 -->
                <div class="status-panel">
                    <div class="status-card score-card">
                        <div class="status-label">当前得分</div>
                        <div class="status-value">{{ animatedScore }}<small>/30</small></div>
                    </div>

                    <div class="status-card correct-card">
                        <div class="status-label">答对题数</div>
                        <div class="status-value">{{ levelCorrectCount }}<small>/6</small></div>
                    </div>

                    <div class="status-card tip-card">
                        <div class="status-label">提示机会</div>
                        <div class="status-value">{{ tipCount }}<small>次</small></div>
                    </div>
                </div>

                <!-- 得分进度条 -->
                <div class="score-area">
                    <div class="score-text">
                        得分进度：<span>{{ animatedScore }}</span> / 30 分
                    </div>
                    <div class="score-progress-box" :class="{ clear: gameScore >= 30 }">
                        <div class="score-progress"
                             :style="{
                             width: Math.min(100, (gameScore / 30) * 100) + '%' ,
                             background:
                             (gameScore / 30) * 100 < 30
                    ? 'linear-gradient(90deg, #ff8a80, #ff5252)'
                    : (gameScore / 30) * 100 < 70
                    ? 'linear-gradient(90deg, #ffd180, #ffb300)'
                    : 'linear-gradient(90deg, #81c784, #43a047)'
              }"
            ></div>
                        <span v-for="b in scoreBubbles" :key="b.id" class="score-bubble">{{ b.text }}</span>
                    </div>
                    <p v-if="passToast" class="pass-toast">{{ passToast }}</p>
                </div>

                <!-- 倒计时 -->
                <div class="timer-panel">
                    <div class="countdown-circle"
                         :class="{ warning: timeLeft <= 5 && timeLeft > 3, danger: timeLeft <= 3 }"
                         :style="{
              background:
                'conic-gradient(#66bb6a ' +
                (timeLeft / 15 * 100) +
                '%, #e8f5e9 ' +
                (timeLeft / 15 * 100) +
                '%)'
            }">
                        <div class="countdown-inner"></div>
                        <div class="countdown-text">
                            <span class="count-number">{{ timeLeft }}</span>
                            <small>秒</small>
                        </div>
                    </div>
                    <div class="timer-tip">
                        {{ timeLeft > 5 ? '慢慢想，不着急～' : timeLeft > 3 ? '快一点哦！' : '要结束啦！' }}
                    </div>
                </div>

                <!-- 题目 -->
                <div class="question-card" v-if="currentQuestion" :key="questionCardKey">
                    <div class="question-top-row">
                        <div class="question-tag">第 {{ questionIndex + 1 }} 题</div>
                        <div class="question-type-tag">
                            {{
                currentQuestion.type === 'img'
                  ? '图片题'
                  : currentQuestion.type === 'choose'
                  ? '选择题'
                  : currentQuestion.type === 'judge'
                  ? '判断题'
                  : '填空题'
                            }}
                        </div>
                    </div>

                    <div class="quiz-title">{{ currentQuestion.q }}</div>

                    <div class="options">
                        <template v-if="currentQuestion.type === 'img' || currentQuestion.type === 'choose' || currentQuestion.type === 'judge'">
                            <div v-for="(item, i) in currentQuestion.o"
                                 :key="i"
                                 class="option"
                                 :class="{ selected: selectedAns === i }"
                                 @click="onOptionPick(i)">
                                <span class="option-icon">{{ optionIcon(item, i) }}</span>
                                <span class="option-text">{{ item }}</span>
                                <small v-if="optionPinyin[item]">{{ optionPinyin[item] }}</small>
                            </div>
                        </template>

                        <template v-else-if="currentQuestion.type === 'fill'">
                            <div class="fill-box">
                                <input type="text"
                                       class="search-box fill-input"
                                       placeholder="请输入答案"
                                       v-model="selectedAnsText" />
                                <div class="fill-helper">✍️ 想一想，把正确答案写进去吧</div>
                            </div>
                        </template>
                    </div>

                    <p class="q-tip">📌 {{ qTip || '请选择你认为正确的答案吧～' }}</p>
                </div>

                <div class="action-row">
                    <button v-if="currentQuestion?.type === 'fill'"
                            class="quiz-btn primary-btn"
                            :disabled="submitDisabled"
                            @click="submitAnswer()">
                        提交答案
                    </button>

                    <button class="tip-btn" @click="useTip()">💡 提示（{{ tipCount }}次）</button>
                    <button class="retry-btn" v-show="retry" @click="retryQuestion()">再试一次</button>
                </div>
            </div>

            <!-- 题库预览 -->
            <div class="quiz-modal" style="display:flex" v-if="previewModalVisible">
                <div class="quiz-modal-box cute-modal">
                    <h3>📚 题库预览</h3>
                    <div class="preview-list">
                        <p v-for="(item, idx) in previewQuestions" :key="item">{{ idx + 1 }}. {{ item }}</p>
                    </div>
                    <button class="quiz-btn primary-btn" @click="closeQModal()">关闭</button>
                </div>
            </div>

            <!-- 成绩弹窗 -->
            <div class="quiz-modal" style="display:flex" v-if="recordModalVisible">
                <div class="quiz-modal-box cute-modal">
                    <h3>🏅 历史成绩</h3>
                    <p>最高关卡：<span class="big-num">{{ rollingBestLevel }}</span></p>
                    <p>最高得分：<span class="big-num">{{ rollingBestScore }}</span></p>
                    <div class="record-list">
                        <div class="record-item" v-for="item in levelHistory" :key="`r-${item.level}`">
                            <strong>第{{ item.level }}关</strong>
                            <span>得分 {{ item.score }} / 答对 {{ item.correct }}/6</span>
                            <small>勋章时间：{{ item.time || '未解锁' }}</small>
                        </div>
                    </div>
                    <button class="quiz-btn primary-btn" @click="closeQModal()">关闭</button>
                </div>
            </div>

            <!-- 暂停弹窗 -->
            <div class="quiz-modal" style="display:flex" v-if="pauseModalVisible">
                <div class="quiz-modal-box cute-modal">
                    <h3>⏸ 游戏暂停</h3>
                    <p style="margin: 8px 0 18px; color:#666;">休息一下，准备好了再继续～</p>
                    <button class="quiz-btn primary-btn" style="margin-right:10px;" @click="resumeGame()">继续游戏</button>
                    <button class="nav-btn soft-pink" @click="confirmExit()">退出游戏</button>
                </div>
            </div>

            <!-- 提示弹窗 -->
            <div class="quiz-modal" style="display:flex" v-if="tipModalVisible">
                <div class="quiz-modal-box cute-modal">
                    <p style="font-size:18px;">💡 {{ tipText }}</p>
                </div>
            </div>

            <!-- 答题反馈 -->
            <div class="quiz-modal" style="display:flex" v-if="answerModalVisible">
                <div class="quiz-modal-box cute-modal answer-feedback-box">
                    <p class="answer-feedback-text">{{ answerModalText }}</p>
                </div>
            </div>

            <!-- 奖励弹窗 -->
            <div class="quiz-modal" style="display:flex" v-if="rewardModalVisible">
                <div class="quiz-modal-box reward-modal-box">
                    <div class="reward-icon">{{ rewardIcon }}</div>
                    <h3>🎉 {{ rewardTitle }}</h3>
                    <p>{{ rewardText }}</p>
                </div>
            </div>

            <div class="grass-strip" aria-hidden="true">🌱 🌿 🍀 🌾 🌻 🐞 🌱 🌿 🍀 🌾 🌻 🐝</div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
    import { store, playVoice, showPage, unlockMedal, updateScore } from '../../store'

    const musicOn = ref(true)
    let audio = null

    const medalMeta = [
        { icon: '🌱', name: '种子小勇士', condition: '通过第1关' },
        { icon: '🌿', name: '小苗小园丁', condition: '通过第2关' },
        { icon: '🌸', name: '开花小能手', condition: '通过第3关' },
        { icon: '🍇', name: '结果小农夫', condition: '通过第4关' },
        { icon: '🏆', name: '农耕小博士', condition: '通过第5关' }
    ]

    const optionPinyin = {
        是: 'shì',
        不是: 'bú shì',
        水里: 'shuǐ lǐ',
        土里: 'tǔ lǐ',
        山上: 'shān shàng',
        播种: 'bō zhǒng',
        收割: 'shōu gē',
        丰收: 'fēng shōu',
        珍惜: 'zhēn xī',
        水: 'shuǐ'
    }

    const toggleMusic = () => {
        if (!audio) {
            audio = new Audio()
            audio.src = 'https://assets.mixkit.co/music/preview/mixkit-farm-life-340.mp3'
            audio.loop = true
            audio.volume = 0.22
        }
        musicOn.value = !musicOn.value
        if (audio) {
            audio.muted = !musicOn.value
            if (musicOn.value) audio.play().catch(() => { })
        }
    }

    const quizState = ref('home')
    const gameLevel = ref(1)
    const gameScore = ref(0)
    const animatedScore = ref(0)
    const questionIndex = ref(0)
    const timeLeft = ref(15)
    const tipCount = ref(2)
    const selectedAns = ref(null)
    const selectedAnsText = ref('')
    const retry = ref(false)
    const answering = ref(false)
    const qTip = ref('')
    const newUnlockedMedal = ref(0)
    const growAnimatingIndex = ref(0)
    const scoreBubbles = ref([])
    const passToast = ref('')
    const questionCardKey = ref(0)
    const rollingBestLevel = ref(0)
    const rollingBestScore = ref(0)
    const levelCorrectCount = ref(0)
    const levelHistory = ref([])
    const answerModalVisible = ref(false)
    const answerModalText = ref('')
    const rewardModalVisible = ref(false)
    const rewardTitle = ref('')
    const rewardText = ref('')
    const rewardIcon = ref('🏅')

    const HISTORY_KEY = 'farm-quiz-level-history'
    let scoreBubbleId = 1
    let timeInterval = null

    const levelColors = [
        'linear-gradient(135deg, #81c784, #43a047)',
        'linear-gradient(135deg, #4db6ac, #00897b)',
        'linear-gradient(135deg, #ffd54f, #ffb300)',
        'linear-gradient(135deg, #ffb74d, #fb8c00)',
        'linear-gradient(135deg, #ef5350, #e53935)'
    ]

    const questionBank = [
        [
            { type: "img", q: "哪个是水稻？", ans: 0, o: ["🌾", "🌽", "🥕"], tip: "水稻长在水里，是大米原料" },
            { type: "img", q: "哪个是小麦？", ans: 1, o: ["🌽", "🌾", "🥔"], tip: "小麦磨成面粉做馒头" },
            { type: "img", q: "哪个是玉米？", ans: 1, o: ["🥕", "🌽", "🍅"], tip: "玉米是黄色的粗粮" },
            { type: "img", q: "哪个是大豆？", ans: 2, o: ["🍅", "🥔", "🫘"], tip: "大豆能做豆腐豆浆" },
            { type: "img", q: "哪个是胡萝卜？", ans: 0, o: ["🥕", "🍆", "🌶️"], tip: "胡萝卜是红色长锥形" },
            { type: "img", q: "哪个是土豆？", ans: 1, o: ["🍅", "🥔", "🍠"], tip: "土豆长在土里" }
        ],
        [
            { type: "img", q: "哪个是白菜？", ans: 0, o: ["🥬", "🧅", "🧄"], tip: "白菜是绿色蔬菜" },
            { type: "img", q: "哪个是西瓜？", ans: 1, o: ["🍊", "🍉", "🍓"], tip: "西瓜夏天成熟" },
            { type: "img", q: "哪个是苹果？", ans: 0, o: ["🍎", "🍌", "🍇"], tip: "苹果是红色水果" },
            { type: "img", q: "哪个是香蕉？", ans: 1, o: ["🍊", "🍌", "🍑"], tip: "香蕉是黄色弯弯的" },
            { type: "img", q: "哪个是番茄？", ans: 2, o: ["🥕", "🥒", "🍅"], tip: "番茄也叫西红柿" },
            { type: "img", q: "哪个是黄瓜？", ans: 1, o: ["🍆", "🥒", "🌶️"], tip: "黄瓜绿色长条形" }
        ],
        [
            { type: "choose", q: "水稻喜欢长在哪里？", ans: 1, o: ["沙漠", "水里", "山上"], tip: "水稻生长在水田" },
            { type: "choose", q: "小麦能做成什么？", ans: 0, o: ["馒头", "米饭", "豆腐"], tip: "小麦=面粉=馒头" },
            { type: "choose", q: "玉米是什么颜色？", ans: 2, o: ["红色", "蓝色", "黄色"], tip: "成熟玉米是黄色" },
            { type: "choose", q: "土豆长在哪里？", ans: 1, o: ["树上", "土里", "水里"], tip: "土豆在地下生长" },
            { type: "choose", q: "农作物需要什么？", ans: 0, o: ["水", "火", "油"], tip: "植物生长需要水" },
            { type: "choose", q: "我们要怎样对粮食？", ans: 2, o: ["浪费", "扔掉", "珍惜"], tip: "要珍惜每一粒粮食" }
        ],
        [
            { type: "choose", q: "清明时节适合？", ans: 0, o: ["播种", "收割", "冬眠"], tip: "清明气温适合播种" },
            { type: "choose", q: "锄头用来做什么？", ans: 1, o: ["收割", "除草", "浇水"], tip: "锄头松土除草" },
            { type: "choose", q: "镰刀用来做什么？", ans: 0, o: ["收割", "挖土", "施肥"], tip: "镰刀收割粮食" },
            { type: "choose", q: "秋天是什么季节？", ans: 1, o: ["播种", "丰收", "休眠"], tip: "秋天收获粮食" },
            { type: "choose", q: "什么可以浇庄稼？", ans: 2, o: ["油", "醋", "水"], tip: "用水给农作物浇水" },
            { type: "choose", q: "种子种在哪里？", ans: 0, o: ["土里", "水里", "石头"], tip: "种子种在土地里" }
        ],
        [
            { type: "judge", q: "小麦是黄色的吗？", ans: 1, o: ["是", "不是"], tip: "成熟小麦是金黄色" },
            { type: "judge", q: "水稻生长在水里？", ans: 0, o: ["是", "不是"], tip: "水稻必须种在水田" },
            { type: "judge", q: "玉米是蔬菜？", ans: 1, o: ["是", "不是"], tip: "玉米属于粮食作物" },
            { type: "judge", q: "我们要珍惜粮食？", ans: 0, o: ["是", "不是"], tip: "珍惜粮食人人有责" },
            { type: "fill", q: "小麦可以做成：", ans: "馒头", tip: "馒头、面条、面包都可以" },
            { type: "fill", q: "水稻加工成：", ans: "大米", tip: "水稻去皮后就是大米" }
        ]
    ]

    const currentQuestion = computed(() => {
        return questionBank[gameLevel.value - 1]?.[questionIndex.value] || null
    })

    const previewQuestions = computed(() => [
        questionBank[0][0].q,
        questionBank[1][1].q,
        questionBank[2][2].q
    ])

    const submitDisabled = computed(() => {
        if (currentQuestion.value?.type === 'fill') return !selectedAnsText.value
        return selectedAns.value === null
    })

    const startQuiz = () => {
        quizState.value = 'game'
        gameLevel.value = 1
        gameScore.value = 0
        animatedScore.value = 0
        questionIndex.value = 0
        levelCorrectCount.value = 0
        tipCount.value = 2
        loadQuestion()
        if (audio && musicOn.value) audio.play().catch(() => { })
    }

    const loadQuestion = () => {
        clearInterval(timeInterval)
        answering.value = false
        selectedAns.value = null
        selectedAnsText.value = ''
        retry.value = false
        timeLeft.value = 15
        qTip.value = ''
        questionCardKey.value += 1
        startTimer()
    }

    const onOptionPick = (index) => {
        if (answering.value || !currentQuestion.value || currentQuestion.value.type === 'fill') return
        selectedAns.value = index
        answering.value = true
        submitAnswer()
    }

    const startTimer = () => {
        timeInterval = setInterval(() => {
            timeLeft.value--
            if (timeLeft.value <= 0) {
                clearInterval(timeInterval)
                answerModalText.value = '⏰ 时间到啦！我们来看看正确答案吧～'
                answerModalVisible.value = true
                setTimeout(() => (answerModalVisible.value = false), 1500)
                showAnswer(false, true)
            }
        }, 1000)
    }

    const addScore = (delta) => {
        const prev = gameScore.value
        gameScore.value += delta
        animatedScore.value = prev
        animateNumber(animatedScore, gameScore.value, 420)

        const id = scoreBubbleId++
        scoreBubbles.value.push({ id, text: `+${delta}` })
        setTimeout(() => {
            scoreBubbles.value = scoreBubbles.value.filter((s) => s.id !== id)
        }, 900)
    }

    const animateNumber = (sourceRef, targetValue, duration = 400) => {
        const start = sourceRef.value
        const delta = targetValue - start
        if (delta === 0) return
        const startTime = Date.now()
        const timer = setInterval(() => {
            const p = Math.min(1, (Date.now() - startTime) / duration)
            sourceRef.value = Math.round(start + delta * p)
            if (p >= 1) clearInterval(timer)
        }, 16)
    }

    const submitAnswer = () => {
        clearInterval(timeInterval)
        let correct = false

        if (currentQuestion.value.type === 'fill') {
            correct = selectedAnsText.value === currentQuestion.value.ans
        } else {
            correct = selectedAns.value === currentQuestion.value.ans
        }

        if (correct) {
            levelCorrectCount.value += 1
            addScore(10)
            playVoice("答对啦！你真厉害～")
            showAnswer(true)
        } else {
            playVoice("没关系，再试一试！")
            showAnswer(false)
        }
    }

    const showAnswer = (correct, timeout = false) => {
        let ansText = currentQuestion.value.type === "fill"
            ? currentQuestion.value.ans
            : currentQuestion.value.o[currentQuestion.value.ans]

        qTip.value = "正确答案：" + ansText

        if (correct) {
            answerModalText.value = '✅ 答对啦！你真厉害～'
            answerModalVisible.value = true
            setTimeout(() => (answerModalVisible.value = false), 900)
            setTimeout(next, 1500)
        } else {
            answerModalText.value = timeout ? '⏰ 时间到啦，看看答案继续加油～' : '❌ 没关系，再试一试！'
            answerModalVisible.value = true
            setTimeout(() => (answerModalVisible.value = false), 1200)
            if (retry.value || timeout) {
                setTimeout(next, 1500)
            } else {
                retry.value = true
            }
        }
    }

    const next = () => {
        let delayNext = 0
        questionIndex.value++

        if (gameScore.value >= 30 || questionIndex.value >= 6) {
            const passed = gameScore.value >= 30
            const now = new Date().toLocaleString()

            levelHistory.value = levelHistory.value.filter((x) => x.level !== gameLevel.value)
            levelHistory.value.push({
                level: gameLevel.value,
                score: gameScore.value,
                correct: levelCorrectCount.value,
                time: passed ? now : ''
            })

            localStorage.setItem(HISTORY_KEY, JSON.stringify(levelHistory.value.sort((a, b) => a.level - b.level)))

            if (gameScore.value >= 30) {
                const passedLevel = gameLevel.value
                const medal = medalMeta[passedLevel - 1]

                if (medal) {
                    rewardIcon.value = medal.icon
                    rewardTitle.value = `恭喜获得：${medal.name}`
                    rewardText.value = `你已成功通过第${passedLevel}关，继续向下一枚勋章前进！`
                    rewardModalVisible.value = true
                    delayNext = 1400
                    setTimeout(() => { rewardModalVisible.value = false }, delayNext)
                }

                unlockMedal(gameLevel.value)
                newUnlockedMedal.value = gameLevel.value
                growAnimatingIndex.value = gameLevel.value
                passToast.value = '通关啦！进入下一关！'

                setTimeout(() => {
                    newUnlockedMedal.value = 0
                    growAnimatingIndex.value = 0
                    passToast.value = ''
                }, 1200)

                gameLevel.value++

                if (gameLevel.value > 5) {
                    alert("🎉 恭喜通关！隐藏知识：玉米每根须对应一粒玉米粒；水稻祖先是野生稻。")
                    gameLevel.value = 5
                }
            } else {
                passToast.value = '分数不足30，本关再挑战一次！'
                setTimeout(() => (passToast.value = ''), 1200)
            }

            questionIndex.value = 0
            updateScore(gameScore.value)
            animatedScore.value = gameScore.value
            gameScore.value = 0
            animateNumber(animatedScore, 0, 350)
            levelCorrectCount.value = 0
        }

        if (delayNext > 0) {
            setTimeout(() => loadQuestion(), delayNext)
        } else {
            loadQuestion()
        }
    }

    const retryQuestion = () => loadQuestion()

    const previewModalVisible = ref(false)
    const showPreview = () => { previewModalVisible.value = true }

    const recordModalVisible = ref(false)
    const pauseModalVisible = ref(false)

    const pauseGame = () => {
        clearInterval(timeInterval)
        pauseModalVisible.value = true
    }

    const optionIcon = (item, idx) => {
        if (/^[\u{1F300}-\u{1FAFF}]$/u.test(item)) return item
        return ['🐮', '🚜', '🌾', '🧺'][idx % 4]
    }

    onMounted(() => {
        const saved = localStorage.getItem(HISTORY_KEY)
        if (saved) {
            try {
                levelHistory.value = JSON.parse(saved)
            } catch {
                levelHistory.value = []
            }
        }

        if (!audio) {
            audio = new Audio('https://assets.mixkit.co/music/preview/mixkit-farm-life-340.mp3')
            audio.loop = true
            audio.volume = 0.22
            if (musicOn.value) audio.play().catch(() => { })
        }
    })

    onBeforeUnmount(() => {
        clearInterval(timeInterval)
        if (audio) audio.pause()
    })

    const showRecord = () => {
        recordModalVisible.value = true
        rollingBestLevel.value = 0
        rollingBestScore.value = 0
        animateNumber(rollingBestLevel, store.bestLevel || 0, 500)
        animateNumber(rollingBestScore, store.bestScore || 0, 600)
    }

    const confirmPause = () => { pauseGame() }

    const resumeGame = () => {
        pauseModalVisible.value = false
        startTimer()
    }

    const confirmExit = () => {
        if (confirm("退出游戏？")) {
            pauseModalVisible.value = false
            quizState.value = 'home'
        }
    }

    const confirmBack = () => {
        if (confirm("确定返回？进度会保留")) showPage("home")
    }

    const tipModalVisible = ref(false)
    const tipText = ref('')

    const useTip = () => {
        if (tipCount.value <= 0) return
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
    .page {
        display: block;
        animation: fadeIn 0.4s;
        min-height: 100vh;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
        padding: 18px 0 78px;
        background: radial-gradient(circle at top left, rgba(255,255,255,0.8), transparent 22%), linear-gradient(180deg, #bde9ff 0%, #dff6ff 20%, #f4fff1 58%, #fff8e7 100%);
        position: relative;
        overflow-x: hidden;
    }

        .page.active {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
        }

    .quiz-shell {
        width: min(1120px, calc(100% - 24px));
        margin: 0 auto;
        position: relative;
        z-index: 2;
    }

    .farm-skin {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }

    .sun {
        position: absolute;
        top: 18px;
        right: 50px;
        font-size: 66px;
        animation: floatSun 3s ease-in-out infinite;
        filter: drop-shadow(0 0 14px rgba(255, 193, 7, 0.5));
    }

    .rainbow {
        position: absolute;
        top: 24px;
        left: 40px;
        font-size: 78px;
        opacity: 0.92;
        animation: rainbowFloat 4s ease-in-out infinite;
    }

    .cloud {
        position: absolute;
        opacity: .9;
        filter: drop-shadow(0 4px 4px rgba(0,0,0,.08));
        animation: cloudMove linear infinite;
    }

        .cloud.c1 {
            top: 34px;
            left: -10%;
            font-size: 34px;
            animation-duration: 26s;
        }

        .cloud.c2 {
            top: 82px;
            left: -14%;
            font-size: 44px;
            animation-duration: 32s;
        }

        .cloud.c3 {
            top: 132px;
            left: -12%;
            font-size: 28px;
            animation-duration: 22s;
        }

    .bird {
        position: absolute;
        font-size: 24px;
        animation: cloudMove linear infinite;
    }

    .b1 {
        top: 120px;
        left: -10%;
        animation-duration: 18s;
    }

    .b2 {
        top: 180px;
        left: -15%;
        animation-duration: 24s;
    }

    .flower {
        position: absolute;
        bottom: 55px;
        font-size: 26px;
        animation: flowerSwing 2.2s ease-in-out infinite;
    }

    .f1 {
        left: 6%;
    }

    .f2 {
        left: 13%;
        animation-delay: .4s;
    }

    .f3 {
        right: 10%;
        animation-delay: .8s;
    }

    .star {
        position: absolute;
        font-size: 18px;
        animation: twinkle 1.8s infinite ease-in-out;
    }

    .s1 {
        top: 72px;
        left: 28%;
    }

    .s2 {
        top: 110px;
        left: 62%;
        animation-delay: .5s;
    }

    .s3 {
        top: 150px;
        left: 78%;
        animation-delay: 1s;
    }

    @keyframes cloudMove {
        from {
            transform: translateX(0);
        }

        to {
            transform: translateX(130vw);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(15px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes floatSun {
        0%,100% {
            transform: translateY(0) rotate(0deg);
        }

        50% {
            transform: translateY(-6px) rotate(8deg);
        }
    }

    @keyframes rainbowFloat {
        0%,100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-5px);
        }
    }

    @keyframes flowerSwing {
        0%,100% {
            transform: rotate(-2deg);
        }

        50% {
            transform: rotate(4deg);
        }
    }

    @keyframes twinkle {
        0%,100% {
            opacity: .35;
            transform: scale(0.85);
        }

        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }

    .quiz-home {
        text-align: center;
        animation: slideUp 0.6s ease;
    }

    @keyframes slideUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .home-hero {
        margin-top: 20px;
        padding: 24px 20px 8px;
    }

    .home-badge {
        display: inline-block;
        padding: 10px 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #fff176, #ffd54f);
        color: #6d4c41;
        font-weight: 900;
        box-shadow: 0 8px 20px rgba(255, 193, 7, 0.22);
        margin-bottom: 16px;
    }

    .farm-house {
        font-size: 72px;
        margin-bottom: 8px;
        animation: houseBounce 2.2s infinite ease-in-out;
    }

    @keyframes houseBounce {
        0%,100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-6px);
        }
    }

    .quiz-home h2 {
        font-size: clamp(34px, 3.8vw, 54px);
        margin: 10px 0 8px;
        color: #2e7d32;
        text-shadow: 0 3px 0 rgba(255,255,255,.6);
    }

    .home-desc {
        font-size: 18px;
        color: #5d6b54;
        margin-bottom: 16px;
    }

    .hero-tags {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 18px;
    }

        .hero-tags span {
            background: rgba(255,255,255,0.9);
            border: 2px solid #dcedc8;
            border-radius: 999px;
            padding: 8px 14px;
            font-weight: 700;
            color: #558b2f;
            box-shadow: 0 6px 14px rgba(76, 175, 80, 0.12);
        }

    .medal-section {
        margin-top: 12px;
        margin-bottom: 20px;
    }

    .home-actions {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 18px;
        row-gap: 14px;
        flex-wrap: wrap;
        padding-top: 18px;
        border-top: 1px dashed rgba(126, 170, 92, 0.35);
    }

    .section-title {
        font-size: 22px;
        font-weight: 900;
        color: #5d4037;
        margin-bottom: 16px;
    }

    .medal-grid {
        display: flex;
        justify-content: center;
        gap: 18px;
        margin: 20px 0;
        flex-wrap: wrap;
    }

    .medal {
        width: 84px;
        height: 84px;
        border-radius: 50%;
        background: linear-gradient(180deg, #f3f3f3, #e2e2e2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        filter: grayscale(1);
        opacity: 0.65;
        position: relative;
        transition: 0.3s;
        box-shadow: inset 0 6px 10px rgba(255,255,255,.8), 0 8px 16px rgba(0,0,0,.08);
    }

        .medal.unlocked {
            filter: grayscale(0);
            opacity: 1;
            background: linear-gradient(180deg, #fff59d, #ffd54f);
            animation: star 0.6s ease;
        }

        .medal.sparkle {
            box-shadow: 0 0 24px #ffd54f, 0 0 40px rgba(255, 213, 79, 0.4);
        }

    @keyframes star {
        0% {
            transform: scale(0.8);
            box-shadow: 0 0 0 gold;
        }

        50% {
            transform: scale(1.18);
            box-shadow: 0 0 20px gold;
        }

        100% {
            transform: scale(1);
        }
    }

    .medal:hover {
        transform: translateY(-4px) scale(1.08);
    }

    .medal .lock {
        position: absolute;
        bottom: -4px;
        right: -4px;
        background: #666;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .medal-tip {
        position: absolute;
        left: 50%;
        bottom: -78px;
        transform: translateX(-50%);
        min-width: 142px;
        background: #fffef6;
        border: 2px solid #ffe082;
        border-radius: 14px;
        padding: 8px;
        opacity: 0;
        pointer-events: none;
        transition: .2s;
        z-index: 5;
        box-shadow: 0 10px 18px rgba(255, 193, 7, 0.12);
    }

    .medal:hover .medal-tip {
        opacity: 1;
    }

    .medal-tip strong {
        display: block;
        font-size: 13px;
        color: #ef6c00;
    }

    .medal-tip small {
        color: #607d8b;
        font-size: 12px;
    }

    .home-actions {
        margin-top: 115px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 18px;
        row-gap: 16px;
        flex-wrap: wrap;
    }

    .music-btn {
        position: fixed;
        top: 82px;
        right: 20px;
        background: linear-gradient(135deg, #66bb6a, #43a047);
        color: white;
        border: none;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 99;
        box-shadow: 0 10px 18px rgba(67, 160, 71, 0.3);
        transition: .25s ease;
    }

        .music-btn:hover {
            transform: scale(1.08) rotate(6deg);
        }

    .music-icon {
        display: inline-block;
    }

    .quiz-btn {
        border: none;
        padding: 14px 34px;
        border-radius: 999px;
        font-size: 19px;
        cursor: pointer;
        transition: 0.3s;
        font-weight: 800;
        box-shadow: 0 8px 16px rgba(76,175,80,.22);
        animation: btnFloat 2.3s ease-in-out infinite;
    }

    .primary-btn {
        background: linear-gradient(135deg, #66bb6a, #43a047);
        color: white;
    }

    .quiz-btn:hover {
        transform: scale(1.08);
        filter: brightness(1.04);
    }

    .quiz-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
        animation: none;
    }

    .nav-btn {
        border: none;
        padding: 11px 20px;
        border-radius: 999px;
        color: #4e342e;
        font-weight: 800;
        font-size: 16px;
        cursor: pointer;
        transition: 0.3s;
        margin: 0 5px;
        box-shadow: 0 6px 14px rgba(0,0,0,.08);
    }

    .soft-yellow {
        background: linear-gradient(135deg, #fff59d, #ffd54f);
    }

    .soft-blue {
        background: linear-gradient(135deg, #b3e5fc, #81d4fa);
    }

    .soft-pink {
        background: linear-gradient(135deg, #f8bbd0, #f48fb1);
    }

    .nav-btn:hover {
        transform: translateY(-2px) scale(1.05);
    }

    @keyframes btnFloat {
        0%,100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-2px);
        }
    }

    .game-stage {
        animation: slideUp .5s ease;
    }

    .quiz-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        gap: 14px;
    }

    .header-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .level-badge {
        color: #fff;
        padding: 10px 24px;
        border-radius: 999px;
        box-shadow: 0 8px 18px rgba(0,0,0,.18);
        font-size: 22px;
    }

    .level-goal {
        background: rgba(255,255,255,0.9);
        padding: 8px 16px;
        border-radius: 999px;
        color: #558b2f;
        font-weight: 800;
        box-shadow: 0 6px 16px rgba(76,175,80,.12);
    }

    .grow-panel {
        background: rgba(255,255,255,0.8);
        border: 2px solid #dcedc8;
        border-radius: 22px;
        padding: 16px 18px;
        margin-bottom: 16px;
        box-shadow: 0 10px 20px rgba(76, 175, 80, 0.08);
    }

    .grow-title {
        text-align: center;
        font-size: 18px;
        font-weight: 900;
        color: #558b2f;
        margin-bottom: 12px;
    }

    .grow-bar {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }

    .grow-node {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        filter: grayscale(1);
        transition: 0.4s;
        box-shadow: inset 0 6px 8px rgba(255,255,255,.8), 0 6px 14px rgba(0,0,0,.08);
    }

        .grow-node.done {
            filter: grayscale(0);
            background: linear-gradient(135deg, #a5d6a7, #66bb6a);
        }

        .grow-node.current {
            filter: grayscale(0);
            background: linear-gradient(135deg, #ffcc80, #ffb74d);
            animation: pulse 1s infinite;
        }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 3px #fff3cd;
        }

        50% {
            box-shadow: 0 0 0 10px rgba(255, 183, 77, 0.35);
        }

        100% {
            box-shadow: 0 0 0 3px #fff3cd;
        }
    }

    .grow-line {
        width: 38px;
        height: 6px;
        background: #ddd;
        border-radius: 999px;
    }

        .grow-line.grow {
            animation: vineGrow .7s ease;
            background: linear-gradient(90deg, #a5d6a7, #43a047);
        }

    @keyframes vineGrow {
        from {
            transform: scaleX(0);
            transform-origin: left;
        }

        to {
            transform: scaleX(1);
            transform-origin: left;
        }
    }

    .status-panel {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-bottom: 18px;
    }

    .status-card {
        border-radius: 22px;
        padding: 16px 14px;
        text-align: center;
        color: #4e342e;
        font-weight: 800;
        box-shadow: 0 10px 20px rgba(0,0,0,.08);
    }

    .score-card {
        background: linear-gradient(135deg, #fff59d, #ffe082);
    }

    .correct-card {
        background: linear-gradient(135deg, #b9f6ca, #69f0ae);
    }

    .tip-card {
        background: linear-gradient(135deg, #b3e5fc, #81d4fa);
    }

    .status-label {
        font-size: 14px;
        opacity: .85;
    }

    .status-value {
        font-size: 28px;
        margin-top: 6px;
        color: #3e2723;
    }

        .status-value small {
            font-size: 15px;
            margin-left: 4px;
        }

    .score-area {
        margin: 8px 0 18px;
    }

    .score-text {
        text-align: center;
        margin: 5px 0;
        font-size: 18px;
        color: #5d4037;
        font-weight: 800;
    }

        .score-text span {
            color: #2e7d32;
            font-size: 24px;
        }

    .score-progress-box {
        width: min(720px, 88%);
        height: 18px;
        background: #f1f1f1;
        border-radius: 999px;
        margin: 10px auto;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 3px 8px rgba(0,0,0,.08);
    }

    .score-progress {
        height: 100%;
        width: 0%;
        transition: 0.5s ease;
        border-radius: 999px;
    }

    .score-progress-box.clear {
        box-shadow: 0 0 16px #ffd54f, inset 0 3px 8px rgba(0,0,0,.08);
    }

    .score-bubble {
        position: absolute;
        right: 16px;
        top: -24px;
        color: #ff9800;
        font-weight: 900;
        animation: flyUp .9s ease forwards;
    }

    .pass-toast {
        text-align: center;
        color: #2e7d32;
        font-weight: 900;
        animation: fadeIn .35s ease;
        margin-top: 10px;
    }

    @keyframes flyUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }

        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }

    .timer-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 18px;
    }

    .countdown-circle {
        width: 88px;
        height: 88px;
        position: relative;
        border-radius: 50%;
        box-shadow: 0 12px 20px rgba(76, 175, 80, 0.16);
    }

    .countdown-inner {
        position: absolute;
        inset: 9px;
        border-radius: 50%;
        background: white;
    }

    .countdown-text {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #2e7d32;
        font-weight: 900;
    }

    .count-number {
        font-size: 28px;
        line-height: 1;
    }

    .countdown-circle.warning {
        color: orange;
    }

    .countdown-circle.danger {
        color: red;
        animation: beat 0.5s infinite alternate;
    }

    .timer-tip {
        margin-top: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.9);
        color: #6d4c41;
        font-weight: 800;
    }

    @keyframes beat {
        from {
            transform: scale(1);
        }

        to {
            transform: scale(1.1);
        }
    }

    .question-card {
        background: radial-gradient(circle at top right, rgba(255, 241, 118, 0.18), transparent 20%), repeating-linear-gradient(0deg, #fff, #fff 22px, #f9fff4 22px, #f9fff4 24px);
        border-radius: 24px;
        padding: 26px;
        margin: 16px 0;
        border: 3px dashed #ffd54f;
        animation: cardPop .45s ease;
        box-shadow: 0 14px 28px rgba(104,159,56,.14);
    }

    @keyframes cardPop {
        from {
            opacity: 0;
            transform: translateY(10px) scale(.97);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .question-top-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
        flex-wrap: wrap;
    }

    .question-tag,
    .question-type-tag {
        padding: 8px 14px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 800;
    }

    .question-tag {
        background: linear-gradient(135deg, #fff59d, #ffd54f);
        color: #5d4037;
    }

    .question-type-tag {
        background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
        color: #33691e;
    }

    .quiz-title {
        font-size: 28px;
        margin-bottom: 18px;
        font-weight: 900;
        color: #444;
        text-align: center;
        line-height: 1.5;
    }

    .options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 22px;
    }

    .option {
        background: linear-gradient(180deg, #fff8cf, #ffe082);
        border-radius: 18px;
        padding: 22px 16px;
        font-size: 20px;
        cursor: pointer;
        transition: 0.28s;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border: 3px solid transparent;
        min-height: 120px;
        box-shadow: 0 8px 16px rgba(255, 193, 7, 0.14);
    }

        .option:hover {
            background: linear-gradient(180deg, #ffecb3, #ffca28);
            color: #5d4037;
            transform: translateY(-4px) scale(1.02);
        }

        .option.selected {
            background: linear-gradient(180deg, #81c784, #43a047);
            color: white;
            border: 3px solid #2e7d32;
            transform: scale(1.03);
            box-shadow: 0 10px 22px rgba(67, 160, 71, 0.28);
        }

    .option-icon {
        font-size: 34px;
        margin-bottom: 2px;
    }

    .option-text {
        font-weight: 900;
    }

    .option small {
        font-size: 12px;
        color: rgba(255,255,255,.92);
    }

    .fill-box {
        width: 100%;
        text-align: center;
    }

    .fill-input {
        width: min(520px, 90%);
        border-radius: 18px;
        border: 3px solid #ffd54f;
        padding: 14px 16px;
        font-size: 18px;
        outline: none;
        background: #fffef7;
        box-shadow: inset 0 3px 8px rgba(255, 213, 79, 0.12);
    }

        .fill-input:focus {
            border-color: #66bb6a;
            box-shadow: 0 0 0 5px rgba(102, 187, 106, 0.14);
        }

    .fill-helper {
        margin-top: 10px;
        color: #6d4c41;
        font-weight: 700;
    }

    .q-tip {
        color: #7a7a7a;
        margin-top: 10px;
        text-align: center;
        font-weight: 700;
    }

    .action-row {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }

    .tip-btn,
    .retry-btn {
        border: none;
        padding: 11px 18px;
        border-radius: 999px;
        margin-top: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 800;
        transition: .25s;
    }

    .tip-btn {
        background: linear-gradient(135deg, #ffcc80, #ffb74d);
        color: white;
        box-shadow: 0 8px 16px rgba(255, 183, 77, 0.22);
    }

    .retry-btn {
        background: linear-gradient(135deg, #81c784, #43a047);
        color: white;
        box-shadow: 0 8px 16px rgba(67, 160, 71, 0.22);
    }

        .tip-btn:hover,
        .retry-btn:hover {
            transform: translateY(-2px) scale(1.04);
        }

    .quiz-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.42);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .quiz-modal-box {
        background: white;
        padding: 30px;
        border-radius: 24px;
        width: 90%;
        max-width: 520px;
        text-align: center;
        box-shadow: 0 20px 36px rgba(0,0,0,0.16);
    }

    .cute-modal {
        background: radial-gradient(circle at top right, rgba(255, 241, 118, 0.18), transparent 25%), linear-gradient(180deg, #ffffff, #fffef8);
        border: 3px solid #ffe082;
    }

    .reward-modal-box {
        border: 3px solid #ffe082;
        background: linear-gradient(180deg, #fffef6, #fff8e1);
    }

    .reward-icon {
        font-size: 60px;
        margin-bottom: 8px;
        animation: star 0.6s ease;
    }

    .answer-feedback-box {
        max-width: 380px;
    }

    .answer-feedback-text {
        font-size: 22px;
        font-weight: 900;
        color: #4e342e;
    }

    .big-num {
        font-size: 28px;
        color: #2e7d32;
        font-weight: 900;
    }

    .preview-list {
        text-align: left;
        margin: 10px auto 14px;
        max-width: 360px;
        line-height: 1.9;
        color: #455a64;
    }

    .record-list {
        max-height: 220px;
        overflow-y: auto;
        margin: 8px 0 12px;
        text-align: left;
    }

    .record-item {
        background: #f8fff3;
        border: 2px dashed #c5e1a5;
        border-radius: 14px;
        padding: 10px;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .grass-strip {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        height: 46px;
        background: linear-gradient(180deg, #9ccc65, #689f38);
        color: #f1f8e9;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 20px;
        letter-spacing: 2px;
        z-index: 2;
        pointer-events: none;
    }

    @media (max-width: 900px) {
        .status-panel {
            grid-template-columns: 1fr;
        }

        .options {
            grid-template-columns: 1fr;
        }

        .quiz-title {
            font-size: 24px;
        }

        .quiz-header {
            flex-wrap: wrap;
            justify-content: center;
        }

        .home-actions {
            margin-top: 105px;
        }
    }

    @media (max-width: 640px) {
        .page {
            padding-top: 14px;
        }

        .sun {
            font-size: 52px;
            right: 18px;
        }

        .rainbow {
            font-size: 58px;
            left: 16px;
        }

        .farm-house {
            font-size: 58px;
        }

        .quiz-home h2 {
            font-size: 30px;
        }

        .quiz-btn,
        .nav-btn {
            width: 90%;
        }

        .grow-node {
            width: 48px;
            height: 48px;
            font-size: 22px;
        }

        .grow-line {
            width: 24px;
        }

        .countdown-circle {
            width: 78px;
            height: 78px;
        }

        .question-card {
            padding: 18px;
        }

        .quiz-title {
            font-size: 22px;
        }
    }
</style>