<template>
  <section class="wiki-page" aria-label="农耕小百科">
    <header class="wiki-hero">
      <div class="wiki-hero__top">
        <div class="brand-lockup">
          <span class="brand-icon" aria-hidden="true">📘🌾</span>
          <div>
            <p class="brand-kicker">儿童农耕百科</p>
            <h1>农耕小百科</h1>
          </div>
        </div>
      </div>

      <div class="hero-summary">
        <p>每个分类都是一个小词条：先看定义，再看关键点和例子，一眼就懂。</p>
      </div>

      <div
        ref="searchShellRef"
        class="search-shell"
        @keydown.esc="closeSuggest"
      >
        <input
          v-model.trim="searchText"
          class="search-input"
          type="text"
          placeholder="搜索词条：水稻、锄头、节气……"
          aria-label="搜索农耕知识"
          @focus="isSuggestOpen = true"
          @input="onSearch"
          @keydown.enter="searchByInput"
        />
        <button class="search-btn" type="button" @click="searchByInput">
          搜索
        </button>

        <div
          v-if="isSuggestOpen && suggestedEntries.length"
          class="suggest-panel"
        >
          <button
            v-for="entry in suggestedEntries"
            :key="`${entry.categoryId}-${entry.label}`"
            class="suggest-item"
            type="button"
            @mousedown.prevent="searchBySuggestion(entry)"
          >
            <span class="suggest-label">{{ entry.label }}</span>
            <span class="suggest-hint">{{ entry.hint }}</span>
          </button>
        </div>
      </div>

      <div class="quick-tags" aria-label="热门词条">
        <button
          v-for="tag in quickTags"
          :key="tag"
          class="quick-tag"
          type="button"
          @click="searchBySuggestionFromText(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </header>

    <nav class="category-strip" aria-label="百科分类">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-pill"
        :class="{ active: category.id === activeCategoryId }"
        type="button"
        @click="switchCategory(category.id)"
      >
        <span class="category-pill__icon" aria-hidden="true">{{
          category.icon
        }}</span>
        <span class="category-pill__body">
          <strong>{{ category.name }}</strong>
          <small>{{ category.hint }}</small>
        </span>
      </button>
    </nav>

    <div class="wiki-grid">
      <main class="wiki-main" aria-live="polite">
        <article class="article-card">
          <div class="entry-header">
            <div>
              <p class="entry-label">百科词条</p>
              <h2 class="entry-title">{{ currentCategory.name }}</h2>
              <p class="entry-subtitle">{{ currentCategory.summary }}</p>
            </div>
            <button class="mini-btn" type="button" @click="readCurrentCategory">
              朗读词条
            </button>
          </div>

          <div class="entry-visual">
            <figure class="entry-figure">
              <img
                :src="currentCategory.image"
                :alt="currentCategory.imageAlt"
              />
              <figcaption>{{ currentCategory.imageCaption }}</figcaption>
            </figure>
            <div class="entry-definition">
              <span class="term-badge">定义</span>
              <p>{{ currentCategory.definition }}</p>
            </div>
          </div>

          <div class="entry-meta">
            <div class="meta-item">
              <span>小问题！！！</span>
              <strong>{{ currentCategory.hint }}</strong>
            </div>
            <div class="meta-item">
              <span>关键词</span>
              <div class="keyword-list">
                <span
                  v-for="word in currentCategory.keywords"
                  :key="word"
                  class="keyword-chip"
                  >{{ word }}</span
                >
              </div>
            </div>
          </div>

          <div class="fact-list">
            <div
              v-for="fact in currentCategory.keyFacts"
              :key="fact.text"
              class="fact-item"
            >
              <span class="fact-icon" aria-hidden="true">{{ fact.icon }}</span>
              <p>{{ fact.text }}</p>
            </div>
          </div>

          <section class="example-block">
            <div class="example-head">
              <p class="section-kicker">常见例子</p>
              <h3 class="example-title">{{ currentCategory.example.title }}</h3>
            </div>

            <div class="example-body">
              <img
                class="example-image"
                :src="currentCategory.example.image"
                :alt="currentCategory.example.alt"
              />
              <div class="example-text">
                <p class="example-desc">{{ currentCategory.example.desc }}</p>
              </div>
            </div>

            <div class="example-steps">
              <p class="section-kicker">一步一步</p>
              <ol class="step-list step-flow">
                <li v-for="(step, index) in currentCategory.steps" :key="step">
                  <span>{{ index + 1 }}</span>
                  <strong>{{ step }}</strong>
                </li>
              </ol>
            </div>
          </section>

          <section class="learning-path">
            <div class="learning-head">
              <p class="section-kicker">学习进阶</p>
              <h3 class="learning-title">看完这些，就能解锁小测验</h3>
              <p class="learning-subtitle">一步一步把知识变成能力。</p>
            </div>

            <div class="path-track">
              <div class="path-step">
                <span class="path-index">1</span>
                <div class="path-content">
                  <strong>读懂定义</strong>
                  <p>先知道这个词条在讲什么。</p>
                </div>
              </div>
              <div class="path-step">
                <span class="path-index">2</span>
                <div class="path-content">
                  <strong>抓住关键点</strong>
                  <p>记住最重要的 2-3 个小线索。</p>
                </div>
              </div>
              <div class="path-step">
                <span class="path-index">3</span>
                <div class="path-content">
                  <strong>看真实例子</strong>
                  <p>把知识和生活里的画面连起来。</p>
                </div>
              </div>
              <div class="path-step path-step--unlock">
                <span class="path-index">4</span>
                <div class="path-content">
                  <strong>解锁测验</strong>
                  <p>准备好就来挑战一题。</p>
                </div>
                <button
                  class="primary-btn"
                  type="button"
                  @click="openQuizConfirm"
                >
                  开始答题
                </button>
              </div>
            </div>
          </section>
        </article>
      </main>

      <aside class="wiki-side">
        <article class="side-card">
          <p class="side-kicker">词条目录</p>
          <div class="toc-list">
            <button
              v-for="category in categories"
              :key="category.id"
              class="toc-item"
              :class="{ active: category.id === activeCategoryId }"
              type="button"
              @click="switchCategory(category.id)"
            >
              <span>{{ category.icon }}</span>
              <strong>{{ category.name }}</strong>
            </button>
          </div>
        </article>

        <article class="side-card">
          <p class="side-kicker">学习记录</p>
          <div class="learn-status">
            <div class="learn-badge" :class="{ active: isLearned }">
              {{ isLearned ? "⭐" : "☆" }}
            </div>
            <div>
              <strong>{{ learnedCount }} / {{ categories.length }}</strong>
              <p>每学会一个词条，就点亮对应的小星星。</p>
            </div>
          </div>
          <div class="learn-progress" aria-hidden="true">
            <span
              :style="{ width: `${(learnedCount / categories.length) * 100}%` }"
            ></span>
          </div>
          <div class="learn-list" aria-label="已打卡词条">
            <div
              v-for="category in categories"
              :key="`${category.id}-learned`"
              class="learn-item"
              :class="{ active: isCategoryLearned(category.id) }"
            >
              <span>{{ category.icon }}</span>
              <strong>{{ category.name }}</strong>
              <em>{{
                isCategoryLearned(category.id) ? "已打卡" : "未打卡"
              }}</em>
            </div>
          </div>
          <div class="learn-action">
            <button class="secondary-btn" type="button" @click="toggleLearned">
              {{ isLearned ? "取消打卡" : "我学会了" }}
            </button>
            <span v-if="learnToast" class="learn-toast">{{ learnToast }}</span>
          </div>
        </article>
      </aside>
    </div>
  </section>

  <div
    v-if="isQuizConfirmOpen"
    class="quiz-confirm"
    role="dialog"
    aria-modal="true"
  >
    <div class="quiz-confirm__panel">
      <div class="quiz-confirm__icon" aria-hidden="true">🧠✨</div>
      <h3>小勇士，准备好了吗？</h3>
      <p>如果你已经看完定义和例子，就可以开始小测验啦！</p>
      <div class="quiz-confirm__actions">
        <button class="ghost-btn" type="button" @click="closeQuizConfirm">
          先再看看
        </button>
        <button class="primary-btn" type="button" @click="confirmStartQuiz">
          我准备好了
        </button>
      </div>
    </div>
  </div>

  <div v-if="isQuizOpen" class="quiz-modal" role="dialog" aria-modal="true">
    <div
      class="quiz-modal__panel"
      :class="{
        shake: isShake,
        'success-glow': isSuccessGlow,
        'fail-flash': isFailFlash,
      }"
    >
      <header class="quiz-modal__head">
        <div>
          <p class="section-kicker">小测验</p>
          <h2>看完来答一题</h2>
        </div>
        <button class="ghost-btn" type="button" @click="closeQuizModal">
          关闭
        </button>
      </header>

      <div class="quiz-panel">
        <div class="quiz-progress-shell" aria-label="答题进度">
          <div class="quiz-progress">
            第 {{ currentQuestionNumber }} 题 /
            {{ currentCategory.quiz.length }} 题
          </div>
          <div class="quiz-progress-bar">
            <span :style="{ width: `${quizProgressPercent}%` }"></span>
          </div>
        </div>
        <p class="quiz-question">{{ currentQuestion.question }}</p>

        <div class="quiz-options">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="option"
            class="quiz-option"
            :class="{
              selected: selectedOptionIndex === index,
              correct: answered && index === currentQuestion.answer,
              wrong:
                answered &&
                selectedOptionIndex === index &&
                index !== currentQuestion.answer,
            }"
            type="button"
            @click="chooseOption(index)"
          >
            {{ option }}
          </button>
        </div>

        <div class="quiz-steps" aria-hidden="true">
          <span :class="{ active: quizStepPhase === 'choose' }">1 选答案</span>
          <span :class="{ active: quizStepPhase === 'feedback' }">
            2 看提示
          </span>
          <span :class="{ active: quizStepPhase === 'next' }">3 点下一题</span>
        </div>

        <div class="quiz-actions">
          <button
            class="mini-btn"
            type="button"
            :disabled="!answered || !isCorrectAnswer || quizCompleted"
            @click="nextQuestion"
          >
            继续闯关
          </button>
          <span v-if="isWrongAnswer" class="quiz-lock-hint">
            答对再闯关哦
          </span>
          <button
            v-if="isWrongAnswer"
            class="ghost-btn"
            type="button"
            @click="retryQuestion"
          >
            重答
          </button>
          <p class="quiz-feedback">{{ quizFeedback }}</p>
          <p v-if="quizCompleted" class="quiz-complete">
            ✅ 闯关结束！继续进行下一阶段的学习吧。
          </p>
        </div>
      </div>

      <div v-if="showFireworks" class="fireworks" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { playVoice, showPage } from "../../store";
