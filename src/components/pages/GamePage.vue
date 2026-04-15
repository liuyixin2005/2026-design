<template>
  <div class="game-page">
    <header class="game-hero">
      <div>
        <p class="section-kicker">多款小游戏</p>
        <h2>农耕小游戏总动员</h2>
        <p class="hero-copy">
          四款游戏均可直接游玩，按你的规则实现计时、计分、道具、暂停、结算与分享提示。
        </p>
      </div>
      <div class="hero-stats">
        <article><strong>4</strong><span>可玩游戏</span></article>
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
      <section v-if="activeGame === 'seed'" class="game-card">
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
              <h3>游戏1：播种小能手（反应类）</h3>
              <div class="hud">
                <span class="timer-chip" :class="seedTimeTone"
                  >剩余：{{ seed.time }}s</span
                >
                <span>得分：{{ seed.score }}</span>
                <span class="combo-chip">🔥 连击：{{ seed.combo }}</span>
                <span>正确率：{{ seedAccuracy }}%</span>
                <span>阶段：{{ seedStageInfo.label }}</span>
              </div>
            </header>

            <div class="controls">
              <button class="action-btn" type="button" @click="startSeedGame">
                开始
              </button>
              <button
                class="ghost-btn"
                type="button"
                @click="togglePause('seed')"
                :disabled="!seed.running || seed.ended"
              >
                {{ seed.paused ? "继续" : "暂停" }}
              </button>
              <button class="ghost-btn" type="button" @click="restartSeedGame">
                重新开始
              </button>
              <button class="ghost-btn" type="button" @click="toggleFullScreen">
                {{ isFullScreen ? "退出全屏" : "全屏游玩" }}
              </button>
              <button
                class="action-btn accent"
                type="button"
                :disabled="
                  !seed.slowUnlocked || seed.slowActive || seed.slowUsed
                "
                @click="useSlowTool"
              >
                快速播种道具 {{ seed.slowActive ? `(${seed.slowLeft}s)` : "" }}
              </button>
            </div>

            <p class="hint-bar">
              对应提示：🌟金种子
              +20，❄️冰冻减速3秒，🌪️混乱会交换农田；杂草可点击拔除 +5。
            </p>
            <p class="status-bar">{{ seed.statusText }}</p>
            <div class="result-shell">
              <footer class="result" v-if="seed.ended">
                <p>
                  结算：得分 {{ seed.score }}，正确率 {{ seedAccuracy }}%。{{
                    seed.score >= 50 ? "已获得播种小勋章。" : "未达到勋章门槛。"
                  }}
                  最高连击 {{ seed.maxCombo }}，星级
                  {{ "★".repeat(seedStarCount)
                  }}{{ "☆".repeat(3 - seedStarCount) }}。
                </p>
                <button
                  class="ghost-btn"
                  type="button"
                  @click="shareResult('播种小能手', seed.score)"
                >
                  分享排行榜
                </button>
              </footer>
            </div>
          </aside>

          <div class="play-stage">
            <div class="seed-quiz-board">
              <div
                class="phase-banner start"
                v-if="!seed.running && !seed.ended"
              >
                点击“开始”进入益智挑战
              </div>
              <div class="phase-banner end" v-if="seed.ended">挑战结束</div>

              <div class="quiz-card" v-if="seed.currentQuestion">
                <p class="quiz-title">帮它找到正确的家</p>
                <div class="quiz-emoji">{{ seed.currentQuestion.emoji }}</div>
                <p class="quiz-label">{{ seed.currentQuestion.name }}</p>
                <p class="quiz-timer">本题倒计时：{{ seed.questionLeft }}s</p>
              </div>

              <div class="quiz-options">
                <button
                  v-for="field in seedDisplayFields"
                  :key="field.type"
                  type="button"
                  class="quiz-option"
                  :disabled="!seed.running || seed.ended"
                  @click="answerSeedQuestion(field.type)"
                >
                  <strong>{{ field.icon }}</strong>
                  <span>{{ field.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="activeGame === 'weed'" class="game-card">
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
              <h3>游戏2：除草大挑战（动手类）</h3>
              <div class="hud">
                <span>剩余：{{ weed.time }}s</span>
                <span>得分：{{ weed.score }}</span>
                <span>进度：{{ weed.answered }}/15</span>
              </div>
            </header>
            <div class="controls">
              <button class="action-btn" type="button" @click="startWeedGame">
                开始
              </button>
              <button
                class="ghost-btn"
                type="button"
                @click="togglePause('weed')"
                :disabled="!weed.running || weed.ended"
              >
                {{ weed.paused ? "继续" : "暂停" }}
              </button>
              <button class="ghost-btn" type="button" @click="restartWeedGame">
                重新开始
              </button>
              <button
                class="action-btn accent"
                type="button"
                :disabled="!weed.running || weed.paused"
                @click="skipWeedQuestion"
              >
                换一题
              </button>
              <button class="ghost-btn" type="button" @click="toggleFullScreen">
                {{ isFullScreen ? "退出全屏" : "全屏游玩" }}
              </button>
            </div>
            <p class="hint-bar">
              区分提示：杂草颜色偏黄（🌵）需拔除，禾苗（🌾）不能误拔。
            </p>
            <p class="status-bar">{{ weed.statusText }}</p>
            <div class="result-shell">
              <footer class="result" v-if="weed.ended">
                <p>
                  结算：拔掉杂草 {{ weed.weedsRemoved }} 棵，误拔禾苗
                  {{ weed.cropMistakes }} 次，得分 {{ weed.score }}。{{
                    weed.score >= 50 ? "已获得除草小勋章。" : "再接再厉。"
                  }}
                </p>
                <button
                  class="ghost-btn"
                  type="button"
                  @click="shareResult('除草大挑战', weed.score)"
                >
                  分享排行榜
                </button>
              </footer>
            </div>
          </aside>

          <div class="play-stage">
            <div class="mini-quiz-board">
              <div
                class="phase-banner start"
                v-if="!weed.running && !weed.ended"
              >
                点击“开始”进入除草判断
              </div>
              <div class="phase-banner end" v-if="weed.ended">挑战结束</div>

              <div class="quiz-card" v-if="weed.currentQuestion">
                <p class="quiz-title">它该怎么处理？</p>
                <div class="quiz-emoji">{{ weed.currentQuestion.emoji }}</div>
                <p class="quiz-label">{{ weed.currentQuestion.name }}</p>
                <p class="quiz-timer">本题倒计时：{{ weed.questionLeft }}s</p>
              </div>

              <div class="quiz-options quiz-options-2">
                <button
                  class="quiz-option"
                  type="button"
                  :disabled="!weed.running || weed.paused || weed.ended"
                  @click="answerWeedQuestion('pull')"
                >
                  <strong>✋</strong>
                  <span>拔掉它</span>
                </button>
                <button
                  class="quiz-option"
                  type="button"
                  :disabled="!weed.running || weed.paused || weed.ended"
                  @click="answerWeedQuestion('keep')"
                >
                  <strong>✅</strong>
                  <span>先保留</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="activeGame === 'match'" class="game-card">
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
              <h3>游戏3：丰收连连看（益智类）</h3>
              <div class="hud">
                <span>剩余：{{ match.time }}s</span>
                <span>得分：{{ match.score }}</span>
                <span>进度：{{ match.answered }}/12</span>
              </div>
            </header>

            <div class="controls">
              <button class="action-btn" type="button" @click="startMatchGame">
                开始
              </button>
              <button
                class="ghost-btn"
                type="button"
                @click="togglePause('match')"
                :disabled="!match.running || match.ended"
              >
                {{ match.paused ? "继续" : "暂停" }}
              </button>
              <button class="ghost-btn" type="button" @click="restartMatchGame">
                重新开始
              </button>
              <button
                class="action-btn accent"
                type="button"
                :disabled="
                  match.hintsLeft <= 0 || !match.running || match.paused
                "
                @click="useMatchHint"
              >
                提示（剩余 {{ match.hintsLeft }}）
              </button>
              <button class="ghost-btn" type="button" @click="toggleFullScreen">
                {{ isFullScreen ? "退出全屏" : "全屏游玩" }}
              </button>
            </div>

            <p class="hint-bar">
              图鉴：🌾水稻、🌿小麦、🌽玉米、🥕胡萝卜、🍅西红柿、🎃南瓜。
            </p>
            <p class="status-bar">{{ match.statusText }}</p>
            <div class="result-shell">
              <footer class="result" v-if="match.ended">
                <p>
                  结算：得分 {{ match.score }}，通关时间
                  {{ 75 - match.time }}s。{{
                    match.clearedInTime
                      ? "已获得丰收小勋章。"
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

          <div class="play-stage">
            <div class="mini-quiz-board">
              <div
                class="phase-banner start"
                v-if="!match.running && !match.ended"
              >
                点击“开始”进入配对判断
              </div>
              <div class="phase-banner end" v-if="match.ended">挑战结束</div>

              <div class="quiz-card" v-if="match.currentQuestion">
                <p class="quiz-title">它们是同一类吗？</p>
                <div class="quiz-pair">
                  <span>{{ match.currentQuestion.leftEmoji }}</span>
                  <em>vs</em>
                  <span>{{ match.currentQuestion.rightEmoji }}</span>
                </div>
                <p class="quiz-timer">本题倒计时：{{ match.questionLeft }}s</p>
              </div>

              <div class="quiz-options quiz-options-2">
                <button
                  class="quiz-option"
                  type="button"
                  :disabled="!match.running || match.paused || match.ended"
                  @click="answerMatchQuestion(true)"
                >
                  <strong>🟢</strong>
                  <span>同类</span>
                </button>
                <button
                  class="quiz-option"
                  type="button"
                  :disabled="!match.running || match.paused || match.ended"
                  @click="answerMatchQuestion(false)"
                >
                  <strong>🔵</strong>
                  <span>不同类</span>
                </button>
              </div>
            </div>
          </div>
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
              <h3>游戏4：农耕小拼图（动手益智类）</h3>
              <div class="hud">
                <span>剩余：{{ puzzle.time }}s</span>
                <span>进度：{{ puzzle.answered }}/9</span>
                <span>提示：{{ puzzle.hintsLeft }}</span>
              </div>
            </header>

            <div class="controls">
              <button class="action-btn" type="button" @click="startPuzzleGame">
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
  { id: "seed", icon: "🌱", name: "播种小能手" },
  { id: "weed", icon: "🌿", name: "除草大挑战" },
  { id: "match", icon: "🍅", name: "丰收连连看" },
  { id: "puzzle", icon: "🧩", name: "农耕小拼图" },
];

const activeGame = ref("seed");
const seedAreaRef = ref(null);
const gameStageRef = ref(null);
const isFullScreen = ref(false);
const toast = reactive({ visible: false, text: "" });
let toastTimer = null;
const scoreFlash = reactive({ visible: false, text: "", type: "plus" });
let scoreFlashTimer = null;

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
  time: 75,
  score: 0,
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
let seedSpawnTimer = null;
let seedTickTimer = null;
let seedMoveTimer = null;
let weedSpawnTimer = null;
let weedTickTimer = null;
let matchTickTimer = null;
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
  { emoji: "🌾", name: "水稻", answer: "rice" },
  { emoji: "🌿", name: "小麦", answer: "wheat" },
  { emoji: "🌽", name: "玉米", answer: "corn" },
  { emoji: "🌵", name: "杂草", answer: "weed" },
  { emoji: "🥕", name: "胡萝卜", answer: "corn" },
  { emoji: "🍅", name: "西红柿", answer: "wheat" },
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
  matchTickTimer = null;
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
  if (seed.score >= 50) {
    seed.statusText = `播种完成！最高连击 ${seed.maxCombo}。`;
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
      setSeedComboFail();
      showScoreFlash(-3, "超时");
      seed.statusText = "慢一点也没关系，继续来一题。";
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
    showScoreFlash(-5, "答错");
    setSeedComboFail();
    seed.statusText = "再试试，你一定可以！";
    tone(280, 110);
  }

  applySeedMilestoneRewards();
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
  match.time = 75;
  match.score = 0;
  match.hintsLeft = 2;
  match.cards = [];
  match.picks = [];
  match.lock = false;
  match.statusText = "看两个图案，判断是否同类。";
  match.clearedInTime = false;
  match.currentQuestion = null;
  match.questionLeft = 0;
  match.answered = 0;
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
  const deck = shuffle(matchKinds.flatMap((k) => [k, k])).map((kind, idx) => ({
    id: `m-${idx}-${kind}`,
    kind,
    open: false,
    removed: false,
    hinted: false,
  }));
  match.cards = deck;
};

const endMatchGame = (cleared) => {
  match.running = false;
  match.ended = true;
  clearMatchTimers();
  match.clearedInTime = cleared && match.time >= 0;
  if (cleared) {
    const bonus = Math.floor(match.time / 10) * 10;
    match.score += bonus;
    match.statusText = `匹配成功，提前通关奖励 +${bonus} 分！`;
    tone(920, 140);
  } else {
    match.statusText = "时间到，未完成全部匹配。";
  }
};

const startMatchGame = () => {
  resetMatchState();
  match.running = true;
  nextMatchQuestion();
  matchTickTimer = window.setInterval(() => {
    if (!match.running || match.paused) return;
    match.time -= 1;
    match.questionLeft -= 1;
    if (match.questionLeft <= 0 && match.currentQuestion) {
      match.score -= 3;
      showScoreFlash(-3, "超时");
      match.statusText = "超时，下一题继续。";
      match.answered += 1;
      nextMatchQuestion();
    }
    if (match.time <= 0) endMatchGame(false);
  }, 1000);
};

const restartMatchGame = () => startMatchGame();

const answerMatchQuestion = (pickedSame) => {
  if (!match.running || match.paused || match.ended || !match.currentQuestion)
    return;
  match.answered += 1;
  if (pickedSame === match.currentQuestion.same) {
    match.score += 12;
    match.statusText = "判断正确！";
    showScoreFlash(12, "答对");
    tone(850, 100);
  } else {
    match.score -= 5;
    match.statusText = "判断错误，再来一题。";
    showScoreFlash(-5, "答错");
    tone(260, 110);
  }
  nextMatchQuestion();
};

const flipMatchCard = (card) => {
  if (!match.running || match.paused || match.ended || match.lock) return;
  if (card.removed || card.open) return;
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
      match.score += 20;
      showScoreFlash(20, "配对");
      match.statusText = "匹配成功！";
      match.picks = [];
      match.lock = false;
      if (match.cards.every((c) => c.removed)) endMatchGame(true);
    }, 220);
  } else {
    tone(260, 120);
    match.statusText = "不匹配，再试一试。";
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
    match.hintsLeft <= 0 ||
    !match.currentQuestion
  )
    return;
  match.hintsLeft -= 1;
  showToast(`提示：这题是${match.currentQuestion.same ? "同类" : "不同类"}。`);
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

