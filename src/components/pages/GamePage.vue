<template>
  <div class="game-page">
    <header class="game-hero">
      <div>
        <p class="section-kicker">多款小游戏</p>
        <h2>农耕小游戏总动员</h2>
        <p class="hero-copy">
          两款游戏可直接游玩，按你的规则实现计时、计分、道具、暂停、结算与分享提示。
        </p>
      </div>
      <div class="hero-stats">
        <article><strong>2</strong><span>可玩游戏</span></article>
        <article><strong>75s</strong><span>标准挑战</span></article>
        <article><strong>🏅</strong><span>勋章解锁</span></article>
      </div>
    </header>

    <section class="game-tabs" aria-label="游戏切换">
      <button
        v-for="g in gameTabs"
        :key="g.id"
        type="button"
        class="game-tab"
        :class="{ active: activeGame === g.id }"
        @click="activeGame = g.id"
      >
        <span>{{ g.icon }}</span>
        <strong>{{ g.name }}</strong>
      </button>
    </section>

    <section class="game-stage" aria-live="polite" ref="gameStageRef">
      <section v-if="activeGame === 'match'" class="game-card">
        <div class="match-hall">
          <aside class="match-side match-side--left">
            <p class="rail-section-title">甜蜜状态板</p>
            <div class="rail-console">
              <span class="game-chip"
                >{{ currentGameMeta.icon }} {{ currentGameMeta.name }}</span
              >
              <span class="state-chip" :class="currentGameState.tone">
                <i class="state-dot" aria-hidden="true"></i>
                {{ currentGameState.label }}
              </span>
            </div>

            <div class="match-mascot">
              <span class="mascot-emoji">🍬</span>
              <div>
                <p class="mascot-title">开心果果精灵</p>
                <p class="mascot-copy">把同类作物连起来，甜甜地拿高分！</p>
              </div>
            </div>

            <div class="match-chip-list">
              <span>得分 {{ match.score }}</span>
              <span>连击 {{ match.combo }}</span>
              <span>最高连击 {{ match.bestCombo }}</span>
              <span>正确率 {{ matchAccuracy }}%</span>
            </div>

            <div class="match-difficulty-picker">
              <p>难度等级</p>
              <div class="match-difficulty-buttons">
                <button
                  v-for="level in matchDifficultyOptions"
                  :key="level.id"
                  type="button"
                  class="ghost-btn"
                  :class="{ active: match.difficulty === level.id }"
                  :disabled="match.running || match.booting"
                  @click="setMatchDifficulty(level.id)"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <div class="meter-box">
              <p>糖果连击能量</p>
              <div class="meter-track combo candy">
                <span :style="{ width: `${matchComboProgress}%` }"></span>
              </div>
            </div>

            <p class="status-bar match-status">{{ match.statusText }}</p>
          </aside>

          <div class="play-stage match-stage">
            <header class="match-titlebar">
              <h3>游戏1：开心丰收连连看</h3>
              <div class="hud">
                <span>剩余：{{ match.time }}s</span>
                <span>进度：{{ match.answered }}/{{ matchPairsTotal }}</span>
                <span>提示：{{ match.hintsLeft }}</span>
                <span>棋盘：{{ matchBoardSizeLabel }}</span>
                <span>星级：{{ matchStars }}</span>
              </div>
            </header>

            <div class="mini-quiz-board match-board" ref="matchBoardRef">
              <div class="match-stickers" aria-hidden="true">
                <span>🍓</span>
                <span>🌈</span>
                <span>🍭</span>
              </div>

              <transition name="fade">
                <div v-if="match.jammerActive" class="match-jammer-mask">
                  <p>⚠️ 干扰牌来袭</p>
                  <span>{{ match.jammerText }}</span>
                </div>
              </transition>

              <transition-group
                name="burst"
                tag="div"
                class="match-burst-layer"
              >
                <span
                  v-for="burst in matchBursts"
                  :key="burst.id"
                  class="match-burst"
                  :style="{
                    left: `${burst.left}%`,
                    top: `${burst.top}%`,
                    '--burst-color': burst.color,
                  }"
                  >✨</span
                >
              </transition-group>

              <transition-group
                name="firework"
                tag="div"
                class="match-firework-layer"
              >
                <div
                  v-for="fw in matchFireworks"
                  :key="fw.id"
                  class="match-firework"
                  :style="{ left: `${fw.left}%`, top: `${fw.top}%` }"
                >
                  <span class="match-firework-core"></span>
                  <span
                    v-for="spark in fw.sparks"
                    :key="spark.id"
                    class="firework-spark"
                    :style="{
                      '--tx': `${spark.tx}px`,
                      '--ty': `${spark.ty}px`,
                      '--spark-color': spark.color,
                    }"
                  ></span>
                </div>
              </transition-group>

              <transition name="fade">
                <div v-if="match.booting" class="match-loading-mask">
                  <p class="match-loading-kicker">甜蜜准备中</p>
                  <h4>果果正在洗牌</h4>
                  <div class="loading-track candy">
                    <span :style="{ width: `${match.bootProgress}%` }"></span>
                  </div>
                  <p class="intro-loading-percent">{{ match.bootProgress }}%</p>
                </div>
              </transition>

              <div
                class="phase-banner start"
                v-if="!match.running && !match.ended && !match.booting"
              >
                点击“开始挑战”进入可爱连连看
              </div>
              <div class="phase-banner end" v-if="match.ended">挑战结束</div>

              <p class="match-board-tip">
                翻开两张相同作物卡即可消除，连续成功会叠加连击；⚠️干扰牌会触发遮罩或洗牌。
              </p>

              <div class="match-grid-shell">
                <transition-group
                  name="card"
                  tag="div"
                  class="match-grid candy-grid"
                  :style="{
                    gridTemplateColumns: `repeat(${matchGridCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${matchGridRows}, minmax(0, 1fr))`,
                    aspectRatio: `${matchGridCols} / ${matchGridRows}`,
                  }"
                >
                  <button
                    v-for="card in match.cards"
                    :key="card.id"
                    type="button"
                    class="match-card candy-card"
                    :class="{
                      open: card.open,
                      removed: card.removed,
                      hinted: card.hinted,
                      blocker: card.blocker,
                      used: card.used,
                    }"
                    :disabled="
                      !match.running ||
                      match.paused ||
                      match.ended ||
                      match.booting ||
                      match.jammerActive ||
                      card.removed ||
                      (card.blocker && card.used)
                    "
                    @click="flipMatchCard(card, $event)"
                  >
                    <span class="card-inner">
                      <span class="card-face card-front">🍬</span>
                      <span class="card-face card-back">
                        {{ card.blocker ? "⚠️" : fruitIcon(card.kind) }}
                      </span>
                    </span>
                  </button>
                </transition-group>
              </div>
            </div>
          </div>

          <aside class="match-side match-side--right">
            <p class="rail-section-title">操作台</p>
            <div class="controls match-controls">
              <button
                class="action-btn"
                type="button"
                @click="openGameIntro('match')"
              >
                开始挑战
              </button>
              <button
                class="ghost-btn"
                type="button"
                @click="togglePause('match')"
                :disabled="
                  !match.running ||
                  match.ended ||
                  match.booting ||
                  match.jammerActive
                "
              >
                {{ match.paused ? "继续" : "暂停" }}
              </button>
              <button class="ghost-btn" type="button" @click="restartMatchGame">
                重新开始
              </button>
              <button
                class="ghost-btn danger"
                type="button"
                @click="terminateMatchGame"
                :disabled="!match.running || match.booting || match.ended"
              >
                终止游戏
              </button>
              <button
                class="action-btn accent"
                type="button"
                :disabled="
                  match.hintsLeft <= 0 ||
                  !match.running ||
                  match.paused ||
                  match.booting ||
                  match.jammerActive
                "
                @click="useMatchHint"
              >
                使用提示（{{ match.hintsLeft }}）
              </button>
              <button class="ghost-btn" type="button" @click="toggleFullScreen">
                {{ isFullScreen ? "退出全屏" : "全屏游玩" }}
              </button>
            </div>

            <p class="hint-bar">
              图鉴：🌾水稻、🌿小麦、🌽玉米、🥕胡萝卜、🍅西红柿、🎃南瓜。
            </p>

            <div class="result-shell">
              <footer class="result" v-if="match.ended">
                <p>
                  结算：得分 {{ match.score }}，正确率
                  {{ matchAccuracy }}%，用时 {{ matchUsedTime }}s，星级
                  {{ matchStars }}。{{
                    match.clearedInTime
                      ? "开心通关，已获得丰收小勋章。"
                      : "未在时限内通关。"
                  }}
                </p>
                <button
                  class="ghost-btn"
                  type="button"
                  @click="shareResult('丰收连连看', match.score)"
                >
                  分享排行榜
                </button>
              </footer>
            </div>
          </aside>
        </div>
      </section>

      <section v-if="activeGame === 'puzzle'" class="game-card">
        <div class="arcade-layout">
          <aside class="info-rail">
            <p class="rail-section-title">控制台 Console</p>
            <div class="rail-console">
              <span class="game-chip"
                >{{ currentGameMeta.icon }} {{ currentGameMeta.name }}</span
              >
              <span class="state-chip" :class="currentGameState.tone">
                <i class="state-dot" aria-hidden="true"></i>
                {{ currentGameState.label }}
              </span>
            </div>
            <header class="game-head">
              <h3>游戏2：农耕小拼图（动手益智类）</h3>
              <div class="hud">
                <span>剩余：{{ puzzle.time }}s</span>
                <span>进度：{{ puzzle.answered }}/9</span>
                <span>提示：{{ puzzle.hintsLeft }}</span>
              </div>
            </header>

            <div class="controls">
              <button
                class="action-btn"
                type="button"
                @click="openGameIntro('puzzle')"
              >
                开始
              </button>
              <button
                class="ghost-btn"
                type="button"
                @click="togglePause('puzzle')"
                :disabled="!puzzle.running || puzzle.ended"
              >
                {{ puzzle.paused ? "继续" : "暂停" }}
              </button>
              <button
                class="ghost-btn"
                type="button"
                @click="restartPuzzleGame"
              >
                重新打乱
              </button>
              <button
                class="action-btn accent"
                type="button"
                :disabled="
                  puzzle.hintsLeft <= 0 || !puzzle.running || puzzle.paused
                "
                @click="usePuzzleHint"
              >
                提示3片位置
              </button>
              <button class="ghost-btn" type="button" @click="toggleFullScreen">
                {{ isFullScreen ? "退出全屏" : "全屏游玩" }}
              </button>
            </div>

            <p class="hint-bar">
              拖动碎片到正确位置，靠近正确位置会触发吸附判定并固定。
            </p>
            <p class="status-bar">{{ puzzle.statusText }}</p>
            <div class="result-shell">
              <footer class="result" v-if="puzzle.ended">
                <p>
                  结算：完成度 {{ puzzleProgress }}/9，用时
                  {{ 45 - puzzle.time }}s。{{
                    puzzle.completedInTime
                      ? "已获得拼图小勋章。"
                      : "超时未完成。"
                  }}
                </p>
                <button
                  class="ghost-btn"
                  type="button"
                  @click="shareResult('农耕小拼图', puzzle.score)"
                >
                  分享给家长
                </button>
              </footer>
            </div>
          </aside>

          <div class="play-stage">
            <div class="mini-quiz-board">
              <div
                class="phase-banner start"
                v-if="!puzzle.running && !puzzle.ended"
              >
                点击“开始”进入拼图逻辑题
              </div>
              <div class="phase-banner end" v-if="puzzle.ended">挑战结束</div>

              <div class="quiz-card" v-if="puzzle.currentQuestion">
                <p class="quiz-title">哪一个更适合这个场景？</p>
                <p class="quiz-label">{{ puzzle.currentQuestion.sceneName }}</p>
                <p class="quiz-timer">本题倒计时：{{ puzzle.questionLeft }}s</p>
              </div>

              <div class="quiz-options">
                <button
                  v-for="opt in puzzle.currentQuestion?.options || []"
                  :key="opt"
                  class="quiz-option"
                  type="button"
                  :disabled="!puzzle.running || puzzle.paused || puzzle.ended"
                  @click="answerPuzzleQuestion(opt)"
                >
                  <strong>{{ opt }}</strong>
                  <span>选择这个</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>

    <transition name="fade">
      <div v-if="pauseDialog.visible" class="pause-mask">
        <section class="pause-card">
          <h4>游戏已暂停</h4>
          <p>剩余时间：{{ pauseDialog.time }}s</p>
          <div class="controls">
            <button class="action-btn" type="button" @click="resumePausedGame">
              继续游戏
            </button>
            <button class="ghost-btn" type="button" @click="restartCurrentGame">
              重新开始
            </button>
          </div>
        </section>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="intro.visible" class="intro-mask">
        <section class="intro-card" v-if="!intro.loading">
          <p class="intro-kicker">游戏规则引导</p>
          <h4>{{ intro.title }}</h4>
          <p class="intro-step-title">第 {{ intro.stepIndex + 1 }} 步</p>
          <p class="intro-step-text">{{ currentIntroStep }}</p>

          <div class="intro-progress">
            <span
              :style="{
                width: `${((intro.stepIndex + 1) / intro.steps.length) * 100}%`,
              }"
            ></span>
          </div>

          <div class="controls">
            <button
              class="ghost-btn"
              type="button"
              :disabled="intro.stepIndex === 0"
              @click="prevIntroStep"
            >
              上一步
            </button>
            <button class="ghost-btn" type="button" @click="skipIntroForToday">
              今天不再提示
            </button>
            <button class="action-btn" type="button" @click="nextIntroStep">
              {{
                intro.stepIndex >= intro.steps.length - 1
                  ? "开始游戏"
                  : "下一步"
              }}
            </button>
          </div>
        </section>

        <section class="intro-card intro-card--loading" v-else>
          <p class="intro-kicker">准备开始</p>
          <h4>{{ intro.title }}</h4>
          <p class="intro-loading-text">正在搭建游戏场景，请稍候...</p>
          <div class="loading-track">
            <span :style="{ width: `${intro.loadingProgress}%` }"></span>
          </div>
          <p class="intro-loading-percent">{{ intro.loadingProgress }}%</p>
        </section>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="toast.visible" class="toast">{{ toast.text }}</div>
    </transition>

    <transition name="fade">
      <div
        v-if="scoreFlash.visible"
        class="score-flash"
        :class="scoreFlash.type"
      >
        {{ scoreFlash.text }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { showPage } from "../../store";

const gameTabs = [
  { id: "match", icon: "🍅", name: "丰收连连看" },
  { id: "puzzle", icon: "🧩", name: "农耕小拼图" },
];

const activeGame = ref("match");
const seedAreaRef = ref(null);
const gameStageRef = ref(null);
const isFullScreen = ref(false);
const toast = reactive({ visible: false, text: "" });
let toastTimer = null;
const scoreFlash = reactive({ visible: false, text: "", type: "plus" });
let scoreFlashTimer = null;
let introLoadingTimer = null;
const INTRO_SKIP_STORAGE_KEY = "farm-game-intro-skip-date";

const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shouldSkipIntroToday = () => {
  try {
    return localStorage.getItem(INTRO_SKIP_STORAGE_KEY) === getTodayDateKey();
  } catch {
    return false;
  }
};

const markSkipIntroToday = () => {
  try {
    localStorage.setItem(INTRO_SKIP_STORAGE_KEY, getTodayDateKey());
  } catch {
    // localStorage 不可用时静默降级
  }
};

const introRuleMap = {
  seed: {
    title: "播种小能手",
    steps: [
      "看题目里的作物，先判断它属于哪一类。",
      "点击下方大按钮作答，答对加分并叠连击。",
      "答错或超时会掉体力，体力归零游戏结束。",
      "关卡中有进度条和连击能量条，尽量连对拿高分。",
    ],
  },
  weed: {
    title: "除草大挑战",
    steps: [
      "看图判断目标是杂草还是禾苗。",
      "选择“拔掉它”或“先保留”。",
      "答对加分，答错和超时会扣分。",
      "连续答对会更快涨分，尽量保持专注。",
    ],
  },
  match: {
    title: "丰收连连看",
    steps: [
      "翻牌找同类作物：简单 2x2，普通 4x4，困难 5x5。",
      "连续配对会加连击分并触发爆裂与烟花效果。",
      "困难模式含⚠️干扰牌：可能触发短时遮罩或全盘重排。",
      "可使用提示；结算按得分计算 1-3 星评级。",
    ],
  },
  puzzle: {
    title: "农耕小拼图",
    steps: [
      "题面会给出场景名称和多个候选元素。",
      "从候选里选最匹配该场景的元素。",
      "答对得分，答错扣分，超时自动进入下一题。",
      "完成目标题数后结算，尽量冲击高分。",
    ],
  },
};

const intro = reactive({
  visible: false,
  loading: false,
  gameId: "seed",
  title: "",
  steps: [],
  stepIndex: 0,
  loadingProgress: 0,
});

const currentIntroStep = computed(() => {
  return intro.steps[intro.stepIndex] || "";
});

const pauseDialog = reactive({ visible: false, gameId: "", time: 0 });

const seed = reactive({
  running: false,
  paused: false,
  ended: false,
  time: 75,
  score: 0,
  correct: 0,
  total: 0,
  items: [],
  nextId: 1,
  spawnMs: 1200,
  statusText: "拖动种子到对应农田，正确 +10，错误 -5，杂草 -10。",
  selectedId: null,
  slowUnlocked: false,
  slowActive: false,
  slowUsed: false,
  slowLeft: 0,
  combo: 0,
  maxCombo: 0,
  frenzyActive: false,
  frenzyLeft: 0,
  goldenRainLeft: 0,
  freezeLeft: 0,
  chaosLeft: 0,
  fieldOrder: ["rice", "wheat", "corn"],
  hoverField: null,
  autoAssistUnlocked: false,
  currentQuestion: null,
  questionLeft: 0,
  lives: 3,
  answered: 0,
  target: 18,
});

const weed = reactive({
  running: false,
  paused: false,
  ended: false,
  time: 75,
  score: 0,
  items: [],
  nextId: 1,
  weedsRemoved: 0,
  cropMistakes: 0,
  clearToolUsed: false,
  statusText: "点击杂草得分，误拔禾苗会扣分。",
  currentQuestion: null,
  questionLeft: 0,
  answered: 0,
});

const match = reactive({
  running: false,
  paused: false,
  ended: false,
  difficulty: "normal",
  booting: false,
  bootProgress: 0,
  jammerActive: false,
  jammerText: "",
  time: 75,
  score: 0,
  correct: 0,
  combo: 0,
  bestCombo: 0,
  hintsLeft: 2,
  cards: [],
  picks: [],
  lock: false,
  statusText: "点击两张相同果实完成配对。",
  clearedInTime: false,
  currentQuestion: null,
  questionLeft: 0,
  answered: 0,
});

const puzzle = reactive({
  running: false,
  paused: false,
  ended: false,
  time: 45,
  score: 0,
  hintsLeft: 1,
  statusText: "把9片拼图拖到正确位置。",
  sceneIndex: 0,
  hintSlots: [],
  draggingPieceId: null,
  completedInTime: false,
  currentQuestion: null,
  questionLeft: 0,
  answered: 0,
});

const sproutEffects = ref([]);
const matchBoardRef = ref(null);
const matchBursts = ref([]);
const matchFireworks = ref([]);
let seedSpawnTimer = null;
let seedTickTimer = null;
let seedMoveTimer = null;
let weedSpawnTimer = null;
let weedTickTimer = null;
let matchTickTimer = null;
let matchBootTimer = null;
let matchJammerTimer = null;
let matchJammerMaskTimer = null;
let matchBurstSeed = 1;
let matchFireworkSeed = 1;
let matchBgmCtx = null;
let matchBgmTimer = null;
let matchBgmStep = 0;
let puzzleTickTimer = null;
let seedDragOffsetX = 0;
let seedDragOffsetY = 0;

const puzzleScenes = [
  {
    name: "农夫春耕",
    pieces: ["👨‍🌾", "🌾", "🚜", "🌱", "🐂", "☀️", "🧺", "🌿", "🏞️"],
  },
  {
    name: "田间丰收",
    pieces: ["🌽", "🍅", "🥕", "👩‍🌾", "🧑‍🌾", "🪣", "🌻", "🐓", "🏡"],
  },
  {
    name: "农具课堂",
    pieces: ["🪓", "🧰", "🪣", "🌾", "🌱", "🚜", "👒", "🐑", "🌤️"],
  },
];

const puzzlePieces = ref([]);

const seedBaseFields = {
  rice: { type: "rice", label: "水稻田", icon: "🌾" },
  wheat: { type: "wheat", label: "麦田", icon: "🌿" },
  corn: { type: "corn", label: "玉米田", icon: "🌽" },
  weed: { type: "weed", label: "杂草桶", icon: "🧺" },
};

const seedQuestionPool = [
  { emoji: "🌾", name: "水稻", answer: "rice", prompt: "把作物送回正确农田" },
  { emoji: "🌿", name: "小麦", answer: "wheat", prompt: "它属于哪块田？" },
  { emoji: "🌽", name: "玉米", answer: "corn", prompt: "帮它找到最合适的家" },
  { emoji: "🌵", name: "杂草", answer: "weed", prompt: "这个要放进哪里处理？" },
  {
    emoji: "🥕",
    name: "胡萝卜",
    answer: "corn",
    prompt: "看一看，选最匹配的田",
  },
  {
    emoji: "🍅",
    name: "西红柿",
    answer: "wheat",
    prompt: "选择正确区域继续闯关",
  },
  { emoji: "🥔", name: "土豆", answer: "corn", prompt: "快速判断它的归类" },
  { emoji: "🧄", name: "蒜头", answer: "wheat", prompt: "不要犹豫，马上点击" },
  { emoji: "🫘", name: "豆子", answer: "rice", prompt: "答对可叠加连击" },
  {
    emoji: "🌰",
    name: "坚果",
    answer: "weed",
    prompt: "这不是主作物，注意分类",
  },
];

const SEED_ITEM_SIZE = 46;
const SEED_ITEM_HALF = SEED_ITEM_SIZE / 2;

const seedAccuracy = computed(() => {
  if (!seed.total) return 0;
  return Math.round((seed.correct / seed.total) * 100);
});

const seedStageInfo = computed(() => {
  const elapsed = 75 - seed.time;
  if (elapsed < 25)
    return {
      key: "learn",
      label: "教学期",
      spawnMs: 1500,
      speed: 0.8,
      comboBonusMul: 1,
      specialChance: 0,
    };
  if (elapsed < 55)
    return {
      key: "challenge",
      label: "挑战期",
      spawnMs: 1150,
      speed: 0.95,
      comboBonusMul: 1,
      specialChance: 0.14,
    };
  return {
    key: "climax",
    label: "高潮期",
    spawnMs: 900,
    speed: 1.08,
    comboBonusMul: 1.5,
    specialChance: 0.2,
  };
});

const seedDisplayFields = computed(() => Object.values(seedBaseFields));

const seedTimeTone = computed(() => {
  if (seed.time <= 20) return "critical";
  if (seed.time <= 45) return "warning";
  return "safe";
});

const seedStarCount = computed(() => {
  if (seed.score >= 100) return 3;
  if (seed.score >= 80) return 2;
  if (seed.score >= 50) return 1;
  return 0;
});

const seedLifeIcons = computed(() => "❤️".repeat(seed.lives));

const seedRoundProgress = computed(() => {
  return Math.min(100, Math.round((seed.answered / seed.target) * 100));
});

const seedComboProgress = computed(() => {
  return Math.min(100, Math.round((seed.combo / 8) * 100));
});

const weedWeedCount = computed(
  () => weed.items.filter((item) => item.kind === "weed").length,
);

const puzzleProgress = computed(
  () => puzzlePieces.value.filter((piece) => piece.placedIndex !== null).length,
);

const puzzlePlacedMap = computed(() => {
  const map = {};
  puzzlePieces.value.forEach((piece) => {
    if (piece.placedIndex !== null) map[piece.placedIndex] = piece;
  });
  return map;
});

const currentGameMeta = computed(
  () => gameTabs.find((g) => g.id === activeGame.value) || gameTabs[0],
);

const matchAccuracy = computed(() => {
  if (!match.answered) return 0;
  return Math.round((match.correct / match.answered) * 100);
});

const matchComboProgress = computed(() => {
  return Math.min(100, Math.round((match.combo / 5) * 100));
});

const matchConfig = computed(
  () => matchDifficultyConfig[match.difficulty] || matchDifficultyConfig.normal,
);

const matchGridCols = computed(() => matchConfig.value.cols);

const matchPairsTotal = computed(() => matchConfig.value.pairCount);

const matchGridRows = computed(
  () =>
    matchConfig.value.rows ||
    Math.ceil((matchPairsTotal.value * 2) / matchGridCols.value),
);

const matchBoardSizeLabel = computed(
  () => `${matchGridCols.value}x${matchGridRows.value}`,
);

const matchStarCount = computed(() => {
  const [s1, s2, s3] = matchConfig.value.stars;
  if (match.score >= s3) return 3;
  if (match.score >= s2) return 2;
  if (match.score >= s1) return 1;
  return 0;
});

const matchStars = computed(
  () =>
    `${"★".repeat(matchStarCount.value)}${"☆".repeat(3 - matchStarCount.value)}`,
);

const matchUsedTime = computed(() => {
  const base = matchConfig.value.baseTime || 75;
  return Math.max(0, base - Math.max(0, match.time));
});

const currentStateRef = computed(() => {
  if (activeGame.value === "seed") return seed;
  if (activeGame.value === "weed") return weed;
  if (activeGame.value === "match") return match;
  return puzzle;
});

const currentGameState = computed(() => {
  const state = currentStateRef.value;
  if (state.ended) return { label: "已结束", tone: "ended" };
  if (state.paused) return { label: "已暂停", tone: "paused" };
  if (state.running) return { label: "进行中", tone: "running" };
  return { label: "待开始", tone: "idle" };
});

const showToast = (text) => {
  toast.text = text;
  toast.visible = true;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.visible = false;
  }, 1800);
};