import cardImageA from "../../assets/home/inner1.png";
import cardImageB from "../../assets/home/inner2.png";

const categories = [
  {
    id: "ecology",
    icon: "🌱",
    name: "农耕生态",
    hint: "植物为什么能长大",
    summary: "农耕生态就是植物、土壤、阳光和水一起合作，像好朋友一样帮助彼此。",
    definition:
      "农耕生态，是农作物在生长时，和阳光、雨水、土壤、小虫子这些周围环境互相帮助、一起生活的热闹小世界。",
    image: cardImageA,
    imageAlt: "水稻田示意",
    imageCaption:
      "水稻田里住着好多小生命，阳光、水和土壤正在开一场‘长大派对’！",
    keywords: ["阳光", "水", "土壤", "发芽", "小生命"],
    parentTip: "可以带孩子观察一盆植物，边看边说“它现在需要什么”。",
    example: {
      title: "神奇的水稻田",
      desc: "水稻是个‘游泳健将’，最喜欢把脚泡在水里！太阳公公给它能量，土壤妈妈抱住它的根，水里的小鱼小虾还帮它赶走害虫，是不是很热闹？",
      image: cardImageA,
      alt: "水稻田插画",
    },
    keyFacts: [
      {
        icon: "☀️",
        text: "阳光是植物的‘充电宝’，没有阳光，植物就没力气长大啦！",
      },
      {
        icon: "🪱",
        text: "土壤里住着蚯蚓和很多看不见的小工匠，它们会把落叶变成植物的营养大餐。",
      },
      {
        icon: "🌱",
        text: "玉米喜欢住得宽敞点，水稻喜欢泡澡，每种植物都有自己喜欢的小环境。",
      },
    ],
    steps: ["种子钻进被窝(土)", "喝饱水打个嗝", "伸出小脑袋", "晒着太阳长高高"],
    quickHint: "想一想：为什么水稻更喜欢水田？",
    searchTerms: ["水稻", "植物", "土壤", "阳光", "雨水"],
    quiz: [
      {
        question: "植物最需要什么来当‘充电宝’？",
        options: ["阳光", "冰块", "石头"],
        answer: 0,
        explain: "植物会把阳光变成甜甜的能量，就像我们吃饭一样！",
      },
      {
        question: "小苗长大时要不要喝水？",
        options: ["要，渴了就要喝", "不要，它怕水", "只喝汽水"],
        answer: 0,
        explain: "水是植物的搬运工，能把营养送到身体的各个角落。",
      },
      {
        question: "谁住在土壤里帮忙松土？",
        options: ["蚯蚓", "蝴蝶", "瓢虫"],
        answer: 0,
        explain: "蚯蚓在土里钻来钻去，就像给土壤挠痒痒，让根更容易呼吸。",
      },
      {
        question: "下面哪个不是植物长大需要的？",
        options: ["阳光", "水", "手机"],
        answer: 2,
        explain: "哈哈，植物可不用刷视频，它们只喜欢晒太阳、喝水、呼吸空气！",
      },
    ],
  },
  {
    id: "processing",
    icon: "🍚",
    name: "粮食加工",
    hint: "米和面怎么变出来",
    summary:
      "粮食加工就是给稻谷、小麦脱掉硬硬的‘外套’，让它们变成香喷喷的米饭和松软的面包。",
    definition:
      "粮食加工，是把收获来的谷物宝宝进行脱壳、研磨和整理的魔法过程，让它们变成我们能吃的主食。",
    image: cardImageB,
    imageAlt: "稻谷加工示意",
    imageCaption: "稻谷脱掉金色的盔甲，就露出白白胖胖的大米啦！",
    keywords: ["稻谷", "大米", "小麦", "面粉", "脱壳"],
    parentTip: "可以一起看看家里包装袋上的“原料”，让孩子知道食物从哪里来。",
    example: {
      title: "稻谷的变身魔法",
      desc: "刚从田里回来的稻谷穿着一身‘黄金甲’，走进加工厂的大机器里转一转、磨一磨，出来就变成了我们每天吃的大米，是不是像变魔术？",
      image: cardImageB,
      alt: "稻谷加工插画",
    },
    keyFacts: [
      {
        icon: "🌾",
        text: "稻谷是个害羞的宝宝，要脱掉外面的壳，才是白白的大米。",
      },
      {
        icon: "🫓",
        text: "小麦磨成细细的粉末，就变成了面粉，可以做饺子、面条和蛋糕！",
      },
      {
        icon: "🏺",
        text: "粮食怕热也怕潮，把它们放在凉快通风的地方，才不会长小虫子哦。",
      },
    ],
    steps: ["田里大丰收", "晒太阳做日光浴", "机器里脱外套", "变成主食上餐桌"],
    quickHint: "想一想：米饭和面食分别来自什么粮食？",
    searchTerms: ["稻谷", "米饭", "小麦", "面粉", "磨面"],
    quiz: [
      {
        question: "稻谷脱壳后会变成什么？",
        options: ["大米", "小米", "黄豆"],
        answer: 0,
        explain: "稻谷去壳后就是我们每天见的白米啦！",
      },
      {
        question: "小麦常常能做成什么？",
        options: ["馒头", "雨伞", "橡皮"],
        answer: 0,
        explain: "小麦磨成面粉后，加水揉一揉，蒸一蒸就是大馒头。",
      },
      {
        question: "下面哪个是用面粉做的？",
        options: ["面条", "米饭", "玉米棒"],
        answer: 0,
        explain: "长长的面条是面粉揉出来的，米饭是大米煮的，别搞混啦！",
      },
      {
        question: "粮食加工的第一步通常是什么？",
        options: ["先晒干", "直接煮", "放冰箱"],
        answer: 0,
        explain: "刚收的粮食湿湿的，得先晒太阳或者烘干，不然容易发霉。",
      },
    ],
  },
  {
    id: "global",
    icon: "🌍",
    name: "中外农耕差异",
    hint: "不同地方怎么种地",
    summary:
      "世界上有的地方雨多，有的地方太阳大，所以大家种地的‘姿势’和种的‘宝贝’也完全不一样！",
    definition:
      "中外农耕差异，是因为地球各地的脾气（气候）和皮肤（土地）不一样，人们才发明了不同的种田方法，有的地方水汪汪，有的地方干巴巴。",
    image: cardImageA,
    imageAlt: "麦田与水田对比示意",
    imageCaption:
      "左边是中国南方的水田，右边是欧洲金黄的大麦田，看起来是不是像两个世界？",
    keywords: ["中国", "欧洲", "水田", "麦田", "气候"],
    parentTip: "可以用地图或餐桌举例，让孩子理解“地方不同，食物也会不同”。",
    example: {
      title: "水田里的水稻 vs 旱地上的小麦",
      desc: "在中国南方和东南亚，雨水多得能划船，人们就把田灌满水种水稻。而在欧洲平原，风大凉爽，金灿灿的小麦像海浪一样翻滚。",
      image: cardImageA,
      alt: "水田麦田对比插画",
    },
    keyFacts: [
      {
        icon: "🇨🇳",
        text: "中国很多地方像‘水上乐园’，田里存着水，专门给水稻游泳。",
      },
      {
        icon: "🇪🇺",
        text: "欧洲的大平原一望无际，更适合耐旱的小麦迎着风跳舞。",
      },
      {
        icon: "🌦️",
        text: "如果一个地方老是下雪，那人们就会种土豆或者养驯鹿，而不是种水稻啦！",
      },
    ],
    steps: [
      "抬头看天气",
      "低头摸土地",
      "决定种什么",
      "用对的方法照顾它",
      "收获不同的美味",
    ],
    quickHint: "为什么有的地方种水稻，有的地方种小麦？",
    searchTerms: ["中国", "欧洲", "麦田", "水田", "地图"],
    quiz: [
      {
        question: "中国南方很多地方常见什么田？",
        options: ["水田", "雪田", "沙田"],
        answer: 0,
        explain: "水田像个大浴缸，水稻最喜欢泡在里面。",
      },
      {
        question: "欧洲平原更常见什么作物？",
        options: ["小麦", "珊瑚", "贝壳"],
        answer: 0,
        explain: "平原开阔风大，小麦在风里摇摇摆摆长得可好了。",
      },
      {
        question: "为什么不同地方种的东西不一样？",
        options: ["因为天气和土地不同", "因为农民伯伯的喜好", "随便种的"],
        answer: 0,
        explain: "天气冷热、雨水多少决定了植物爱不爱住在这里。",
      },
      {
        question: "下面哪个地方可能种不了水稻？",
        options: ["大沙漠", "河边", "湖边"],
        answer: 0,
        explain: "沙漠里水太少了，水稻会渴坏的，仙人掌才喜欢那里。",
      },
    ],
  },
  {
    id: "tools",
    icon: "🛠️",
    name: "农耕工具进化",
    hint: "农具怎样越变越好用",
    summary:
      "从尖尖的石头到轰隆隆的机器人，农具一直在‘升级打怪’，让农民伯伯越来越轻松！",
    definition:
      "农耕工具进化，就像农具们的‘变形金刚’故事，从古时候的木头棒子，变成了现在会自己跑的大机器，力气越来越大，干活越来越快。",
    image: cardImageB,
    imageAlt: "农耕工具示意",
    imageCaption:
      "几千年前用石头锄头，现在用带空调的拖拉机，变化是不是比孙悟空还大？",
    keywords: ["锄头", "镰刀", "拖拉机", "犁", "无人机"],
    parentTip: "可以拿家里的小工具和农具比一比，帮助孩子理解“工具的作用”。",
    example: {
      title: "从牛拉犁到无人机撒药",
      desc: "以前牛大哥是主力，拉着犁慢悠悠走。现在田里跑着拖拉机，天上还飞着无人机帮忙看虫子、撒肥料，就像科幻片一样！",
      image: cardImageB,
      alt: "农具演变插画",
    },
    keyFacts: [
      {
        icon: "🪓",
        text: "最早的锄头就是一根带尖的木头，后来有了铜和铁，才变得锋利起来。",
      },
      {
        icon: "✂️",
        text: "镰刀像月牙，专门用来收割金黄的稻谷和小麦，一割一大把。",
      },
      {
        icon: "🚜",
        text: "拖拉机是农田里的大力士，能拉犁、能播种，累了喝点油就又有劲儿了。",
      },
    ],
    steps: [
      "原始：徒手和石头",
      "古代：青铜和铁农具",
      "近代：牛马帮忙拉车",
      "现代：机器轰隆隆",
      "未来：机器人种地",
    ],
    quickHint: "为什么工具更好用，种地就更轻松？",
    searchTerms: ["锄头", "镰刀", "拖拉机", "犁", "农具"],
    quiz: [
      {
        question: "锄头常常用来做什么？",
        options: ["除草松土", "画画", "写字"],
        answer: 0,
        explain: "锄头能把硬硬的土弄松，还能把抢营养的杂草请出去。",
      },
      {
        question: "现代常见的种地大帮手是谁？",
        options: ["拖拉机", "滑板车", "自行车"],
        answer: 0,
        explain: "拖拉机能拉很重的东西，是农田里的超级大力士。",
      },
      {
        question: "古时候谁经常帮忙拉犁？",
        options: ["牛", "狗", "猫"],
        answer: 0,
        explain: "牛力气大又听话，是农民伯伯的好搭档。",
      },
      {
        question: "下面哪个是收割用的工具？",
        options: ["镰刀", "锤子", "螺丝刀"],
        answer: 0,
        explain: "弯弯的镰刀一挥，麦子就倒下一大片。",
      },
    ],
  },
  {
    id: "history",
    icon: "🏺",
    name: "农耕历史",
    hint: "以前的人怎么种地",
    summary:
      "很久很久以前，人们发现掉在地上的种子会变出食物，于是聪明的祖先就开始了种地的奇妙旅程。",
    definition:
      "农耕历史，是一本厚厚的‘种地日记’，记录着人类从追着野兽跑、到处摘果子，到学会种田、建房子，最后变出城市的神奇故事。",
    image: cardImageA,
    imageAlt: "农耕历史示意",
    imageCaption:
      "古人抬头看星星月亮，低头看小草发芽，慢慢总结出了种地的‘秘籍’——节气。",
    keywords: ["神农", "节气", "古代", "水利", "故事"],
    parentTip: "讲历史时尽量用故事，不要一开始就堆太多名词。",
    example: {
      title: "神农尝百草与节气密码",
      desc: "传说神农的肚子是透明的，他尝遍各种植物，告诉大家哪个能吃、哪个能治病。后来人们发现每年天气都像钟表一样准，就定下了24节气，什么时候该种地，一看就知道！",
      image: cardImageA,
      alt: "农耕历史插画",
    },
    keyFacts: [
      {
        icon: "👀",
        text: "古人没有天气预报，全靠看燕子什么时候回来、树叶什么时候黄了来判断天气。",
      },
      {
        icon: "🗓️",
        text: "‘清明前后，种瓜点豆’，节气就像大自然发给农民伯伯的短信提醒。",
      },
      {
        icon: "💧",
        text: "为了不让庄稼渴死，聪明的人们挖了长长的水渠，把河里的水请到了田里。",
      },
    ],
    steps: [
      "发现种子会发芽",
      "试着把种子埋土里",
      "学会看天象和节气",
      "发明各种好用的农具",
      "一代一代传下去",
    ],
    quickHint: "古人为什么要看节气做农事？",
    searchTerms: ["神农", "节气", "古人", "水利", "农书"],
    quiz: [
      {
        question: "节气像什么？",
        options: ["大自然的闹钟", "好吃的饼干", "会跑的玩具"],
        answer: 0,
        explain: "节气会准时提醒人们，该播种啦，该收获啦！",
      },
      {
        question: "古人为什么修水渠？",
        options: ["给庄稼喝水", "为了好看", "为了养鱼"],
        answer: 0,
        explain: "水渠是庄稼的‘吸管’，能把远处的水送到田里解渴。",
      },
      {
        question: "传说中谁尝遍了百草？",
        options: ["神农", "愚公", "李白"],
        answer: 0,
        explain: "神农氏为了找到能吃的植物，可是尝了不少苦头呢。",
      },
      {
        question: "‘清明前后，种瓜点豆’是什么意思？",
        options: ["提醒该种地了", "一种游戏", "一首诗"],
        answer: 0,
        explain: "意思是清明节到了，天气暖和了，可以开始种瓜子和豆子了。",
      },
    ],
  },
];