watch(activeGame, () => {
  // 切换标签时自动暂停当前进行中的游戏
  if (seed.running && !seed.paused && !seed.ended) seed.paused = true;
  if (weed.running && !weed.paused && !weed.ended) weed.paused = true;
  if (match.running && !match.paused && !match.ended) match.paused = true;
  if (puzzle.running && !puzzle.paused && !puzzle.ended) puzzle.paused = true;
});

window.addEventListener("pointermove", onSeedPointerMove);
window.addEventListener("pointerup", onSeedPointerUp);

onBeforeUnmount(() => {
  clearSeedTimers();
  clearWeedTimers();
  clearMatchTimers();
  clearPuzzleTimers();
  clearTimeout(toastTimer);
  clearTimeout(scoreFlashTimer);
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  gap: 8px;
}

.quiz-title {
  margin: 0;
  color: #5a6f4f;
  font-size: 13px;
  font-weight: 700;
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
  grid-auto-rows: minmax(140px, 1fr);
  gap: 10px;
  min-height: 660px;
  align-content: start;
}

.match-card {
  border: 0;
  border-radius: 14px;
  min-height: 140px;
  background: linear-gradient(180deg, #fffef5, #eef9d8);
  box-shadow: inset 0 0 0 1px rgba(116, 205, 86, 0.3);
  font-size: 26px;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.match-card.open {
  transform: scale(1.05) rotate(2deg);
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