const showScoreFlash = (delta, reason = "") => {
  scoreFlash.type = delta >= 0 ? "plus" : "minus";
  const mark = delta >= 0 ? `+${delta}` : `${delta}`;
  scoreFlash.text = reason ? `${mark} ${reason}` : mark;
  scoreFlash.visible = true;
  clearTimeout(scoreFlashTimer);
  scoreFlashTimer = window.setTimeout(() => {
    scoreFlash.visible = false;
  }, 900);
};

const launchGameById = (id) => {
  if (id === "seed") startSeedGame();
  if (id === "weed") startWeedGame();
  if (id === "match") startMatchGame();
  if (id === "puzzle") startPuzzleGame();
};

const closeGameIntro = () => {
  intro.visible = false;
  intro.loading = false;
  intro.loadingProgress = 0;
  clearInterval(introLoadingTimer);
  introLoadingTimer = null;
};

const skipIntroForToday = () => {
  markSkipIntroToday();
  const gameId = intro.gameId;
  closeGameIntro();
  launchGameById(gameId);
};

const openGameIntro = (gameId) => {
  if (shouldSkipIntroToday()) {
    launchGameById(gameId);
    return;
  }
  const rule = introRuleMap[gameId] || introRuleMap.seed;
  intro.visible = true;
  intro.loading = false;
  intro.gameId = gameId;
  intro.title = rule.title;
  intro.steps = rule.steps;
  intro.stepIndex = 0;
  intro.loadingProgress = 0;
};