const quickTags = ["水稻", "小麦", "锄头", "节气", "拖拉机", "神农"];

const activeCategoryId = ref("ecology");
const searchText = ref("");
const isSuggestOpen = ref(false);
const searchShellRef = ref(null);
const learnedCategoryIds = ref([]);
const learnToast = ref("");
const quizIndex = ref(0);
const selectedOptionIndex = ref(null);
const answered = ref(false);
const quizFeedback = ref("看完词条后，试着答一题。");
const quizStepPhase = ref("choose");
const quizCompleted = ref(false);
const isQuizOpen = ref(false);
const isQuizConfirmOpen = ref(false);
const showFireworks = ref(false);
const isShake = ref(false);
const isSuccessGlow = ref(false);
const isFailFlash = ref(false);

let audioContext;

const currentCategory = computed(() => {
  return (
    categories.find((item) => item.id === activeCategoryId.value) ||
    categories[0]
  );
});

const learnedIdSet = computed(
  () => new Set(learnedCategoryIds.value.filter(Boolean)),
);

const learnedCount = computed(() => learnedIdSet.value.size);

const isLearned = computed(() =>
  learnedIdSet.value.has(activeCategoryId.value),
);

const isCategoryLearned = (categoryId) => learnedIdSet.value.has(categoryId);

const currentQuestion = computed(() => {
  return (
    currentCategory.value.quiz[quizIndex.value] || currentCategory.value.quiz[0]
  );
});

const currentQuestionNumber = computed(() => quizIndex.value + 1);
const isLastQuestion = computed(
  () => quizIndex.value === currentCategory.value.quiz.length - 1,
);

const quizProgressPercent = computed(() => {
  const total = currentCategory.value.quiz.length || 1;
  return Math.round((currentQuestionNumber.value / total) * 100);
});

const isWrongAnswer = computed(() => {
  if (!answered.value) {
    return false;
  }

  return (
    selectedOptionIndex.value !== null &&
    selectedOptionIndex.value !== currentQuestion.value.answer
  );
});

const isCorrectAnswer = computed(() => {
  if (!answered.value) {
    return false;
  }

  return selectedOptionIndex.value === currentQuestion.value.answer;
});

const searchEntries = computed(() => {
  return categories.flatMap((category) => [
    { label: category.name, hint: category.summary, categoryId: category.id },
    ...category.searchTerms.map((keyword) => ({
      label: keyword,
      hint: category.hint,
      categoryId: category.id,
    })),
  ]);
});

const suggestedEntries = computed(() => {
  const input = searchText.value.trim();
  const entries = input
    ? searchEntries.value.filter(
        (entry) => entry.label.includes(input) || entry.hint.includes(input),
      )
    : searchEntries.value;

  return entries.slice(0, 6);
});