const startIntroLoadingAndLaunch = () => {
  intro.loading = true;
  intro.loadingProgress = 0;
  clearInterval(introLoadingTimer);
  introLoadingTimer = window.setInterval(() => {
    intro.loadingProgress = Math.min(100, intro.loadingProgress + 8);
    if (intro.loadingProgress >= 100) {
      clearInterval(introLoadingTimer);
      introLoadingTimer = null;
      const gameId = intro.gameId;
      closeGameIntro();
      launchGameById(gameId);
    }
  }, 80);
};

const nextIntroStep = () => {
  if (intro.stepIndex >= intro.steps.length - 1) {
    startIntroLoadingAndLaunch();
    return;
  }
  intro.stepIndex += 1;
};

const prevIntroStep = () => {
  if (intro.stepIndex <= 0) return;
  intro.stepIndex -= 1;
};

const syncFullScreenState = () => {
  isFullScreen.value = Boolean(document.fullscreenElement);
};

const toggleFullScreen = async () => {
  try {
    if (!document.fullscreenElement) {
      if (gameStageRef.value?.requestFullscreen) {
        await gameStageRef.value.requestFullscreen();
      }
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    showToast("当前环境不支持全屏或被浏览器拦截。");
  }
};

const tone = (freq = 660, duration = 120) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.04;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration / 1000);
};

const seedTypeIcon = (type) => {
  if (type === "rice") return "🌾";
  if (type === "wheat") return "🌿";
  if (type === "corn") return "🌽";
  if (type === "gold") return "🌟";
  if (type === "freeze") return "❄️";
  if (type === "chaos") return "🌪️";
  return "🌵";
};