const resetQuizState = () => {
  quizIndex.value = 0;
  selectedOptionIndex.value = null;
  answered.value = false;
  quizFeedback.value = "看完词条后，试着答一题。";
  quizStepPhase.value = "choose";
  quizCompleted.value = false;
  showFireworks.value = false;
  isShake.value = false;
  isSuccessGlow.value = false;
  isFailFlash.value = false;
};

const openQuizModal = () => {
  isQuizOpen.value = true;
  quizStepPhase.value = "choose";
  quizCompleted.value = false;
  showFireworks.value = false;
  isShake.value = false;
  isSuccessGlow.value = false;
  isFailFlash.value = false;
};

const openQuizConfirm = () => {
  isQuizConfirmOpen.value = true;
};

const closeQuizConfirm = () => {
  isQuizConfirmOpen.value = false;
};

const confirmStartQuiz = () => {
  isQuizConfirmOpen.value = false;
  openQuizModal();
};

const closeQuizModal = () => {
  isQuizOpen.value = false;
  quizStepPhase.value = "choose";
  quizCompleted.value = false;
  showFireworks.value = false;
  isShake.value = false;
  isSuccessGlow.value = false;
  isFailFlash.value = false;
};

const switchCategory = (categoryId) => {
  activeCategoryId.value = categoryId;
  isSuggestOpen.value = false;
  resetQuizState();
};

const onSearch = () => {
  isSuggestOpen.value = true;
};

const closeSuggest = () => {
  isSuggestOpen.value = false;
};

const applySearch = (keyword) => {
  const target = categories.find((category) => {
    if (category.name.includes(keyword)) {
      return true;
    }

    if (category.searchTerms.some((word) => word.includes(keyword))) {
      return true;
    }

    return (
      category.definition.includes(keyword) ||
      category.summary.includes(keyword)
    );
  });

  if (target) {
    activeCategoryId.value = target.id;
    resetQuizState();
  }
};

const searchByInput = () => {
  const keyword = searchText.value.trim();
  if (!keyword) {
    isSuggestOpen.value = false;
    return;
  }

  applySearch(keyword);
  isSuggestOpen.value = false;
};

const searchBySuggestion = (entry) => {
  searchText.value = entry.label;
  applySearch(entry.label);
  isSuggestOpen.value = false;
};

const searchBySuggestionFromText = (keyword) => {
  searchText.value = keyword;
  applySearch(keyword);
  isSuggestOpen.value = false;
};

const speak = (text) => {
  playVoice(text);
};

const ensureAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
};

const playTone = (frequency, duration, type, gainValue) => {
  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration / 1000);
};

const playSuccessTone = () => {
  playTone(880, 120, "sine", 0.05);
  setTimeout(() => playTone(1200, 140, "sine", 0.045), 140);
};

const playFailTone = () => {
  playTone(240, 160, "triangle", 0.05);
};

const readCurrentCategory = () => {
  const payload = [
    currentCategory.value.name,
    currentCategory.value.definition,
    ...currentCategory.value.keyFacts.map((fact) => fact.text),
    currentCategory.value.example.desc,
  ].join("，");

  speak(payload);
};

const toggleLearned = () => {
  const list = [...learnedCategoryIds.value];
  const index = list.indexOf(activeCategoryId.value);

  if (index >= 0) {
    list.splice(index, 1);
    learnToast.value = "";
  } else {
    list.push(activeCategoryId.value);
    learnToast.value = "已点亮该词条";
  }

  learnedCategoryIds.value = list;
  localStorage.setItem("wikiLearned", JSON.stringify(list));

  if (learnToast.value) {
    setTimeout(() => {
      learnToast.value = "";
    }, 1400);
  }
};

const chooseOption = (index) => {
  if (answered.value) {
    return;
  }

  selectedOptionIndex.value = index;
  answered.value = true;
  quizStepPhase.value = "feedback";

  if (index === currentQuestion.value.answer) {
    quizFeedback.value = `🎉 答对啦！${currentQuestion.value.explain}`;
    speak(`答对啦。${currentQuestion.value.explain}`);
    playSuccessTone();
    showFireworks.value = true;
    isSuccessGlow.value = true;
    setTimeout(() => {
      showFireworks.value = false;
    }, 1400);
    setTimeout(() => {
      isSuccessGlow.value = false;
    }, 900);
    return;
  }

  quizFeedback.value = `😊 再想一想哦。${currentQuestion.value.explain}`;
  speak(`再想一想哦。${currentQuestion.value.explain}`);
  playFailTone();
  isShake.value = true;
  isFailFlash.value = true;
  setTimeout(() => {
    isShake.value = false;
  }, 500);
  setTimeout(() => {
    isFailFlash.value = false;
  }, 650);
};

const nextQuestion = () => {
  if (!isCorrectAnswer.value) {
    return;
  }
  if (isLastQuestion.value) {
    quizCompleted.value = true;
    quizFeedback.value = "🎉 你真棒！继续进行下一阶段的学习吧。";
    speak("你真棒！继续进行下一阶段的学习吧。");
    showFireworks.value = true;
    isSuccessGlow.value = true;
    quizStepPhase.value = "next";
    setTimeout(() => {
      showFireworks.value = false;
      isSuccessGlow.value = false;
    }, 1400);
    return;
  }
  quizStepPhase.value = "next";
  quizIndex.value += 1;
  selectedOptionIndex.value = null;
  answered.value = false;
  quizFeedback.value = "看完词条后，试着答一题。";
  setTimeout(() => {
    quizStepPhase.value = "choose";
  }, 320);
  showFireworks.value = false;
  isShake.value = false;
  isSuccessGlow.value = false;
  isFailFlash.value = false;
};

const retryQuestion = () => {
  if (quizCompleted.value) {
    return;
  }
  selectedOptionIndex.value = null;
  answered.value = false;
  quizStepPhase.value = "choose";
  quizFeedback.value = "再试一次吧。";
  showFireworks.value = false;
  isShake.value = false;
  isSuccessGlow.value = false;
  isFailFlash.value = false;
};

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem("wikiLearned") || "[]");
    if (Array.isArray(saved)) {
      learnedCategoryIds.value = saved.filter(
        (item) => typeof item === "string",
      );
    }
  } catch {
    learnedCategoryIds.value = [];
  }

  const handleDocumentClick = (event) => {
    const shell = searchShellRef.value;
    if (shell && !shell.contains(event.target)) {
      isSuggestOpen.value = false;
    }
  };

  document.addEventListener("mousedown", handleDocumentClick);

  onBeforeUnmount(() => {
    document.removeEventListener("mousedown", handleDocumentClick);
  });
});
</script>

<style scoped>
.wiki-page {
  min-height: 100vh;
  padding: 96px 0 30px;
  color: #203a22;
  background:
    radial-gradient(
      circle at top left,
      rgba(255, 229, 143, 0.45),
      transparent 30%
    ),
    linear-gradient(180deg, #fbf8ee 0%, #f5f3e4 100%);
  font-family: "STXinwei", "DFKai-SB", "KaiTi", "Microsoft YaHei", serif;
}

.wiki-hero,
.category-strip,
.wiki-grid {
  margin: 0 auto;
}

.wiki-hero {
  display: grid;
  gap: 22px;
  text-align: center;
}

.wiki-hero__top,
.article-head,
.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.wiki-hero__top {
  justify-content: center;
}

.brand-lockup {
  text-align: left;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fff4ba, #c7f08f);
  box-shadow: 0 14px 26px rgba(80, 126, 41, 0.18);
  font-size: 26px;
}

.brand-kicker,
.section-kicker,
.side-kicker,
.entry-label {
  color: #6b7f45;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.brand-lockup h1 {
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1;
  color: #2b5a2d;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.95);
}

.ghost-btn,
.search-btn,
.mini-btn,
.secondary-btn,
.quick-tag,
.category-pill,
.suggest-item,
.quiz-option,
.toc-item {
  border: 0;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.ghost-btn,
.search-btn,
.mini-btn,
.secondary-btn {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  font-weight: 800;
}

.primary-btn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  font-weight: 800;
  color: #fffef5;
  background: linear-gradient(180deg, #6ed44f, #4dac37);
  box-shadow: 0 14px 22px rgba(82, 142, 38, 0.22);
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.85);
  color: #2b5a2d;
  box-shadow: 0 10px 22px rgba(92, 119, 50, 0.12);
}

.hero-summary {
  /* max-width: 900px; */
  padding: 16px 32px;
  border-radius: 18px;
  text-align: center;
  /* background: rgba(255, 255, 255, 0.86); */
  color: #4b614b;
  line-height: 1.8;
  /* box-shadow: 0 10px 24px rgba(88, 121, 49, 0.08); */
}

.search-shell {
  position: relative;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  min-height: 56px;
  border: 2px solid rgba(97, 160, 58, 0.2);
  border-radius: 16px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.95);
  color: #2a4c25;
  font-size: 17px;
  box-shadow: 0 16px 30px rgba(95, 143, 58, 0.12);
  outline: none;
}

.search-btn,
.mini-btn,
.secondary-btn {
  color: #fffef5;
  background: linear-gradient(180deg, #6ed44f, #4dac37);
  box-shadow: 0 14px 22px rgba(82, 142, 38, 0.22);
}

.secondary-btn {
  background: linear-gradient(180deg, #ffd66b, #f3b93d);
  color: #5f3c00;
}

.suggest-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 10px);
  z-index: 5;
  border-radius: 18px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 40px rgba(72, 111, 36, 0.16);
  border: 1px solid rgba(93, 146, 54, 0.12);
}

.suggest-item {
  width: 100%;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-radius: 14px;
  background: transparent;
  text-align: left;
}

.suggest-item:hover {
  background: rgba(115, 212, 82, 0.1);
}

.suggest-label {
  color: #245524;
  font-size: 15px;
  font-weight: 800;
}

.suggest-hint {
  color: #6e8766;
  font-size: 13px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-tag {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #3e6936;
  box-shadow: 0 8px 16px rgba(90, 129, 52, 0.1);
}

.category-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 22px auto 26px;
  justify-content: center;
}

.category-pill {
  padding: 12px 14px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.88);
  color: #31542f;
  box-shadow: 0 8px 18px rgba(89, 122, 49, 0.12);
}

.category-pill.active {
  background: linear-gradient(180deg, #fff6c9, #dff5c3);
  box-shadow: 0 12px 20px rgba(98, 149, 50, 0.18);
}

.category-pill__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  font-size: 18px;
  flex-shrink: 0;
}

.category-pill__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-pill__body strong {
  font-size: 14px;
  line-height: 1.2;
}

.category-pill__body small {
  font-size: 12px;
  opacity: 0.75;
}

.wiki-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.6fr);
  gap: 32px;
  align-items: start;
}

.wiki-main {
  display: grid;
  gap: 24px;
}

.article-card,
.side-card {
  border-radius: 24px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(115, 164, 66, 0.12);
  box-shadow: 0 20px 36px rgba(88, 121, 49, 0.1);
}

.entry-visual {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px;
  align-items: stretch;
}

.entry-figure {
  margin: 0;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f4fbdf);
  border: 1px solid rgba(112, 163, 69, 0.1);
  display: grid;
  gap: 12px;
}

.entry-figure img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

.entry-figure figcaption {
  color: #5a6f4f;
  font-size: 13px;
  font-weight: 600;
}