const fruitIcon = (type) => {
  const icons = {
    rice: "🌾",
    wheat: "🌿",
    corn: "🌽",
    carrot: "🥕",
    tomato: "🍅",
    pumpkin: "🎃",
  };
  return icons[type] || "🌱";
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const clearSeedTimers = () => {
  clearInterval(seedSpawnTimer);
  clearInterval(seedTickTimer);
  clearInterval(seedMoveTimer);
  seedSpawnTimer = null;
  seedTickTimer = null;
  seedMoveTimer = null;
};

const clearWeedTimers = () => {
  clearInterval(weedSpawnTimer);
  clearInterval(weedTickTimer);
  weedSpawnTimer = null;
  weedTickTimer = null;
};

const clearMatchTimers = () => {
  clearInterval(matchTickTimer);
  clearInterval(matchBootTimer);
  clearInterval(matchJammerTimer);
  clearTimeout(matchJammerMaskTimer);
  clearInterval(matchBgmTimer);
  matchTickTimer = null;
  matchBootTimer = null;
  matchJammerTimer = null;
  matchJammerMaskTimer = null;
  matchBgmTimer = null;
  if (matchBgmCtx?.state === "running") {
    matchBgmCtx.suspend();
  }
};

const playMatchBgmNote = (freq = 262, duration = 0.22) => {
  if (!matchBgmCtx) return;
  const now = matchBgmCtx.currentTime;
  const osc = matchBgmCtx.createOscillator();
  const gain = matchBgmCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.024, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(matchBgmCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
};

const startMatchBgm = async () => {
  if (matchBgmTimer || !match.running || match.paused || match.ended) return;
  if (!matchBgmCtx) {
    matchBgmCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (matchBgmCtx.state !== "running") {
    await matchBgmCtx.resume();
  }
  const melody = [262, 330, 392, 330, 294, 349, 440, 349];
  matchBgmTimer = window.setInterval(() => {
    if (!match.running || match.paused || match.ended) return;
    const freq = melody[matchBgmStep % melody.length];
    matchBgmStep += 1;
    playMatchBgmNote(freq, 0.2);
  }, 360);
};

const stopMatchBgm = () => {
  clearInterval(matchBgmTimer);
  matchBgmTimer = null;
  if (matchBgmCtx?.state === "running") {
    matchBgmCtx.suspend();
  }
};

const playMatchSuccessSfx = () => {
  tone(760, 80);
  window.setTimeout(() => tone(980, 110), 70);
};

const playMatchFailSfx = () => {
  tone(240, 110);
  window.setTimeout(() => tone(180, 120), 90);
};

const launchMatchBurst = (left = 50, top = 50, amount = 8) => {
  const colors = ["#ff9a62", "#ffd36f", "#ff7fb4", "#9ee06a", "#7dd7ff"];
  for (let i = 0; i < amount; i += 1) {
    const burst = {
      id: matchBurstSeed,
      left: Math.max(8, Math.min(92, left + randomBetween(-6, 6))),
      top: Math.max(10, Math.min(90, top + randomBetween(-6, 6))),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    matchBurstSeed += 1;
    matchBursts.value.push(burst);
    window.setTimeout(() => {
      matchBursts.value = matchBursts.value.filter(
        (item) => item.id !== burst.id,
      );
    }, 620);
  }
};

const launchMatchFirework = (left = 50, top = 50) => {
  const colors = ["#ffd86b", "#ff8f66", "#ff7fb4", "#8be0ff", "#9ee06a"];
  const sparks = Array.from({ length: 12 }, (_, idx) => {
    const angle = (Math.PI * 2 * idx) / 12;
    const distance = randomBetween(24, 54);
    return {
      id: `${matchFireworkSeed}-${idx}`,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
  const firework = { id: matchFireworkSeed, left, top, sparks };
  matchFireworkSeed += 1;
  matchFireworks.value.push(firework);
  window.setTimeout(() => {
    matchFireworks.value = matchFireworks.value.filter(
      (item) => item.id !== firework.id,
    );
  }, 760);
};

const triggerHardModeJammer = () => {
  if (match.difficulty !== "hard") return;
  if (
    !match.running ||
    match.paused ||
    match.ended ||
    match.booting ||
    match.lock
  )
    return;
  if (match.picks.length > 0) return;

  const activeIndexes = [];
  match.cards.forEach((card, idx) => {
    if (!card.removed && !card.open && !card.blocker) activeIndexes.push(idx);
  });
  if (activeIndexes.length < 4) return;

  if (Math.random() < 0.5) {
    match.jammerActive = true;
    match.jammerText = "迷雾遮罩 2 秒";
    match.statusText = "困难干扰：视线被短暂遮挡！";
    matchJammerMaskTimer = window.setTimeout(() => {
      match.jammerActive = false;
      match.jammerText = "";
    }, 2000);
    return;
  }

  const shuffledCards = shuffle(activeIndexes.map((idx) => match.cards[idx]));
  const nextCards = [...match.cards];
  activeIndexes.forEach((idx, pos) => {
    nextCards[idx] = shuffledCards[pos];
  });
  match.cards = nextCards;
  match.statusText = "困难干扰：卡牌位置被洗牌！";
  showToast("干扰牌触发：未翻开的卡牌被重排");
};

const clearPuzzleTimers = () => {
  clearInterval(puzzleTickTimer);
  puzzleTickTimer = null;
};

const calcSeedSpawnMs = () => {
  const base = seedStageInfo.value.spawnMs;
  let spawnMs = base;
  if (seed.frenzyActive) spawnMs *= 0.9;
  if (seed.slowActive || seed.freezeLeft > 0) spawnMs *= 1.75;
  return Math.max(520, Math.min(2600, Math.round(spawnMs)));
};

const refreshSeedSpawnTimer = () => {
  const nextMs = calcSeedSpawnMs();
  if (nextMs === seed.spawnMs && seedSpawnTimer) return;
  seed.spawnMs = nextMs;
  clearInterval(seedSpawnTimer);
  seedSpawnTimer = window.setInterval(spawnSeed, seed.spawnMs);
};

const applySeedMilestoneRewards = () => {
  if (seed.score >= 80) seed.slowUnlocked = true;
  if (seed.score >= 100) seed.autoAssistUnlocked = true;
};

const setSeedComboFail = () => {
  seed.combo = 0;
};

const startChaosEffect = (seconds = 2) => {
  seed.chaosLeft = Math.max(seed.chaosLeft, seconds);
  seed.fieldOrder = shuffle([...seed.fieldOrder]);
  showToast("混乱种子触发：农田位置已临时交换！");
};

const startFreezeEffect = (seconds = 3) => {
  seed.freezeLeft = Math.max(seed.freezeLeft, seconds);
  showToast("冰冻种子触发：全场减速 3 秒！");
};

const triggerGoldenRain = () => {
  seed.goldenRainLeft = 6;
  showToast("黄金种子雨！连续高分来袭。");
};

const grantComboBonus = () => {
  let bonus = 0;
  if (seed.combo >= 8) {
    bonus = 12;
    if (seed.goldenRainLeft <= 0) triggerGoldenRain();
  } else if (seed.combo >= 5) {
    bonus = 8;
    seed.frenzyActive = true;
    seed.frenzyLeft = Math.max(seed.frenzyLeft, 8);
  } else if (seed.combo >= 3) {
    bonus = 5;
  }
  bonus = Math.round(bonus * seedStageInfo.value.comboBonusMul);
  if (bonus > 0) {
    seed.score += bonus;
    showToast(`连击 ${seed.combo}！额外 +${bonus} 分`);
  }
};

const resetSeedState = () => {
  clearSeedTimers();
  seed.running = false;
  seed.paused = false;
  seed.ended = false;
  seed.time = 75;
  seed.score = 0;
  seed.correct = 0;
  seed.total = 0;
  seed.items = [];
  seed.nextId = 1;
  seed.spawnMs = 1500;
  seed.statusText = "连击越高奖励越高：正确播种叠连击，点击杂草也能加分。";
  seed.selectedId = null;
  seed.slowUnlocked = false;
  seed.slowActive = false;
  seed.slowUsed = false;
  seed.slowLeft = 0;
  seed.combo = 0;
  seed.maxCombo = 0;
  seed.frenzyActive = false;
  seed.frenzyLeft = 0;
  seed.goldenRainLeft = 0;
  seed.freezeLeft = 0;
  seed.chaosLeft = 0;
  seed.fieldOrder = ["rice", "wheat", "corn"];
  seed.hoverField = null;
  seed.autoAssistUnlocked = false;
  seed.currentQuestion = null;
  seed.questionLeft = 0;
  seed.lives = 3;
  seed.answered = 0;
  seed.target = 18;
  sproutEffects.value = [];
};

const nextSeedQuestion = () => {
  const q =
    seedQuestionPool[Math.floor(Math.random() * seedQuestionPool.length)];
  seed.currentQuestion = q;
  if (seedStageInfo.value.key === "learn") seed.questionLeft = 5;
  else if (seedStageInfo.value.key === "challenge") seed.questionLeft = 4;
  else seed.questionLeft = 3;
};

const buildSeedItem = (type, cropType) => {
  const width = seedAreaRef.value?.clientWidth || 680;
  const speed = seedStageInfo.value.speed;
  return {
    id: seed.nextId++,
    type,
    cropType,
    x: randomBetween(12, Math.max(24, width - (SEED_ITEM_SIZE + 8))),
    y: -SEED_ITEM_HALF,
    vx: randomBetween(-0.2, 0.2),
    vy: randomBetween(0.62, 0.98) * speed,
    dragging: false,
  };
};

const chooseSpecialSeed = () => {
  const cropPool = ["rice", "wheat", "corn"];
  const cropType = cropPool[Math.floor(Math.random() * cropPool.length)];
  const roll = Math.random();
  if (roll < 0.05) return buildSeedItem("gold", cropType);
  if (roll < 0.09) return buildSeedItem("freeze", cropType);
  return buildSeedItem("chaos", cropType);
};

const spawnSeed = () => {
  if (!seed.running || seed.paused || seed.ended) return;
  if (seed.goldenRainLeft > 0) {
    const crops = ["rice", "wheat", "corn"];
    const cropType = crops[Math.floor(Math.random() * crops.length)];
    seed.items.push(buildSeedItem("gold", cropType));
    seed.goldenRainLeft -= 1;
    return;
  }

  const canSpecial = Math.random() < seedStageInfo.value.specialChance;
  if (canSpecial) {
    seed.items.push(chooseSpecialSeed());
    return;
  }

  const normalPool = ["rice", "wheat", "corn", "rice", "wheat", "corn", "weed"];
  const picked = normalPool[Math.floor(Math.random() * normalPool.length)];
  const cropType = picked === "weed" ? null : picked;
  seed.items.push(buildSeedItem(picked, cropType));
};

const moveSeeds = () => {
  if (!seed.running || seed.paused || seed.ended) return;
  const height = seedAreaRef.value?.clientHeight || 320;
  const freezeMul = seed.freezeLeft > 0 || seed.slowActive ? 0.58 : 1;
  const frenzyMul = seed.frenzyActive ? 1.16 : 1;
  const paceMul = seedStageInfo.value.speed * freezeMul * frenzyMul;
  seed.items.forEach((item) => {
    if (item.dragging) return;
    item.x += item.vx * paceMul;
    item.y += item.vy * paceMul;
    item.vy += 0.01 * paceMul;
  });
  seed.items = seed.items.filter((item) => {
    if (item.y < height - 10) return true;
    if (item.type === "weed") {
      seed.score -= 6;
      seed.statusText = "杂草落地扣分！可点击杂草主动拔除。";
      setSeedComboFail();
      tone(210, 120);
      return false;
    }
    seed.score -= 3;
    setSeedComboFail();
    return false;
  });
  applySeedMilestoneRewards();
};

const endSeedGame = () => {
  seed.running = false;
  seed.ended = true;
  clearSeedTimers();
  seed.items = [];
  seed.fieldOrder = ["rice", "wheat", "corn"];
  seed.hoverField = null;
  if (seed.lives <= 0) {
    seed.statusText = "体力用完啦，休息一下再挑战。";
  } else if (seed.score >= 50) {
    seed.statusText = `闯关完成！最高连击 ${seed.maxCombo}。`;
  } else {
    seed.statusText = "播种结束，再练习一次冲击勋章吧。";
  }
};

const startSeedGame = () => {
  resetSeedState();
  seed.running = true;
  nextSeedQuestion();
  seedTickTimer = window.setInterval(() => {
    if (!seed.running || seed.paused) return;
    seed.time -= 1;
    seed.questionLeft -= 1;

    if (seed.questionLeft <= 0 && seed.currentQuestion) {
      seed.score -= 3;
      seed.answered += 1;
      seed.lives = Math.max(0, seed.lives - 1);
      setSeedComboFail();
      showScoreFlash(-3, "超时");
      seed.statusText = "慢一点也没关系，继续来一题。";
      if (seed.lives <= 0 || seed.answered >= seed.target) {
        endSeedGame();
        return;
      }
      nextSeedQuestion();
    }

    if (seed.frenzyActive) {
      seed.frenzyLeft -= 1;
      if (seed.frenzyLeft <= 0) {
        seed.frenzyActive = false;
      }
    }

    if (seed.freezeLeft > 0) {
      seed.freezeLeft -= 1;
    }

    if (seed.chaosLeft > 0) {
      seed.chaosLeft -= 1;
      if (seed.chaosLeft <= 0) seed.fieldOrder = ["rice", "wheat", "corn"];
    }

    if (seed.slowActive) {
      seed.slowLeft -= 1;
      if (seed.slowLeft <= 0) {
        seed.slowActive = false;
      }
    }

    if (seed.time <= 0) endSeedGame();
  }, 1000);
};

const restartSeedGame = () => {
  startSeedGame();
};

const answerSeedQuestion = (fieldType) => {
  if (!seed.running || seed.paused || seed.ended || !seed.currentQuestion)
    return;
  seed.total += 1;
  seed.answered += 1;

  if (seed.currentQuestion.answer === fieldType) {
    seed.correct += 1;
    seed.combo += 1;
    seed.maxCombo = Math.max(seed.maxCombo, seed.combo);
    let gain = 10;
    if (seed.combo >= 3) gain += 5;
    seed.score += gain;
    showScoreFlash(gain, "答对");
    seed.statusText = seed.combo >= 3 ? `真棒！连击 ${seed.combo}` : "答对啦！";
    tone(860 + Math.min(seed.combo, 6) * 20, 110);
  } else {
    seed.score -= 5;
    seed.lives = Math.max(0, seed.lives - 1);
    showScoreFlash(-5, "答错");
    setSeedComboFail();
    seed.statusText = "再试试，你一定可以！";
    tone(280, 110);
  }

  applySeedMilestoneRewards();
  if (seed.lives <= 0 || seed.answered >= seed.target) {
    endSeedGame();
    return;
  }
  nextSeedQuestion();
};

const pushSprout = (field) => {
  const id = `${field}-${Date.now()}-${Math.random()}`;
  sproutEffects.value.push({ id, field });
  window.setTimeout(() => {
    sproutEffects.value = sproutEffects.value.filter((s) => s.id !== id);
  }, 680);
};

const settleSeedDrop = (item, fieldType) => {
  seed.total += 1;

  if (item.type === "weed") {
    seed.score -= 10;
    seed.statusText = "错啦，这是杂草，点击它可额外得分。";
    setSeedComboFail();
    tone(220, 180);
    return;
  }

  const expected = item.cropType || item.type;
  if (expected === fieldType) {
    seed.correct += 1;
    seed.combo += 1;
    seed.maxCombo = Math.max(seed.maxCombo, seed.combo);

    let gain = 10;
    if (item.type === "gold") gain = 20;
    if (item.type === "freeze") gain = 12;
    if (item.type === "chaos") gain = 15;

    seed.score += gain;

    if (item.type === "freeze") startFreezeEffect(3);
    if (item.type === "chaos") startChaosEffect(2);

    grantComboBonus();

    seed.statusText =
      seed.combo >= 3
        ? `连击 ${seed.combo}！播种成功，节奏加速！`
        : "播种成功！幼苗长出来啦。";
    pushSprout(fieldType);
    tone(860 + Math.min(seed.combo, 8) * 20, 120);
  } else {
    seed.score -= 5;
    setSeedComboFail();
    seed.statusText = "种错啦，再试一试！";
    tone(300, 130);
  }

  applySeedMilestoneRewards();
};

const onSeedItemClick = (item, event) => {
  if (!seed.running || seed.paused || seed.ended) return;
  if (item.type !== "weed") return;
  event.stopPropagation();
  seed.items = seed.items.filter((x) => x.id !== item.id);
  seed.score += 5;
  seed.statusText = "杂草已拔除，主动处理 +5 分！";
  tone(700, 110);
  applySeedMilestoneRewards();
};

const onSeedPointerDown = (item, event) => {
  if (!seed.running || seed.paused || seed.ended) return;
  if (item.type === "weed") return;
  const rect = seedAreaRef.value?.getBoundingClientRect();
  if (!rect) return;
  item.dragging = true;
  seed.selectedId = item.id;
  seedDragOffsetX = event.clientX - rect.left - item.x;
  seedDragOffsetY = event.clientY - rect.top - item.y;
};

const onSeedPointerMove = (event) => {
  if (!seed.selectedId) return;
  const rect = seedAreaRef.value?.getBoundingClientRect();
  if (!rect) return;
  const item = seed.items.find((x) => x.id === seed.selectedId);
  if (!item) return;
  item.x = event.clientX - rect.left - seedDragOffsetX;
  item.y = event.clientY - rect.top - seedDragOffsetY;

  const hover = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest("[data-field]")
    ?.getAttribute("data-field");
  seed.hoverField = hover || null;

  if (seed.autoAssistUnlocked && item.cropType) {
    const fields = [...document.querySelectorAll("[data-field]")];
    const near = fields
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(cx - event.clientX, cy - event.clientY);
        return { type: el.getAttribute("data-field"), cx, cy, dist };
      })
      .find((f) => f.type === item.cropType && f.dist <= 92);
    if (near) {
      item.x = near.cx - rect.left - SEED_ITEM_HALF;
      item.y = near.cy - rect.top - SEED_ITEM_HALF;
      seed.hoverField = near.type;
    }
  }
};

const findNearestFieldType = (clientX, clientY, maxDist = 120) => {
  const fields = [...document.querySelectorAll("[data-field]")];
  const nearest = fields
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(cx - clientX, cy - clientY);
      return { type: el.getAttribute("data-field"), dist };
    })
    .sort((a, b) => a.dist - b.dist)[0];
  if (!nearest || nearest.dist > maxDist) return null;
  return nearest.type;
};

const onSeedPointerUp = (event) => {
  if (!seed.selectedId) return;
  const item = seed.items.find((x) => x.id === seed.selectedId);
  if (!item) {
    seed.selectedId = null;
    return;
  }
  item.dragging = false;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const field = target?.closest("[data-field]");
  const fieldType =
    field?.getAttribute("data-field") ||
    findNearestFieldType(event.clientX, event.clientY);
  if (fieldType) {
    settleSeedDrop(item, fieldType);
    seed.items = seed.items.filter((x) => x.id !== item.id);
  }
  seed.selectedId = null;
  seed.hoverField = null;
};

const useSlowTool = () => {
  if (!seed.slowUnlocked || seed.slowActive || seed.slowUsed || !seed.running)
    return;
  seed.slowActive = true;
  seed.slowUsed = true;
  seed.slowLeft = 10;
  refreshSeedSpawnTimer();
  seed.items.forEach((item) => {
    item.vy *= 0.55;
  });
  showToast("快速播种道具已启动，10秒内掉落速度变慢。");
};

const resetWeedState = () => {
  clearWeedTimers();
  weed.running = false;
  weed.paused = false;
  weed.ended = false;
  weed.time = 75;
  weed.score = 0;
  weed.items = [];
  weed.nextId = 1;
  weed.weedsRemoved = 0;
  weed.cropMistakes = 0;
  weed.clearToolUsed = false;
  weed.statusText = "看图判断：该拔掉还是保留？";
  weed.currentQuestion = null;
  weed.questionLeft = 0;
  weed.answered = 0;
};

const nextWeedQuestion = () => {
  const kind = Math.random() < 0.55 ? "weed" : "crop";
  weed.currentQuestion = {
    kind,
    emoji: kind === "weed" ? "🌵" : "🌾",
    name: kind === "weed" ? "杂草" : "禾苗",
    answer: kind === "weed" ? "pull" : "keep",
  };
  weed.questionLeft = 4;
};

const seedWeedItems = () => {
  weed.items = [];
  for (let plot = 1; plot <= 3; plot += 1) {
    for (let i = 0; i < 8; i += 1) {
      weed.items.push({
        id: weed.nextId++,
        plot,
        kind: Math.random() < 0.48 ? "weed" : "crop",
        anim: "",
      });
    }
  }
};

const spawnWeed = () => {
  if (!weed.running || weed.paused || weed.ended) return;
  weed.items.push({
    id: weed.nextId++,
    plot: Math.floor(Math.random() * 3) + 1,
    kind: "weed",
    anim: "sprout",
  });
  window.setTimeout(() => {
    const w = weed.items.find((x) => x.id === weed.nextId - 1);
    if (w) w.anim = "";
  }, 280);
};

const endWeedGame = () => {
  weed.running = false;
  weed.ended = true;
  clearWeedTimers();
  if (weed.score >= 50) weed.statusText = "挑战完成，判断很准确！";
  else weed.statusText = "挑战结束，再试一次冲击勋章。";
};

const startWeedGame = () => {
  resetWeedState();
  weed.running = true;
  nextWeedQuestion();
  weedTickTimer = window.setInterval(() => {
    if (!weed.running || weed.paused) return;
    weed.time -= 1;
    weed.questionLeft -= 1;
    if (weed.questionLeft <= 0 && weed.currentQuestion) {
      weed.score -= 3;
      showScoreFlash(-3, "超时");
      weed.statusText = "超时啦，下一题继续！";
      weed.cropMistakes += 1;
      weed.answered += 1;
      nextWeedQuestion();
    }
    if (weed.time <= 0) endWeedGame();
  }, 1000);
};

const restartWeedGame = () => startWeedGame();

const answerWeedQuestion = (action) => {
  if (!weed.running || weed.paused || weed.ended || !weed.currentQuestion)
    return;
  weed.answered += 1;
  if (weed.currentQuestion.answer === action) {
    weed.score += 10;
    weed.weedsRemoved += 1;
    weed.statusText = "判断正确，真棒！";
    showScoreFlash(10, "答对");
    tone(860, 100);
  } else {
    weed.score -= 5;
    weed.cropMistakes += 1;
    weed.statusText = "这题错了，再试试。";
    showScoreFlash(-5, "答错");
    tone(260, 110);
  }
  nextWeedQuestion();
};

const skipWeedQuestion = () => {
  if (!weed.running || weed.paused || weed.ended) return;
  weed.statusText = "已切换到下一题。";
  nextWeedQuestion();
};

const hitWeedItem = (item) => {
  if (!weed.running || weed.paused || weed.ended) return;
  if (item.kind === "weed") {
    item.anim = "shake";
    window.setTimeout(() => {
      weed.items = weed.items.filter((x) => x.id !== item.id);
    }, 180);
    weed.score += 10;
    showScoreFlash(10, "除草");
    weed.weedsRemoved += 1;
    weed.statusText = "除草成功！禾苗笑起来啦。";
    tone(860, 120);
  } else {
    item.anim = "sad";
    window.setTimeout(() => {
      item.anim = "";
    }, 360);
    weed.score -= 5;
    showScoreFlash(-5, "误拔");
    weed.cropMistakes += 1;
    weed.statusText = "错啦，这是禾苗哦！";
    tone(260, 140);
  }
};

const clearAllWeeds = () => {
  if (weed.clearToolUsed || !weed.running || weed.paused) return;
  const count = weed.items.filter((i) => i.kind === "weed").length;
  weed.items = weed.items.filter((i) => i.kind !== "weed");
  weed.score += count * 10;
  showScoreFlash(count * 10, "清草");
  weed.weedsRemoved += count;
  weed.clearToolUsed = true;
  weed.statusText = "道具已生效，杂草已清除。";
  tone(920, 140);
};

const matchKinds = ["rice", "wheat", "corn", "carrot", "tomato", "pumpkin"];

const matchDifficultyConfig = {
  easy: {
    label: "简单",
    pairCount: 2,
    cols: 2,
    rows: 2,
    baseTime: 35,
    hints: 3,
    extraCells: 0,
    stars: [30, 45, 60],
  },
  normal: {
    label: "普通",
    pairCount: 8,
    cols: 4,
    rows: 4,
    baseTime: 75,
    hints: 2,
    extraCells: 0,
    stars: [160, 230, 310],
  },
  hard: {
    label: "困难",
    pairCount: 12,
    cols: 5,
    rows: 5,
    baseTime: 95,
    hints: 1,
    extraCells: 1,
    stars: [240, 340, 450],
  },
};

const matchDifficultyOptions = [
  { id: "easy", label: "简单 2x2" },
  { id: "normal", label: "普通 4x4" },
  { id: "hard", label: "困难 5x5" },
];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const resetMatchState = () => {
  clearMatchTimers();
  match.running = false;
  match.paused = false;
  match.ended = false;
  match.booting = false;
  match.bootProgress = 0;
  match.jammerActive = false;
  match.jammerText = "";
  matchFireworks.value = [];
  matchBursts.value = [];
  const config =
    matchDifficultyConfig[match.difficulty] || matchDifficultyConfig.normal;
  match.time = config.baseTime;
  match.score = 0;
  match.correct = 0;
  match.combo = 0;
  match.bestCombo = 0;
  match.hintsLeft = config.hints;
  match.cards = [];
  match.picks = [];
  match.lock = false;
  match.statusText = "翻牌找相同作物，连击越高分越高。";
  match.clearedInTime = false;
  match.currentQuestion = null;
  match.questionLeft = 0;
  match.answered = 0;
};

const startMatchRoundTick = () => {
  match.running = true;
  setupMatchCards();
  startMatchBgm();
  matchTickTimer = window.setInterval(() => {
    if (!match.running || match.paused) return;
    match.time -= 1;
    if (match.time <= 0) endMatchGame(false);
  }, 1000);

  if (match.difficulty === "hard") {
    matchJammerTimer = window.setInterval(() => {
      triggerHardModeJammer();
    }, 11000);
  }
};

const nextMatchQuestion = () => {
  const same = Math.random() < 0.5;
  const leftKind = matchKinds[Math.floor(Math.random() * matchKinds.length)];
  const rightKind = same
    ? leftKind
    : matchKinds.filter((k) => k !== leftKind)[
        Math.floor(Math.random() * (matchKinds.length - 1))
      ];
  match.currentQuestion = {
    leftKind,
    rightKind,
    leftEmoji: fruitIcon(leftKind),
    rightEmoji: fruitIcon(rightKind),
    same,
  };
  match.questionLeft = 4;
};

const setupMatchCards = () => {
  const config =
    matchDifficultyConfig[match.difficulty] || matchDifficultyConfig.normal;
  const sourceKinds = shuffle([...matchKinds]);
  const selectedKinds = [];
  while (selectedKinds.length < config.pairCount) {
    const candidate = sourceKinds[selectedKinds.length % sourceKinds.length];
    selectedKinds.push(candidate);
  }
  const deck = shuffle(selectedKinds.flatMap((k) => [k, k])).map(
    (kind, idx) => ({
      id: `m-${idx}-${kind}`,
      kind,
      open: false,
      removed: false,
      hinted: false,
      blocker: false,
      used: false,
    }),
  );

  if (config.extraCells) {
    for (let i = 0; i < config.extraCells; i += 1) {
      deck.push({
        id: `m-blocker-${i}`,
        kind: "jammer",
        open: false,
        removed: false,
        hinted: false,
        blocker: true,
        used: false,
      });
    }
  }

  match.cards = shuffle(deck);
};

const endMatchGame = (cleared) => {
  match.running = false;
  match.ended = true;
  match.booting = false;
  stopMatchBgm();
  clearMatchTimers();
  match.clearedInTime = cleared && match.time >= 0;
  if (cleared) {
    const bonus = Math.floor(match.time / 10) * 10;
    match.score += bonus;
    match.statusText = `匹配成功，提前通关奖励 +${bonus} 分！`;
    launchMatchFirework(50, 26);
    tone(920, 140);
  } else {
    match.statusText = "时间到，未完成全部匹配。";
  }
};

const terminateMatchGame = () => {
  if (!match.running || match.ended || match.booting) return;
  endMatchGame(false);
  match.statusText = "你已终止本局游戏。";
};

const startMatchGame = () => {
  resetMatchState();
  match.booting = true;
  match.bootProgress = 0;
  match.statusText = "糖果精灵正在整理果篮...";
  matchBootTimer = window.setInterval(() => {
    match.bootProgress = Math.min(100, match.bootProgress + 10);
    if (match.bootProgress >= 100) {
      clearInterval(matchBootTimer);
      matchBootTimer = null;
      match.booting = false;
      startMatchRoundTick();
    }
  }, 70);
};

const restartMatchGame = () => startMatchGame();

const setMatchDifficulty = (level) => {
  if (!matchDifficultyConfig[level] || match.running || match.booting) return;
  match.difficulty = level;
  resetMatchState();
  setupMatchCards();
  const label = matchDifficultyConfig[level].label;
  showToast(`已切换到${label}，棋盘 ${matchBoardSizeLabel.value}`);
};

const flipMatchCard = (card, event) => {
  if (
    !match.running ||
    match.paused ||
    match.ended ||
    match.booting ||
    match.jammerActive ||
    match.lock
  )
    return;
  if (card.removed || card.open) return;

  if (card.blocker) {
    card.used = true;
    card.open = true;
    triggerHardModeJammer();
    match.statusText = "你触发了干扰牌！";
    playMatchFailSfx();
    showScoreFlash(-8, "干扰牌");
    match.score -= 8;
    return;
  }

  if (event?.currentTarget && matchBoardRef.value) {
    const cardRect = event.currentTarget.getBoundingClientRect();
    const boardRect = matchBoardRef.value.getBoundingClientRect();
    card.hitLeft =
      ((cardRect.left + cardRect.width / 2 - boardRect.left) /
        boardRect.width) *
      100;
    card.hitTop =
      ((cardRect.top + cardRect.height / 2 - boardRect.top) /
        boardRect.height) *
      100;
  }

  card.open = true;
  match.picks.push(card);
  tone(700, 70);
  if (match.picks.length < 2) return;
  const [a, b] = match.picks;
  match.lock = true;
  if (a.kind === b.kind) {
    window.setTimeout(() => {
      a.removed = true;
      b.removed = true;
      match.answered += 1;
      match.correct += 1;
      match.combo += 1;
      match.bestCombo = Math.max(match.bestCombo, match.combo);
      const gain = 14 + Math.min(12, match.combo * 2);
      match.score += gain;
      showScoreFlash(gain, "配对");
      match.statusText = `连击 ${match.combo}！继续翻牌！`;
      playMatchSuccessSfx();
      if (match.combo >= 2) {
        const cx = ((a.hitLeft || 50) + (b.hitLeft || 50)) / 2;
        const cy = ((a.hitTop || 50) + (b.hitTop || 50)) / 2;
        launchMatchBurst(cx, cy, Math.min(14, 6 + match.combo));
      }
      const fx = ((a.hitLeft || 50) + (b.hitLeft || 50)) / 2;
      const fy = ((a.hitTop || 50) + (b.hitTop || 50)) / 2;
      launchMatchFirework(fx, fy);
      match.picks = [];
      match.lock = false;
      if (match.cards.filter((c) => !c.blocker).every((c) => c.removed)) {
        endMatchGame(true);
      }
    }, 220);
  } else {
    playMatchFailSfx();
    match.combo = 0;
    match.statusText = "不匹配，连击中断。";
    window.setTimeout(() => {
      a.open = false;
      b.open = false;
      match.picks = [];
      match.lock = false;
    }, 500);
  }
};

const useMatchHint = () => {
  if (
    !match.running ||
    match.paused ||
    match.ended ||
    match.booting ||
    match.jammerActive ||
    match.hintsLeft <= 0
  )
    return;
  const remaining = match.cards.filter(
    (card) => !card.removed && !card.open && !card.blocker,
  );
  if (remaining.length < 2) return;
  const grouped = {};
  for (const card of remaining) {
    if (!grouped[card.kind]) grouped[card.kind] = [];
    grouped[card.kind].push(card);
  }
  const pair = Object.values(grouped).find((cards) => cards.length >= 2);
  if (!pair) return;
  match.hintsLeft -= 1;
  pair[0].hinted = true;
  pair[1].hinted = true;
  window.setTimeout(() => {
    pair[0].hinted = false;
    pair[1].hinted = false;
  }, 1200);
  showToast("提示：高亮了可配对的一组卡片。");
};

const resetPuzzleState = () => {
  clearPuzzleTimers();
  puzzle.running = false;
  puzzle.paused = false;
  puzzle.ended = false;
  puzzle.time = 45;
  puzzle.score = 0;
  puzzle.hintsLeft = 1;
  puzzle.statusText = "把9片拼图拖到正确位置。";
  puzzle.hintSlots = [];
  puzzle.draggingPieceId = null;
  puzzle.completedInTime = false;
  puzzle.currentQuestion = null;
  puzzle.questionLeft = 0;
  puzzle.answered = 0;
};

const nextPuzzleQuestion = () => {
  const scene = puzzleScenes[puzzle.sceneIndex];
  const correct = scene.pieces[Math.floor(Math.random() * scene.pieces.length)];
  const distractors = shuffle(
    puzzleScenes
      .flatMap((s, idx) => (idx === puzzle.sceneIndex ? [] : s.pieces))
      .filter((p) => p !== correct),
  ).slice(0, 2);
  puzzle.currentQuestion = {
    sceneName: scene.name,
    correct,
    options: shuffle([correct, ...distractors]),
  };
  puzzle.questionLeft = 5;
};

const buildPuzzlePieces = () => {
  const scene = puzzleScenes[puzzle.sceneIndex];
  puzzlePieces.value = shuffle(
    scene.pieces.map((emoji, idx) => ({
      id: `pz-${idx}`,
      emoji,
      correctIndex: idx,
      placedIndex: null,
    })),
  );
};

const endPuzzleGame = (completed) => {
  puzzle.running = false;
  puzzle.ended = true;
  clearPuzzleTimers();
  puzzle.completedInTime = completed;
  if (completed) {
    puzzle.score = 100 + puzzle.time;
    puzzle.statusText = "拼图完成！你真是拼图小能手。";
    tone(960, 150);
  } else {
    puzzle.score = puzzleProgress.value * 8;
    puzzle.statusText = "时间到，拼图未完成。";
  }
};

const startPuzzleGame = () => {
  resetPuzzleState();
  puzzle.running = true;
  nextPuzzleQuestion();
  puzzleTickTimer = window.setInterval(() => {
    if (!puzzle.running || puzzle.paused) return;
    puzzle.time -= 1;
    puzzle.questionLeft -= 1;
    if (puzzle.questionLeft <= 0 && puzzle.currentQuestion) {
      puzzle.score -= 3;
      showScoreFlash(-3, "超时");
      puzzle.statusText = "超时，下一题继续。";
      puzzle.answered += 1;
      if (puzzle.answered >= 9) {
        endPuzzleGame(false);
        return;
      }
      nextPuzzleQuestion();
    }
    if (puzzle.time <= 0) endPuzzleGame(false);
  }, 1000);
};

const restartPuzzleGame = () => {
  puzzle.sceneIndex = (puzzle.sceneIndex + 1) % puzzleScenes.length;
  startPuzzleGame();
};

const answerPuzzleQuestion = (emoji) => {
  if (
    !puzzle.running ||
    puzzle.paused ||
    puzzle.ended ||
    !puzzle.currentQuestion
  )
    return;
  puzzle.answered += 1;
  if (emoji === puzzle.currentQuestion.correct) {
    puzzle.score += 12;
    puzzle.statusText = "选择正确，拼图线索+1！";
    showScoreFlash(12, "答对");
    tone(880, 100);
  } else {
    puzzle.score -= 4;
    puzzle.statusText = "不太对，再看场景提示。";
    showScoreFlash(-4, "答错");
    tone(250, 110);
  }

  if (puzzle.answered >= 9) {
    endPuzzleGame(true);
    return;
  }
  nextPuzzleQuestion();
};

const onPuzzleDragStart = (piece, event) => {
  if (!puzzle.running || puzzle.paused || puzzle.ended) {
    event.preventDefault();
    return;
  }
  puzzle.draggingPieceId = piece.id;
  event.dataTransfer?.setData("text/plain", piece.id);
};

const onPuzzleDrop = (slotIndex, event) => {
  if (!puzzle.running || puzzle.paused || puzzle.ended) return;
  const id =
    event.dataTransfer?.getData("text/plain") || puzzle.draggingPieceId;
  const piece = puzzlePieces.value.find((p) => p.id === id);
  if (!piece || piece.placedIndex !== null) return;
  if (piece.correctIndex === slotIndex) {
    piece.placedIndex = slotIndex;
    puzzle.statusText = "拼接正确，碎片已吸附固定！";
    tone(880, 100);
    if (puzzleProgress.value === 9) endPuzzleGame(puzzle.time >= 0);
  } else {
    puzzle.statusText = "位置不对，再试一试。";
    tone(250, 120);
  }
  puzzle.draggingPieceId = null;
};

const usePuzzleHint = () => {
  if (
    !puzzle.running ||
    puzzle.paused ||
    puzzle.ended ||
    puzzle.hintsLeft <= 0 ||
    !puzzle.currentQuestion
  )
    return;
  puzzle.hintsLeft -= 1;
  showToast(`提示：可优先选择 ${puzzle.currentQuestion.correct}`);
};

const togglePause = (gameId) => {
  if (gameId === "seed" && seed.running && !seed.ended) {
    seed.paused = !seed.paused;
    if (seed.paused) {
      pauseDialog.visible = true;
      pauseDialog.gameId = gameId;
      pauseDialog.time = seed.time;
    }
  }
  if (gameId === "weed" && weed.running && !weed.ended) {
    weed.paused = !weed.paused;
    if (weed.paused) {
      pauseDialog.visible = true;
      pauseDialog.gameId = gameId;
      pauseDialog.time = weed.time;
    }
  }
  if (gameId === "match" && match.running && !match.ended) {
    match.paused = !match.paused;
    if (match.paused) stopMatchBgm();
    else startMatchBgm();
    if (match.paused) {
      pauseDialog.visible = true;
      pauseDialog.gameId = gameId;
      pauseDialog.time = match.time;
    }
  }
  if (gameId === "puzzle" && puzzle.running && !puzzle.ended) {
    puzzle.paused = !puzzle.paused;
    if (puzzle.paused) {
      pauseDialog.visible = true;
      pauseDialog.gameId = gameId;
      pauseDialog.time = puzzle.time;
    }
  }
};

const resumePausedGame = () => {
  if (pauseDialog.gameId === "seed") seed.paused = false;
  if (pauseDialog.gameId === "weed") weed.paused = false;
  if (pauseDialog.gameId === "match") match.paused = false;
  if (pauseDialog.gameId === "match") startMatchBgm();
  if (pauseDialog.gameId === "puzzle") puzzle.paused = false;
  pauseDialog.visible = false;
};

const restartCurrentGame = () => {
  if (pauseDialog.gameId === "seed") startSeedGame();
  if (pauseDialog.gameId === "weed") startWeedGame();
  if (pauseDialog.gameId === "match") startMatchGame();
  if (pauseDialog.gameId === "puzzle") startPuzzleGame();
  pauseDialog.visible = false;
};

const shareResult = (name, score) => {
  showToast(`${name} 成绩 ${score} 分，已分享到排行榜。`);
};

setupMatchCards();

watch(activeGame, () => {
  // 切换标签时自动暂停当前进行中的游戏
  if (seed.running && !seed.paused && !seed.ended) seed.paused = true;
  if (weed.running && !weed.paused && !weed.ended) weed.paused = true;
  if (match.running && !match.paused && !match.ended) {
    match.paused = true;
    stopMatchBgm();
  }
  if (puzzle.running && !puzzle.paused && !puzzle.ended) puzzle.paused = true;
});

window.addEventListener("pointermove", onSeedPointerMove);
window.addEventListener("pointerup", onSeedPointerUp);

onBeforeUnmount(() => {
  stopMatchBgm();
  clearSeedTimers();
  clearWeedTimers();
  clearMatchTimers();
  clearPuzzleTimers();
  clearTimeout(toastTimer);
  clearTimeout(scoreFlashTimer);
  clearInterval(introLoadingTimer);
  window.removeEventListener("pointermove", onSeedPointerMove);
  window.removeEventListener("pointerup", onSeedPointerUp);
  document.removeEventListener("fullscreenchange", syncFullScreenState);
});

document.addEventListener("fullscreenchange", syncFullScreenState);
</script>

<style scoped>
.game-page {
  --wiki-text: #203a22;
  --wiki-text-soft: #4b614b;
  --wiki-kicker: #6b7f45;
  --wiki-card: rgba(255, 255, 255, 0.9);
  --wiki-card-border: rgba(116, 205, 86, 0.24);
  --wiki-chip: rgba(245, 253, 228, 0.96);
  --wiki-primary-1: #6ed44f;
  --wiki-primary-2: #4dac37;
  --wiki-accent-1: #ffd66b;
  --wiki-accent-2: #f3b93d;
  min-height: 100vh;
  color: var(--wiki-text);
  background:
    radial-gradient(
      circle at 12% 14%,
      rgba(255, 214, 107, 0.2),
      transparent 24%
    ),
    radial-gradient(
      circle at 88% 10%,
      rgba(115, 212, 82, 0.18),
      transparent 26%
    ),
    linear-gradient(180deg, #fbf8ee 0%, #f5f3e4 100%);
  display: grid;
  gap: 14px;
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
}

.section-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wiki-kicker);
  font-weight: 700;
}

.game-hero,
.game-card {
  border-radius: 24px;
  background: var(--wiki-card);
  border: 1px solid var(--wiki-card-border);
  box-shadow: 0 14px 30px rgba(46, 82, 34, 0.1);
}

.game-hero {
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  gap: 12px;
}

.game-hero h2 {
  margin-top: 4px;
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
  color: #2b5a2d;
  font-size: clamp(28px, 3vw, 40px);
}

.hero-copy {
  margin-top: 8px;
  line-height: 1.7;
  color: var(--wiki-text-soft);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.hero-stats article {
  border-radius: 16px;
  padding: 10px;
  background: linear-gradient(180deg, #fffef5, #eef9d8);
  border: 1px solid rgba(116, 205, 86, 0.22);
  text-align: center;
}

.hero-stats strong {
  display: block;
  color: #2b5a2d;
  font-size: 24px;
  line-height: 1;
}

.hero-stats span {
  margin-top: 6px;
  display: block;
  font-size: 12px;
  color: var(--wiki-text-soft);
}

.game-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.game-stage {
  min-height: 760px;
}

.game-stage:fullscreen {
  padding: 18px;
  background: linear-gradient(180deg, #fbf8ee 0%, #f5f3e4 100%);
}

.game-stage:fullscreen .game-card {
  min-height: calc(100vh - 36px);
}

.game-tab {
  border: 0;
  border-radius: 16px;
  padding: 10px;
  display: grid;
  gap: 5px;
  justify-items: center;
  background: rgba(255, 255, 255, 0.92);
  color: #355335;
  cursor: pointer;
  font-weight: 700;
}

.game-tab.active {
  background: linear-gradient(180deg, #fff7d9, #ecf8c9);
  box-shadow: inset 0 0 0 1px rgba(116, 205, 86, 0.3);
}

.game-tab span {
  font-size: 22px;
}

.game-card {
  padding: 14px;
  min-height: 760px;
}

.arcade-layout {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  min-height: 730px;
}

.info-rail {
  position: sticky;
  top: 104px;
  display: grid;
  gap: 10px;
  align-content: start;
}

.rail-section-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #5f7a38;
  text-transform: uppercase;
}

.rail-console {
  border-radius: 14px;
  padding: 10px;
  background: linear-gradient(180deg, #fffef5, #eef9d8);
  border: 1px solid rgba(116, 205, 86, 0.24);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.game-chip,
.state-chip {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.game-chip {
  color: #2f5a2b;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(116, 205, 86, 0.24);
}

.state-chip {
  gap: 6px;
  color: #355335;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(116, 205, 86, 0.24);
}

.state-chip .state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8fa0a8;
}

.state-chip.running {
  color: #245524;
  border-color: rgba(77, 172, 55, 0.34);
  background: rgba(223, 247, 178, 0.45);
}

.state-chip.running .state-dot {
  background: #4dac37;
  box-shadow: 0 0 0 0 rgba(77, 172, 55, 0.55);
  animation: pulse-dot 1.2s ease infinite;
}

.state-chip.paused {
  color: #81510f;
  border-color: rgba(243, 185, 61, 0.4);
  background: rgba(255, 214, 107, 0.2);
}

.state-chip.paused .state-dot {
  background: #f3b93d;
}

.state-chip.ended {
  color: #5a645d;
  border-color: rgba(140, 154, 143, 0.36);
  background: rgba(232, 237, 233, 0.7);
}

.state-chip.ended .state-dot {
  background: #8fa0a8;
}

.state-chip.idle {
  color: #3c5d7d;
  border-color: rgba(95, 138, 176, 0.3);
  background: rgba(219, 237, 250, 0.55);
}

.state-chip.idle .state-dot {
  background: #78a8cf;
}

.play-stage {
  border-radius: 20px;
  border: 1px solid rgba(116, 205, 86, 0.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), #fffef5);
  padding: 12px;
  min-height: 700px;
}

.game-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  min-height: 86px;
}

.game-head h3 {
  color: #2b5a2d;
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
  font-size: clamp(24px, 2.2vw, 34px);
}

.hud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 34px;
  align-items: center;
}

.hud span,
.hint-bar,
.status-bar {
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--wiki-chip);
  border: 1px solid rgba(116, 205, 86, 0.24);
  color: #35742d;
  font-size: 12px;
  font-weight: 700;
}

.timer-chip.safe {
  color: #2f6f2a;
}

.timer-chip.warning {
  color: #8a5a12;
  border-color: rgba(243, 185, 61, 0.45);
  background: rgba(255, 214, 107, 0.28);
}

.timer-chip.critical {
  color: #9a2626;
  border-color: rgba(234, 85, 85, 0.48);
  background: rgba(255, 203, 203, 0.46);
  animation: critical-blink 0.9s ease infinite;
}

.combo-chip {
  color: #7a3f09;
  border-color: rgba(243, 185, 61, 0.5);
  background: rgba(255, 214, 107, 0.26);
}

.life-chip {
  color: #8f2637;
  border-color: rgba(219, 95, 125, 0.35);
  background: rgba(255, 224, 231, 0.72);
}

.meter-box {
  border-radius: 12px;
  border: 1px solid rgba(116, 205, 86, 0.24);
  background: rgba(255, 255, 255, 0.85);
  padding: 8px 10px;
  display: grid;
  gap: 6px;
}

.meter-box p {
  margin: 0;
  font-size: 12px;
  color: #51704b;
  font-weight: 700;
}

.meter-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(205, 223, 194, 0.62);
  overflow: hidden;
}

.meter-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6ed44f, #4dac37);
  transition: width 0.25s ease;
}

.meter-track.combo span {
  background: linear-gradient(90deg, #ffd66b, #f3b93d);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  align-items: center;
}

.action-btn,
.ghost-btn {
  border: 0;
  min-height: 40px;
  border-radius: 999px;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 700;
}

.action-btn {
  color: #ffffff;
  background: linear-gradient(
    180deg,
    var(--wiki-primary-1),
    var(--wiki-primary-2)
  );
  box-shadow: 0 10px 18px rgba(77, 172, 55, 0.26);
}

.action-btn.accent {
  background: linear-gradient(
    180deg,
    var(--wiki-accent-1),
    var(--wiki-accent-2)
  );
  color: #5f3c00;
}

.ghost-btn {
  color: #2f5a2b;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(116, 205, 86, 0.24);
}

.action-btn:disabled,
.ghost-btn:disabled {
  opacity: 0.56;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.seed-game-area {
  min-height: 660px;
  border-radius: 18px;
  border: 1px solid rgba(116, 205, 86, 0.24);
  background: linear-gradient(
    180deg,
    rgba(255, 247, 214, 0.86),
    rgba(239, 249, 210, 0.9)
  );
  overflow: hidden;
}

.seed-quiz-board {
  min-height: 660px;
  border-radius: 18px;
  border: 1px solid rgba(116, 205, 86, 0.24);
  background: linear-gradient(180deg, #fffef7, #eef9d8);
  padding: 16px;
  display: grid;
  align-content: start;
  gap: 14px;
  position: relative;
}

.quiz-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(116, 205, 86, 0.22);
  padding: 14px;
  display: grid;
  justify-items: center;
  gap: 10px;
  box-shadow: 0 10px 18px rgba(76, 132, 50, 0.12);
}

.quiz-title {
  margin: 0;
  color: #446042;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.quiz-emoji {
  font-size: 84px;
  line-height: 1;
}

.quiz-label {
  margin: 0;
  font-size: 24px;
  color: #2f5a2b;
  font-weight: 800;
}

.quiz-timer {
  margin: 0;
  color: #7a4f1b;
  background: rgba(255, 214, 107, 0.24);
  border: 1px solid rgba(243, 185, 61, 0.4);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quiz-options-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quiz-option {
  min-height: 94px;
  border-radius: 14px;
  border: 1px solid rgba(116, 205, 86, 0.28);
  background: rgba(255, 255, 255, 0.95);
  display: grid;
  justify-items: center;
  gap: 4px;
  align-content: center;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.quiz-option strong {
  font-size: 28px;
  line-height: 1;
}

.quiz-option span {
  color: #2f5a2b;
  font-size: 14px;
  font-weight: 700;
}

.quiz-option:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(77, 172, 55, 0.2);
  background: linear-gradient(180deg, #fffef9, #f4fce8);
}

.quiz-option:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.phase-banner {
  border-radius: 12px;
  padding: 10px 12px;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.phase-banner.start {
  background: rgba(116, 205, 86, 0.2);
  color: #2e5f26;
  border: 1px solid rgba(77, 172, 55, 0.32);
}

.phase-banner.end {
  background: rgba(255, 214, 107, 0.3);
  color: #7a4a0f;
  border: 1px solid rgba(243, 185, 61, 0.38);
}

.mini-quiz-board {
  min-height: 660px;
  border-radius: 18px;
  border: 1px solid rgba(116, 205, 86, 0.24);
  background: linear-gradient(180deg, #fffef7, #eef9d8);
  padding: 16px;
  display: grid;
  align-content: start;
  gap: 14px;
}

.quiz-pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.quiz-pair span {
  font-size: 68px;
  line-height: 1;
}

.quiz-pair em {
  font-style: normal;
  color: #70866d;
  font-weight: 700;
}

.match-hall {
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.8fr) minmax(
      220px,
      0.9fr
    );
  gap: 12px;
  min-height: 720px;
}

.match-side {
  border-radius: 18px;
  padding: 12px;
  border: 1px solid rgba(255, 176, 128, 0.32);
  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(255, 245, 200, 0.62),
      transparent 52%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.92),
      rgba(255, 241, 225, 0.95)
    );
  display: grid;
  gap: 10px;
  align-content: start;
}

.match-mascot {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(252, 179, 109, 0.32);
  padding: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
}

.mascot-emoji {
  font-size: 30px;
  animation: mascot-bob 1.6s ease-in-out infinite;
}

.mascot-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #7d4a10;
}

.mascot-copy {
  margin: 2px 0 0;
  font-size: 12px;
  color: #875e35;
  line-height: 1.5;
}

.match-chip-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.match-chip-list span {
  border-radius: 999px;
  padding: 6px 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #6f4b20;
  border: 1px solid rgba(252, 179, 109, 0.35);
  background: linear-gradient(180deg, #fff8e7, #fff0d4);
}

.match-status {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.match-difficulty-picker {
  border-radius: 12px;
  border: 1px solid rgba(252, 179, 109, 0.35);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  display: grid;
  gap: 8px;
}

.match-difficulty-picker p {
  margin: 0;
  font-size: 12px;
  color: #7d4a10;
  font-weight: 800;
}

.match-difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.match-difficulty-buttons .ghost-btn {
  min-height: 34px;
  padding: 0 8px;
  border-color: rgba(252, 179, 109, 0.32);
  color: #875324;
}

.match-difficulty-buttons .ghost-btn.active {
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(180deg, #ff9f68, #ff7f4f);
}

.match-stage {
  border: 1px solid rgba(252, 179, 109, 0.38);
  background:
    radial-gradient(
      circle at 0% 100%,
      rgba(255, 238, 173, 0.45),
      transparent 48%
    ),
    radial-gradient(
      circle at 100% 0%,
      rgba(255, 215, 188, 0.45),
      transparent 44%
    ),
    linear-gradient(180deg, #fff9f1, #fff3e4);
  display: grid;
  gap: 10px;
  align-content: start;
}

.match-titlebar {
  border-radius: 16px;
  border: 1px solid rgba(252, 179, 109, 0.32);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  display: grid;
  gap: 8px;
}

.match-titlebar h3 {
  margin: 0;
  color: #7d4a10;
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
  font-size: clamp(24px, 2vw, 32px);
}

.match-board {
  position: relative;
  overflow: hidden;
  min-height: 520px;
  border: 1px solid rgba(252, 179, 109, 0.35);
  background:
    radial-gradient(
      circle at 12% 8%,
      rgba(255, 214, 132, 0.26),
      transparent 30%
    ),
    radial-gradient(
      circle at 86% 20%,
      rgba(255, 166, 131, 0.22),
      transparent 32%
    ),
    linear-gradient(180deg, #fffef8, #fff4e8);
  align-content: start;
}

.match-jammer-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: inherit;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(255, 180, 140, 0.22),
      rgba(255, 180, 140, 0.22) 16px,
      rgba(255, 144, 118, 0.26) 16px,
      rgba(255, 144, 118, 0.26) 32px
    ),
    rgba(255, 246, 234, 0.58);
  backdrop-filter: blur(2px);
  display: grid;
  place-content: center;
  text-align: center;
  gap: 8px;
}

.match-jammer-mask p {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #8b3f09;
}

.match-jammer-mask span {
  font-size: 13px;
  color: #8b4e1d;
  font-weight: 700;
}

.match-burst-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.match-firework-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.match-firework {
  position: absolute;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.match-firework-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6d8 0%, #ffd36f 58%, #ff9f68 100%);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 18px rgba(255, 167, 104, 0.65);
}

.firework-spark {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--spark-color, #ffd86b);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(255, 176, 112, 0.6);
  animation: spark-shot 0.72s ease-out forwards;
}

.firework-enter-active {
  animation: firework-pop 0.72s ease forwards;
}

.firework-leave-active {
  transition: opacity 0.18s ease;
}

.firework-leave-to {
  opacity: 0;
}

.card-move {
  transition: transform 0.35s cubic-bezier(0.2, 0.75, 0.2, 1);
}

.match-burst {
  position: absolute;
  font-size: 24px;
  line-height: 1;
  color: var(--burst-color, #ff9a62);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.55);
  transform: translate(-50%, -50%);
}

.burst-enter-active {
  animation: burst-pop 0.6s ease forwards;
}

.burst-leave-active {
  transition: opacity 0.2s ease;
}

.burst-leave-to {
  opacity: 0;
}

.match-stickers {
  display: flex;
  gap: 8px;
}

.match-stickers span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(252, 179, 109, 0.3);
  font-size: 18px;
  animation: sticker-float 2.6s ease-in-out infinite;
}

.match-stickers span:nth-child(2) {
  animation-delay: 0.35s;
}

.match-stickers span:nth-child(3) {
  animation-delay: 0.7s;
}

.match-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 4;
  border-radius: inherit;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
  padding: 16px;
  background: rgba(255, 248, 237, 0.88);
  backdrop-filter: blur(2px);
}

.match-loading-kicker {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  color: #7d4a10;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.match-loading-mask h4 {
  margin: 0;
  font-size: 30px;
  color: #8f4f0d;
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
}

.loading-track.candy {
  border: 1px solid rgba(252, 179, 109, 0.35);
  background: rgba(255, 255, 255, 0.72);
}

.loading-track.candy span,
.meter-track.candy span {
  background: linear-gradient(90deg, #ff8f66, #ffbf5f);
}

.match-quiz-card {
  border: 1px solid rgba(252, 179, 109, 0.35);
  background: linear-gradient(180deg, #ffffff, #fff6e8);
}

.candy-pair span {
  width: 92px;
  height: 92px;
  border-radius: 22px;
  font-size: 56px;
  border: 1px solid rgba(252, 179, 109, 0.35);
  background: linear-gradient(180deg, #fff, #fff4df);
  box-shadow: 0 10px 20px rgba(252, 179, 109, 0.2);
  display: grid;
  place-items: center;
}

.candy-pair em {
  color: #d36e2f;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.match-options {
  margin-top: 6px;
}

.match-board-tip {
  margin: 0;
  padding: 8px 12px;
  border-radius: 999px;
  text-align: center;
  color: #7d4a10;
  background: rgba(255, 236, 204, 0.72);
  border: 1px solid rgba(252, 179, 109, 0.35);
  font-size: 12px;
  font-weight: 700;
}

.candy-grid {
  margin-top: 4px;
  align-content: stretch;
  gap: 10px;
  width: min(100%, 860px);
  max-height: min(66vh, 620px);
}

.match-grid-shell {
  display: grid;
  place-items: center;
  min-height: 0;
}

.candy-card {
  position: relative;
  min-height: 0;
  aspect-ratio: 1 / 1;
  transform: none;
  border: 0;
  background: transparent;
  perspective: 900px;
  box-shadow: none;
  padding: 0;
}

.candy-card .card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  transform-style: preserve-3d;
  transition: transform 0.28s ease;
  display: block;
}

.candy-card .card-face {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  display: grid;
  place-items: center;
  font-size: 36px;
  backface-visibility: hidden;
}

.candy-card .card-front {
  border: 1px solid rgba(252, 179, 109, 0.4);
  background: linear-gradient(180deg, #fff6e6, #ffe5c4);
  box-shadow: 0 8px 14px rgba(255, 159, 104, 0.2);
}

.candy-card .card-back {
  border: 1px solid rgba(252, 179, 109, 0.36);
  background: linear-gradient(180deg, #ffffff, #fff2dd);
  transform: rotateY(180deg);
  box-shadow: 0 10px 16px rgba(252, 179, 109, 0.2);
}

.candy-card.open .card-inner,
.candy-card.removed .card-inner {
  transform: rotateY(180deg);
}

.candy-card.hinted .card-front {
  box-shadow:
    0 0 0 3px rgba(255, 186, 102, 0.45),
    0 10px 16px rgba(255, 159, 104, 0.24);
}

.candy-card.blocker .card-front {
  background: linear-gradient(180deg, #ffe9d9, #ffd6c1);
  border-color: rgba(241, 122, 91, 0.5);
}

.candy-card.blocker .card-back {
  background: linear-gradient(180deg, #fff0e5, #ffd4c1);
  border-color: rgba(241, 122, 91, 0.54);
}

.candy-card.blocker.used {
  opacity: 0.5;
}

.candy-card.removed {
  opacity: 0.34;
}

.candy-option {
  min-height: 120px;
  border-radius: 18px;
  border: 1px solid rgba(252, 179, 109, 0.4);
  background: linear-gradient(180deg, #fffefb, #fff2de);
}

.candy-option strong {
  font-size: 34px;
}

.candy-option span {
  color: #7a4a1e;
  font-size: 15px;
}

.candy-option:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 26px rgba(255, 159, 104, 0.24);
  background: linear-gradient(180deg, #fffefa, #ffeccf);
}

.match-controls {
  display: grid;
}

.ghost-btn.danger {
  color: #8d2d2d;
  border-color: rgba(206, 108, 108, 0.35);
  background: rgba(255, 236, 236, 0.9);
}

.ghost-btn.danger:hover:not(:disabled) {
  background: linear-gradient(180deg, #fff4f4, #ffdede);
}

@keyframes mascot-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes sticker-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(-4deg);
  }
}

@keyframes burst-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -35%) scale(0.4);
  }
  25% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -160%) scale(1.25);
  }
}

@keyframes firework-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -20%) scale(0.5);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -130%) scale(1.3);
  }
}

@keyframes spark-shot {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty)))
      scale(0.1);
  }
}