.entry-definition {
  padding: 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, #fffef5, #eef9d8);
  display: grid;
  gap: 12px;
  align-content: start;
  overflow: hidden;
}

.entry-title {
  color: #1f4d1f;
  font-size: clamp(28px, 3.2vw, 38px);
  margin: 4px 0 6px;
  font-weight: 900;
}

.entry-subtitle {
  color: #4b614b;
  line-height: 1.8;
  font-size: 15px;
  font-weight: 500;
}

.entry-meta {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.meta-item {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(245, 253, 228, 0.96);
}

.meta-item span {
  color: #6b7f45;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.meta-item strong {
  color: #2f552c;
  font-size: 15px;
}

.term-box {
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffef5, #eef9d8);
}

.term-badge {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 6px 6px;
  border-radius: 999px;
  /* background: rgba(118, 214, 87, 0.18); */
  color: #35742d;
  font-size: 20px;
  font-weight: 1000;
}

.term-box p {
  color: #355335;
  font-size: 17px;
  line-height: 1.8;
}

.fact-list {
  display: grid;
  gap: 16px;
}

.wiki-side {
  position: sticky;
  top: 110px;
  align-self: start;
}

.fact-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(245, 253, 228, 0.96);
}

.fact-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  font-size: 18px;
  box-shadow: 0 8px 16px rgba(96, 133, 44, 0.12);
}

.fact-item p,
.quiz-feedback,
.quiz-progress,
.side-card p {
  color: #466346;
  font-size: 15px;
  line-height: 1.8;
  font-weight: 500;
}

.example-block {
  padding: 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f4fbdf);
  border: 1px solid rgba(112, 163, 69, 0.1);
  display: grid;
  gap: 18px;
}

.example-head {
  display: grid;
  gap: 6px;
}

.example-title {
  color: #234f22;
  font-size: 24px;
  font-weight: 900;
}

.example-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: center;
}

.example-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
  box-shadow: 0 10px 20px rgba(88, 121, 49, 0.12);
}

.example-text {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
}

.example-desc {
  color: #3c5a3a;
  font-size: 16px;
  line-height: 1.85;
  font-weight: 500;
}

.example-steps {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff9d8, #edf9ce);
}

.learning-path {
  padding: 24px;
  border-radius: 22px;
  background:
    radial-gradient(
      circle at top left,
      rgba(255, 233, 148, 0.55),
      transparent 45%
    ),
    linear-gradient(180deg, #ffffff, #f6f9ea);
  border: 1px solid rgba(112, 163, 69, 0.16);
  display: grid;
  gap: 20px;
}

.learning-head {
  display: grid;
  gap: 8px;
}

.learning-title {
  color: #1f4a1e;
  font-size: clamp(20px, 2.3vw, 26px);
  font-weight: 900;
  letter-spacing: 0.3px;
}

.learning-subtitle {
  color: #5a7052;
  font-size: 14px;
  line-height: 1.6;
}

.path-track {
  display: grid;
  gap: 14px;
}

.path-step {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f7faef);
  box-shadow:
    inset 0 0 0 1px rgba(123, 181, 68, 0.14),
    0 10px 20px rgba(88, 121, 49, 0.1);
}

.path-step--unlock {
  grid-template-columns: auto 1fr auto;
  background: linear-gradient(180deg, #fff7d6, #eef6d9);
  box-shadow:
    inset 0 0 0 1px rgba(152, 186, 88, 0.18),
    0 12px 24px rgba(110, 142, 54, 0.16);
}

.path-index {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, #ffffff, #d9f7b7);
  color: #2e5f26;
  font-size: 15px;
  font-weight: 900;
  box-shadow: 0 8px 16px rgba(96, 133, 44, 0.16);
}

.path-content strong {
  display: block;
  color: #214321;
  font-size: 16px;
  font-weight: 900;
  margin-bottom: 4px;
}

.path-content p {
  color: #53664d;
  font-size: 14px;
  line-height: 1.6;
}

.quiz-entry {
  border: 2px dashed rgba(120, 170, 62, 0.35);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), #fff7da);
}

.quiz-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff7d9, #ecf8c9);
  box-shadow: inset 0 0 0 1px rgba(149, 194, 84, 0.2);
}

.quiz-hero__icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(150deg, #fff1a6, #c6f08c);
  font-size: 26px;
  box-shadow: 0 12px 22px rgba(98, 147, 52, 0.22);
  animation: quizPulse 1.8s ease-in-out infinite;
}

.quiz-hero__content {
  flex: 1;
  display: grid;
  gap: 6px;
}

.quiz-hero p {
  color: #4b614b;
  line-height: 1.7;
}

.quiz-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.quiz-lock-hint {
  color: #a15a1f;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 214, 107, 0.3);
  box-shadow: inset 0 0 0 1px rgba(230, 176, 76, 0.35);
}

.quiz-complete {
  color: #2f5a2b;
  font-size: 14px;
  font-weight: 800;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(118, 214, 87, 0.18);
  box-shadow: inset 0 0 0 1px rgba(118, 214, 87, 0.28);
}

.quiz-actions .mini-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

.quiz-modal {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 18, 0.4);
  display: grid;
  place-items: center;
  z-index: 999;
}

.quiz-confirm {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 18, 0.42);
  display: grid;
  place-items: center;
  z-index: 998;
}

.quiz-confirm__panel {
  width: min(420px, 86vw);
  border-radius: 22px;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff, #f6ffe5);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: grid;
  gap: 12px;
  text-align: center;
}

.quiz-confirm__icon {
  width: 62px;
  height: 62px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 2px;
  font-size: 28px;
  background: linear-gradient(160deg, #fff6b0, #dff7a9);
  box-shadow: 0 12px 22px rgba(104, 151, 52, 0.2);
}

.quiz-confirm__panel h3 {
  margin: 0;
  color: #214321;
  font-size: 21px;
  font-weight: 900;
}

.quiz-confirm__panel p {
  margin: 0;
  color: #51674b;
  font-size: 14px;
  line-height: 1.6;
}

.quiz-confirm__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.quiz-steps {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  color: #587050;
  font-size: 13px;
  font-weight: 700;
}

.quiz-steps span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(116, 205, 86, 0.12);
  box-shadow: inset 0 0 0 1px rgba(116, 205, 86, 0.18);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.quiz-steps span.active {
  background: rgba(116, 205, 86, 0.24);
  box-shadow:
    inset 0 0 0 1px rgba(116, 205, 86, 0.28),
    0 10px 18px rgba(86, 143, 46, 0.18);
  transform: translateY(-1px);
}

.quiz-modal__panel {
  width: min(720px, 92vw);
  border-radius: 24px;
  padding: 22px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  transition:
    box-shadow 0.35s ease,
    background 0.35s ease;
}

.quiz-modal__panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 97, 97, 0.25);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}