.seed-sky {
  position: relative;
  height: 500px;
}

.falling-seed {
  position: absolute;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(116, 205, 86, 0.34);
  cursor: grab;
  user-select: none;
  touch-action: none;
  font-size: 26px;
  line-height: 1;
}

.falling-seed.selected {
  box-shadow: 0 0 0 3px rgba(255, 214, 107, 0.4);
  transform: scale(1.12);
}

.falling-seed.gold {
  background: linear-gradient(180deg, #fff7bf, #ffd66b);
  border-color: rgba(243, 185, 61, 0.55);
  box-shadow: 0 0 0 2px rgba(255, 214, 107, 0.24);
  animation: golden-glow 1.2s ease infinite;
}

.falling-seed.freeze {
  background: linear-gradient(180deg, #f4fcff, #d7f0ff);
  border-color: rgba(120, 188, 227, 0.48);
}

.falling-seed.chaos {
  background: linear-gradient(180deg, #f3ecff, #e8ddff);
  border-color: rgba(153, 132, 209, 0.48);
  animation: swirl 0.9s linear infinite;
}

.falling-seed.weed {
  background: rgba(255, 244, 207, 0.98);
  border-color: rgba(243, 185, 61, 0.42);
  cursor: pointer;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 10px;
  background: rgba(245, 253, 228, 0.9);
}

.field {
  min-height: 92px;
  border-radius: 14px;
  border: 1px dashed rgba(116, 205, 86, 0.45);
  background: rgba(255, 255, 255, 0.72);
  display: grid;
  place-items: center;
  text-align: center;
  position: relative;
}

.field.active {
  box-shadow: 0 0 0 3px rgba(110, 212, 79, 0.32);
  background: rgba(255, 255, 255, 0.92);
}

.field-row.chaos {
  animation: chaos-wave 0.42s ease infinite alternate;
}

.field p {
  color: #587050;
  font-weight: 700;
}

.sprout-wrap {
  position: absolute;
  inset: auto 0 8px 0;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.sprout {
  font-size: 18px;
}

.weed-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 10px;
  min-height: 660px;
}

.weed-plot {
  border-radius: 16px;
  padding: 10px;
  border: 1px solid rgba(116, 205, 86, 0.24);
  background: linear-gradient(180deg, #ffffff, #f4fbdf);
}

.weed-plot h4 {
  color: #31542f;
  margin-bottom: 8px;
}

.weed-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.weed-item {
  border: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(116, 205, 86, 0.24);
}

.weed-item.weed {
  background: #fff7d6;
}

.weed-item.shake {
  animation: shake 0.2s linear 1;
}

.weed-item.sad {
  animation: sad 0.34s ease 1;
}

.weed-item.sprout {
  animation: sprout 0.28s ease 1;
}

.match-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 10px;
  min-height: 0;
  align-content: stretch;
}

.match-card {
  border: 0;
  border-radius: 14px;
  min-height: 0;
  background: linear-gradient(180deg, #fffef5, #eef9d8);
  box-shadow: inset 0 0 0 1px rgba(116, 205, 86, 0.3);
  font-size: 26px;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.match-card.open {
  transform: none;
}

.match-card.removed {
  opacity: 0.25;
  pointer-events: none;
}

.match-card.hinted {
  box-shadow: 0 0 0 3px rgba(255, 214, 107, 0.4);
}

.puzzle-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr);
  gap: 10px;
  min-height: 660px;
}

.result-shell {
  min-height: 100px;
  display: grid;
  align-items: end;
}

.puzzle-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.puzzle-slot {
  min-height: 180px;
  border-radius: 12px;
  border: 1px dashed rgba(116, 205, 86, 0.45);
  background: rgba(255, 255, 255, 0.82);
  display: grid;
  place-items: center;
}

.puzzle-slot.hinted {
  box-shadow: 0 0 0 3px rgba(255, 214, 107, 0.35);
}

.slot-index {
  color: #6e8766;
  font-size: 13px;
  font-weight: 700;
}

.puzzle-side {
  display: grid;
  gap: 10px;
}

.puzzle-preview,
.piece-tray {
  border-radius: 14px;
  padding: 10px;
  background: linear-gradient(180deg, #ffffff, #f4fbdf);
  border: 1px solid rgba(116, 205, 86, 0.24);
}

.puzzle-preview h4,
.piece-tray h4 {
  color: #31542f;
  margin-bottom: 6px;
}

.preview-row,
.tray-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.preview-row span,
.piece {
  border-radius: 10px;
  min-height: 42px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(116, 205, 86, 0.2);
  display: grid;
  place-items: center;
  font-size: 22px;
}

.piece {
  cursor: grab;
}

.piece.fixed {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

.result {
  border-radius: 14px;
  padding: 10px;
  background: rgba(245, 253, 228, 0.96);
  border: 1px solid rgba(116, 205, 86, 0.22);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.result p {
  color: var(--wiki-text-soft);
  line-height: 1.6;
}

.pause-mask {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 18, 0.42);
  backdrop-filter: blur(3px);
  z-index: 1200;
  display: grid;
  place-items: center;
}

.intro-mask {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 18, 0.46);
  backdrop-filter: blur(2px);
  z-index: 1250;
  display: grid;
  place-items: center;
}

.intro-card {
  width: min(560px, calc(100vw - 26px));
  border-radius: 20px;
  padding: 18px;
  background: linear-gradient(180deg, #ffffff, #f6ffe5);
  border: 1px solid rgba(116, 205, 86, 0.3);
  box-shadow: 0 18px 34px rgba(29, 63, 18, 0.2);
  display: grid;
  gap: 10px;
}

.intro-kicker {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #6b7f45;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-card h4 {
  margin: 0;
  color: #2b5a2d;
  font-size: 26px;
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
}

.intro-step-title {
  margin: 0;
  color: #5b7652;
  font-size: 13px;
  font-weight: 700;
}

.intro-step-text {
  margin: 0;
  min-height: 56px;
  border-radius: 12px;
  border: 1px solid rgba(116, 205, 86, 0.24);
  background: rgba(255, 255, 255, 0.88);
  padding: 12px;
  color: #355335;
  line-height: 1.65;
}

.intro-progress {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 221, 192, 0.65);
}

.intro-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6ed44f, #4dac37);
  transition: width 0.25s ease;
}

.intro-card--loading {
  justify-items: center;
  text-align: center;
}

.intro-loading-text {
  margin: 8px 0 2px;
  color: #456145;
}

.loading-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 221, 192, 0.65);
}

.loading-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffd66b, #6ed44f);
  transition: width 0.08s linear;
}