.quiz-modal__panel > * {
  position: relative;
  z-index: 1;
}

.quiz-modal__panel.success-glow {
  background: linear-gradient(180deg, #ffffff, #f6ffe0);
  box-shadow:
    0 0 0 2px rgba(120, 210, 86, 0.28),
    0 28px 66px rgba(78, 140, 42, 0.26);
}

.quiz-modal__panel.fail-flash::before {
  animation: failFlash 0.6s ease;
}

.quiz-modal__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.quiz-modal__panel.shake {
  animation: shake 0.4s ease;
}

@keyframes quizPulse {
  0% {
    transform: scale(1);
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes failFlash {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  50% {
    transform: translateX(8px);
  }
  75% {
    transform: translateX(-6px);
  }
  100% {
    transform: translateX(0);
  }
}

.fireworks {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.fireworks span {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffd04d;
  animation: pop 1.2s ease-out;
}

.fireworks span:nth-child(1) {
  left: 18%;
  top: 18%;
  background: #ff8a5b;
}

.fireworks span:nth-child(2) {
  left: 70%;
  top: 20%;
  background: #ffd24d;
}

.fireworks span:nth-child(3) {
  left: 40%;
  top: 55%;
  background: #8de25d;
}

.fireworks span:nth-child(4) {
  left: 72%;
  top: 60%;
  background: #ff6f91;
}

.fireworks span:nth-child(5) {
  left: 28%;
  top: 70%;
  background: #7bdff2;
}

@keyframes pop {
  0% {
    transform: scale(0.2);
    opacity: 0;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.step-list {
  list-style: none;
  display: grid;
  gap: 16px;
}

.step-flow {
  position: relative;
  padding-left: 10px;
}

.step-flow::before {
  content: "";
  position: absolute;
  left: 27px;
  top: 12px;
  bottom: 12px;
  width: 3px;
  background: linear-gradient(180deg, #8bd36a, rgba(139, 211, 106, 0.15));
  border-radius: 999px;
}

.step-flow li {
  position: relative;
}

/* .step-flow li:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 40px;
  top: 50%;
  width: 18px;
  height: 2px;
  background: rgba(120, 170, 62, 0.55);
  transform: translateY(-50%);
} */

.step-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 1px rgba(123, 181, 68, 0.12);
}

.step-list li span {
  width: 30px;
  height: 30px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff, #def4c2);
  color: #3f6f2d;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(96, 133, 44, 0.18);
}

.step-list li strong {
  color: #325330;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 800;
}

.quiz-panel {
  display: grid;
  gap: 20px;
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f4fbdf);
  border: 1px solid rgba(112, 163, 69, 0.1);
}

.quiz-progress-shell {
  display: grid;
  gap: 8px;
}

.quiz-progress-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(110, 210, 79, 0.12);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(110, 210, 79, 0.18);
}

.quiz-progress-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #7fe35d, #4dac37);
  border-radius: 999px;
  transition: width 0.25s ease;
}

.quiz-progress {
  display: inline-flex;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(110, 210, 79, 0.14);
  color: #407139;
  font-size: 12px;
  font-weight: 900;
}

.quiz-question {
  color: #284b27;
  font-size: clamp(22px, 2.4vw, 28px);
  line-height: 1.5;
  font-weight: 900;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.quiz-option {
  min-height: 58px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff;
  color: #325330;
  font-size: 17px;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(106, 151, 63, 0.14);
}

.quiz-option.selected {
  background: rgba(107, 213, 83, 0.18);
}

.quiz-option.correct {
  background: rgba(95, 199, 67, 0.26);
  box-shadow: inset 0 0 0 2px rgba(71, 162, 44, 0.32);
}

.quiz-option.wrong {
  background: rgba(255, 188, 171, 0.34);
  box-shadow: inset 0 0 0 2px rgba(222, 121, 92, 0.26);
}

.side-card {
  display: grid;
  gap: 12px;
}

.toc-list {
  display: grid;
  gap: 8px;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  color: #2f5a2b;
  font-weight: 800;
  text-align: left;
}

.toc-item.active {
  background: linear-gradient(180deg, #fff6c9, #dff5c3);
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword-chip {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(118, 214, 87, 0.12);
  color: #2f6627;
  font-size: 13px;
  font-weight: 800;
}

.learn-status {
  display: flex;
  align-items: center;
  gap: 14px;
}

.learn-badge {
  width: 66px;
  height: 66px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  color: #b09b2c;
  font-size: 30px;
  box-shadow: 0 12px 24px rgba(110, 144, 52, 0.12);
}

.learn-badge.active {
  background: linear-gradient(180deg, #fff5b9, #dbff9f);
  color: #de9e00;
}

.learn-status strong {
  display: block;
  color: #2b5a28;
  font-size: 18px;
  margin-bottom: 4px;
}

.learn-status p {
  color: #65815e;
  font-size: 14px;
  line-height: 1.6;
}

.learn-progress {
  height: 10px;
  border-radius: 999px;
  background: rgba(110, 210, 79, 0.12);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(110, 210, 79, 0.18);
}

.learn-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #7fe35d, #4dac37);
  border-radius: 999px;
  transition: width 0.25s ease;
}

.learn-list {
  display: grid;
  gap: 8px;
}

.learn-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #4c6947;
  font-weight: 700;
}

.learn-item em {
  font-style: normal;
  font-size: 12px;
  color: #7a8d6f;
}

.learn-item.active {
  background: linear-gradient(180deg, #fff6c9, #dff5c3);
  color: #2f5a2b;
}

.learn-item.active em {
  color: #3b6a31;
}

.learn-action {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.learn-toast {
  color: #2f5a2b;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(118, 214, 87, 0.2);
  box-shadow: inset 0 0 0 1px rgba(118, 214, 87, 0.28);
}

@media (max-width: 1220px) {
  .wiki-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 920px) {
  .wiki-hero__top,
  .article-head,
  .entry-header {
    flex-wrap: wrap;
  }

  .entry-visual {
    grid-template-columns: 1fr;
  }

  .search-shell {
    flex-wrap: wrap;
  }

  .search-btn {
    width: 100%;
  }

  .example-body,
  .quiz-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .wiki-page {
    padding: 88px 14px 24px;
  }

  .brand-icon {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    font-size: 22px;
  }

  .brand-lockup h1 {
    font-size: 30px;
  }

  .article-card,
  .side-card {
    border-radius: 22px;
    padding: 18px;
  }
}
</style>