.intro-loading-percent {
  margin: 0;
  color: #5e764f;
  font-size: 13px;
  font-weight: 700;
}

.pause-card {
  width: min(420px, calc(100vw - 30px));
  border-radius: 22px;
  padding: 18px;
  background: linear-gradient(180deg, #ffffff, #f6ffe5);
  border: 1px solid rgba(116, 205, 86, 0.3);
  display: grid;
  gap: 12px;
}

.pause-card h4 {
  color: #2b5a2d;
  font-size: 24px;
}

.toast {
  position: fixed;
  right: 20px;
  bottom: 24px;
  z-index: 1300;
  padding: 11px 14px;
  border-radius: 12px;
  color: #fff;
  background: rgba(77, 172, 55, 0.94);
  box-shadow: 0 12px 24px rgba(24, 53, 21, 0.24);
}

.score-flash {
  position: fixed;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  z-index: 1350;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.03em;
  animation: score-pop 0.85s ease forwards;
  pointer-events: none;
}

.score-flash.plus {
  color: #1f5f22;
  background: rgba(196, 241, 141, 0.96);
  border: 2px solid rgba(77, 172, 55, 0.55);
}

.score-flash.minus {
  color: #8a1f1f;
  background: rgba(255, 198, 198, 0.96);
  border: 2px solid rgba(220, 85, 85, 0.55);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sprout-pop-enter-active,
.sprout-pop-leave-active {
  transition: all 0.28s ease;
}

.sprout-pop-enter-from,
.sprout-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  50% {
    transform: translateX(2px);
  }
  75% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes sad {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px) rotate(-8deg);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes sprout {
  0% {
    transform: scale(0.75);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes golden-glow {
  0% {
    box-shadow: 0 0 0 2px rgba(255, 214, 107, 0.2);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(255, 214, 107, 0);
  }
}

@keyframes swirl {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes chaos-wave {
  0% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(2px);
  }
}

@keyframes critical-blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

@keyframes score-pop {
  0% {
    transform: translateX(-50%) translateY(0) scale(0.82);
    opacity: 0;
  }
  20% {
    transform: translateX(-50%) translateY(0) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-22px) scale(1);
    opacity: 0;
  }
}

@keyframes pulse-dot {
  0% {
    box-shadow: 0 0 0 0 rgba(77, 172, 55, 0.55);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(77, 172, 55, 0);
  }
}

@media (max-width: 1100px) {
  .game-hero {
    grid-template-columns: 1fr;
  }

  .hero-stats,
  .weed-board {
    grid-template-columns: 1fr;
  }

  .game-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .puzzle-layout {
    grid-template-columns: 1fr;
  }

  .arcade-layout {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .match-hall {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .match-difficulty-buttons {
    grid-template-columns: 1fr;
  }

  .info-rail {
    position: static;
  }

  .play-stage {
    min-height: 0;
  }

  .game-stage,
  .game-card {
    min-height: 0;
  }
}

@media (max-width: 760px) {
  .game-page {
    padding: 84px 10px 16px;
  }

  .game-tabs,
  .quiz-options,
  .field-row,
  .match-grid,
  .preview-row,
  .tray-grid {
    grid-template-columns: 1fr;
  }

  .hud {
    width: 100%;
    min-height: 0;
  }

  .hud span,
  .hint-bar,
  .status-bar {
    width: 100%;
    text-align: center;
  }

  .game-stage,
  .game-card,
  .arcade-layout,
  .match-hall,
  .play-stage,
  .seed-game-area,
  .weed-board,
  .match-grid,
  .puzzle-layout,
  .result-shell {
    min-height: 0;
  }
}
</style>
