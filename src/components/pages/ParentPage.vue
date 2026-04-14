<template>
  <div class="practice-page">
    <header class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">亲子实践营</p>
        <h2>🤝 亲子实践营</h2>
        <p class="hero-desc">
          连接虚拟农耕与真实实践，和家长一起完成在家、户外都能开展的农耕任务，
          用动手记录把知识变成成长。
        </p>
      </div>

      <div class="hero-actions">
        <button class="ghost-btn" type="button" @click="showPage('home')">
          返回
        </button>
        <button
          class="action-btn"
          type="button"
          @click="openDrawer('myPractice')"
        >
          我的实践
        </button>
        <button
          class="action-btn accent"
          type="button"
          @click="openDrawer('exchange')"
        >
          任务兑换
        </button>
      </div>

      <div class="hero-side">
        <div class="hero-challenge-card">
          <div class="challenge-card-head">
            <span class="challenge-pill">本月主题挑战</span>
            <strong>{{ themeChallenge.title }}</strong>
          </div>
          <p>{{ themeChallenge.description }}</p>
          <div class="challenge-progress compact top">
            <span
              v-for="n in 3"
              :key="n"
              :class="{ active: n <= themeBadges }"
              >{{ n <= themeBadges ? "🏅" : "◌" }}</span
            >
          </div>
          <div class="challenge-status compact top">
            <strong>{{ challengeStatusText }}</strong>
            <p>累计 {{ themeBadges }}/3 枚主题勋章即可解锁亲子农耕达人。</p>
          </div>
        </div>

        <div class="hero-overview-card">
          <div class="hero-overview-head">
            <div>
              <span class="challenge-pill">实践概览</span>
              <strong>{{ practicePoints }} 积分进度</strong>
            </div>
            <p>
              把当前进度、完成任务和勋章收获展开显示，方便家长一眼看懂孩子最近做了什么。
            </p>
          </div>

          <div class="hero-overview-grid">
            <article>
              <strong>{{ activeTaskCount }}</strong>
              <span>进行中任务</span>
              <p v-if="activeTaskCount">
                已领取但尚未完成的实践，别忘了在倒计时结束前上传。
              </p>
              <p v-else>当前没有进行中的任务，可以先从任务列表领取一项。</p>
            </article>
            <article>
              <strong>{{ completedTaskCount }}</strong>
              <span>已完成任务</span>
              <p v-if="completedTaskHighlights.length">
                {{ completedTaskHighlights[0].name }} 等
                {{ completedTaskCount }} 项任务已完成。
              </p>
              <p v-else>完成并上传后，这里会逐条展开显示具体任务。</p>
            </article>
          </div>

          <div class="hero-detail-list">
            <div class="hero-detail-block">
              <p class="hero-detail-label">完成了哪些任务</p>
              <template v-if="completedTaskHighlights.length">
                <div class="hero-timeline">
                  <article>
                    <span class="timeline-dot done"></span>
                    <div>
                      <strong>{{ completedTaskHighlights[0].name }}</strong>
                      <p>
                        {{ completedTaskHighlights[0].badge }} ·
                        {{ completedTaskHighlights[0].reward }}积分 ·
                        {{ completedTaskHighlights[0].completedAt }}
                      </p>
                    </div>
                  </article>
                  <article
                    v-for="task in completedTaskHighlights.slice(1)"
                    :key="task.id"
                  >
                    <span class="timeline-dot"></span>
                    <div>
                      <strong>{{ task.name }}</strong>
                      <p>
                        {{ task.badge }} · {{ task.reward }}积分 ·
                        {{ task.completedAt }}
                      </p>
                    </div>
                  </article>
                </div>
              </template>
              <p v-else class="hero-detail-empty">
                当前还没有已完成任务，完成一次上传后会在这里展开。
              </p>
            </div>

            <div class="hero-detail-block">
              <p class="hero-detail-label">获得了哪些勋章</p>
              <template v-if="earnedBadgeHighlights.length">
                <div class="hero-timeline badges">
                  <article
                    v-for="badge in earnedBadgeHighlights"
                    :key="badge.name"
                  >
                    <span class="timeline-dot badge"></span>
                    <span class="hero-badge-icon">{{ badge.icon }}</span>
                    <div>
                      <strong>{{ badge.name }}</strong>
                      <p>{{ badge.source }} · {{ badge.timeLabel }}</p>
                    </div>
                  </article>
                </div>
              </template>
              <p v-else class="hero-detail-empty">
                完成任务后，获得的勋章会在这里逐条展示。
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="layout-grid">
      <aside class="category-panel">
        <div class="section-label">任务分类导航</div>
        <button
          v-for="category in categories"
          :key="category.key"
          class="category-item"
          :class="{ active: activeCategory === category.key }"
          type="button"
          @click="activeCategory = category.key"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.label }}</span>
          <span class="category-count">{{ categoryCounts[category.key] }}</span>
        </button>
      </aside>

      <main class="main-stage">
        <section class="task-workbench">
          <div class="task-workbench-head">
            <div>
              <p class="section-kicker">任务工作台</p>
              <h3>{{ activeCategoryLabel }}</h3>
            </div>
            <p class="section-hint">
              左侧选择任务，右侧立即查看详情和操作。领取任务后可以直接在详情区上传成果。
            </p>
          </div>

          <div class="task-workbench-body">
            <section class="task-panel">
              <div class="section-heading compact">
                <div>
                  <p class="section-kicker">任务列表</p>
                  <h3>待完成任务</h3>
                </div>
                <span class="feed-count">{{ visibleTasks.length }} 个任务</span>
              </div>

              <div v-if="selectedTask" class="task-focus-bar">
                <div class="task-focus-main">
                  <p class="task-focus-label">当前选中任务</p>
                  <h4>{{ selectedTask.name }}</h4>
                  <p>{{ selectedTask.intro }}</p>
                </div>

                <div class="task-focus-meta">
                  <span>{{ selectedTask.reward }}积分</span>
                  <span>{{ selectedTask.materials.length }} 种材料</span>
                  <span class="status-pill" :class="selectedTask.status">{{
                    statusLabel(selectedTask.status)
                  }}</span>
                </div>
              </div>

              <div class="task-list">
                <article
                  v-for="task in visibleTasks"
                  :key="task.id"
                  class="task-card"
                  :class="{
                    selected: selectedTaskId === task.id,
                    completed: task.status === 'completed',
                    'in-progress': task.status === 'in-progress',
                  }"
                  @click="selectTask(task.id)"
                >
                  <div class="task-head">
                    <span class="task-icon">{{ task.icon }}</span>
                    <span class="difficulty-tag">{{ task.difficulty }}</span>
                  </div>

                  <h4>{{ task.name }}</h4>
                  <p class="task-intro">{{ task.intro }}</p>

                  <div class="task-meta-row">
                    <span>{{ task.reward }}积分</span>
                    <span>{{ task.materials.length }} 种材料</span>
                  </div>

                  <div class="task-state-row">
                    <span class="status-pill" :class="task.status">{{
                      statusLabel(task.status)
                    }}</span>
                    <span
                      class="countdown"
                      v-if="task.status === 'in-progress'"
                      >{{ remainingLabel(task) }}</span
                    >
                    <span
                      class="countdown expired"
                      v-else-if="task.status === 'expired'"
                      >已失效，可重新领取</span
                    >
                  </div>

                  <button
                    class="card-btn"
                    type="button"
                    @click.stop="startTask(task.id)"
                  >
                    {{ taskActionLabel(task) }}
                  </button>
                </article>
              </div>
            </section>

            <section class="detail-panel" v-if="selectedTask">
              <div class="section-heading compact">
                <div>
                  <p class="section-kicker">任务详情</p>
                  <h3>{{ selectedTask.name }}</h3>
                </div>
                <span class="detail-badge">{{ selectedTask.difficulty }}</span>
              </div>

              <div class="detail-grid">
                <div class="detail-main">
                  <p class="detail-summary">{{ selectedTask.detail }}</p>

                  <div class="detail-block">
                    <h4>实践步骤</h4>
                    <ol>
                      <li v-for="step in selectedTask.steps" :key="step">
                        {{ step }}
                      </li>
                    </ol>
                  </div>
                </div>

                <div class="detail-side">
                  <div class="detail-block soft">
                    <h4>所需材料</h4>
                    <ul class="chip-list">
                      <li
                        v-for="material in selectedTask.materials"
                        :key="material"
                      >
                        {{ material }}
                      </li>
                    </ul>
                  </div>

                  <div class="detail-block soft">
                    <h4>任务奖励</h4>
                    <p>
                      {{ selectedTask.reward }} 实践积分 +
                      {{ selectedTask.badge }}
                    </p>
                    <p class="mini-note">{{ selectedTask.note }}</p>
                  </div>

                  <div class="detail-block soft">
                    <h4>领取进度</h4>
                    <p>{{ progressText(selectedTask) }}</p>
                    <p
                      class="mini-note"
                      v-if="selectedTask.status === 'in-progress'"
                    >
                      {{ remainingLabel(selectedTask) }}
                    </p>
                    <p
                      class="mini-note warning"
                      v-else-if="selectedTask.status === 'expired'"
                    >
                      任务已失效，点击“重新领取”即可重开。
                    </p>
                  </div>
                </div>
              </div>

              <div class="detail-actions">
                <button
                  class="action-btn"
                  type="button"
                  @click="startTask(selectedTask.id)"
                >
                  {{ taskActionLabel(selectedTask) }}
                </button>
                <button
                  class="ghost-btn"
                  type="button"
                  @click="openUploadModal"
                >
                  上传成果
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>
    </section>

    <section class="bottom-board">
      <section class="share-banner">
        <div class="share-banner-copy">
          <p class="section-kicker">分享墙</p>
          <h3>亲子实践成果墙</h3>
          <p>
            先来看看大家做了什么小任务，下面是一串热热闹闹的家庭小作品，边看边感受动手的快乐。
          </p>
          <div class="share-banner-chips">
            <span>一起玩</span>
            <span>一起做</span>
            <span>一起收获小开心</span>
          </div>
        </div>

        <div class="share-banner-story">
          <p class="share-banner-story-title">来看看小作品</p>
          <p>
            现在已经有 {{ sharePostCount }} 个家庭来分享啦，收集了
            {{ shareMediaCount }} 份照片和视频，也收到了
            {{ totalShareLikes }}
            份鼓励。继续往下翻，就能看到每个家庭完成了哪一个任务。
          </p>
        </div>
      </section>

      <div class="share-grid">
        <section class="feed-card">
          <div class="share-flow-head">
            <div>
              <p class="section-kicker">分享墙</p>
              <h4>一起看看大家怎么把任务变成小作品</h4>
              <p>
                这里不是单纯的展示列表，而是一条暖暖的家庭小故事，任务、过程、成果和点赞都在这里排队等你看。
              </p>
            </div>
            <span class="feed-count">{{ communityPosts.length }} 条动态</span>
          </div>

          <article
            v-for="post in communityPosts"
            :key="post.id"
            class="feed-item"
          >
            <header class="feed-head">
              <div class="feed-author">
                <span class="feed-avatar">{{ post.avatar }}</span>
                <div>
                  <strong>{{ post.author }}</strong>
                  <p>{{ post.timeLabel }}</p>
                </div>
              </div>
              <div class="feed-head-tags">
                <span class="feed-tag">{{ post.tag }}</span>
                <span class="feed-task-tag">{{ post.taskName }}</span>
              </div>
            </header>

            <div class="feed-meta-row">
              <span>{{ postMediaSummary(post) }}</span>
              <span>{{ post.comments.length }} 条评论</span>
            </div>

            <p class="feed-text">{{ post.description }}</p>

            <div class="feed-media">
              <img
                v-for="photo in post.photos"
                :key="photo"
                :src="photo"
                alt="实践照片"
              />

              <div v-if="post.videoUrl || post.videoLabel" class="video-card">
                <video
                  v-if="post.videoUrl"
                  :src="post.videoUrl"
                  autoplay
                  muted
                  loop
                  playsinline
                ></video>
                <div v-else class="video-placeholder">
                  <span>🎬</span>
                  <strong>{{ post.videoLabel }}</strong>
                </div>
              </div>
            </div>

            <footer class="feed-actions">
              <span class="feed-task-note">完成任务 · {{ post.taskName }}</span>
              <button
                type="button"
                class="like-action"
                :class="{ liked: post.likedByUser }"
                @click="toggleLike(post)"
              >
                <span class="like-action-icon">{{
                  post.likedByUser ? "❤️" : "🤍"
                }}</span>
                <span class="like-action-text">{{
                  post.likedByUser ? "已点赞" : "点赞"
                }}</span>
                <strong>{{ post.likes }}</strong>
              </button>
            </footer>

            <div class="comment-list">
              <article
                v-for="comment in post.comments"
                :key="comment.id"
                class="comment-item"
              >
                <strong>{{ comment.name }}</strong>
                <p>{{ comment.text }}</p>
              </article>
            </div>

            <div class="comment-form">
              <input
                v-model.trim="commentDrafts[post.id]"
                type="text"
                placeholder="说点鼓励的话吧"
              />
              <button type="button" @click="addComment(post)">评论</button>
            </div>
          </article>
        </section>
      </div>
    </section>

    <transition name="drawer-fade">
      <div
        v-if="drawerVisible"
        class="drawer-backdrop"
        @click.self="closeDrawer"
      >
        <aside class="module-drawer" role="dialog" aria-modal="true">
          <header class="drawer-head">
            <div>
              <p class="section-kicker">功能抽屉</p>
              <h3>
                {{ drawerTab === "myPractice" ? "我的实践" : "任务兑换" }}
              </h3>
            </div>
            <button class="close-btn" type="button" @click="closeDrawer">
              ×
            </button>
          </header>

          <div class="drawer-tabs" role="tablist" aria-label="实践功能切换">
            <button
              class="drawer-tab"
              :class="{ active: drawerTab === 'myPractice' }"
              type="button"
              @click="drawerTab = 'myPractice'"
            >
              我的实践
            </button>
            <button
              class="drawer-tab"
              :class="{ active: drawerTab === 'exchange' }"
              type="button"
              @click="drawerTab = 'exchange'"
            >
              任务兑换
            </button>
          </div>

          <div class="drawer-scroll">
            <section v-if="drawerTab === 'myPractice'" class="drawer-section">
              <p class="drawer-copy">
                查看已完成、进行中和未完成的实践记录，方便家长和儿童回顾参与过程。
              </p>

              <div class="practice-summary">
                <div>
                  <strong>{{ practicePoints }}</strong
                  ><span>当前积分</span>
                </div>
                <div>
                  <strong>{{ completedTaskCount }}</strong
                  ><span>完成记录</span>
                </div>
                <div>
                  <strong>{{ themeBadges }}</strong
                  ><span>主题勋章</span>
                </div>
              </div>

              <div class="record-list">
                <article
                  v-for="task in practiceRecords"
                  :key="task.id"
                  class="record-item"
                >
                  <div>
                    <h4>{{ task.name }}</h4>
                    <p>{{ task.statusText }}</p>
                  </div>
                  <span>{{ task.reward }}分</span>
                </article>
              </div>

              <div
                class="badge-box"
                :class="{ unlocked: parentFarmerUnlocked }"
              >
                <p>亲子农耕达人</p>
                <strong>{{
                  parentFarmerUnlocked ? "已解锁" : `${themeBadges}/3`
                }}</strong>
                <span>累计 3 个主题勋章即可解锁</span>
              </div>
            </section>

            <section v-else class="drawer-section">
              <p class="drawer-copy">
                用实践积分兑换农耕种子、卡通农具模型等小礼品，兑换后会记录寄送信息。
              </p>

              <div class="redeem-form">
                <label>
                  收件人
                  <input
                    v-model.trim="redeemForm.name"
                    type="text"
                    placeholder="请输入姓名"
                  />
                </label>
                <label>
                  联系电话
                  <input
                    v-model.trim="redeemForm.phone"
                    type="tel"
                    placeholder="请输入电话"
                  />
                </label>
                <label>
                  邮寄地址
                  <textarea
                    v-model.trim="redeemForm.address"
                    rows="3"
                    placeholder="请输入详细地址"
                  ></textarea>
                </label>
              </div>

              <div class="reward-list">
                <button
                  v-for="item in redeemItems"
                  :key="item.id"
                  class="reward-item"
                  type="button"
                  :disabled="practicePoints < item.cost"
                  @click="redeemGift(item)"
                >
                  <span>{{ item.icon }}</span>
                  <div>
                    <strong>{{ item.name }}</strong>
                    <p>{{ item.cost }} 积分</p>
                  </div>
                </button>
              </div>

              <div class="history-box">
                <h4>兑换记录</h4>
                <p v-if="!redemptionHistory.length">暂无兑换记录</p>
                <article
                  v-for="item in redemptionHistory"
                  :key="item.id"
                  class="history-item"
                >
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.createdAt }} · {{ item.address }}</p>
                </article>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </transition>

    <transition name="modal-fade">
      <div
        v-if="uploadModalVisible"
        class="modal-backdrop"
        @click.self="closeUploadModal"
      >
        <section class="upload-modal" role="dialog" aria-modal="true">
          <header class="modal-head">
            <div>
              <p class="section-kicker">上传成果</p>
              <h3>亲子实践上传窗</h3>
            </div>
            <button class="close-btn" type="button" @click="closeUploadModal">
              ×
            </button>
          </header>

          <div class="upload-modal-body">
            <label>
              文字说明
              <textarea
                v-model.trim="uploadForm.description"
                rows="4"
                placeholder="写下你和家人的实践过程与收获"
              ></textarea>
            </label>

            <div class="upload-media-grid">
              <section class="upload-media-card">
                <div class="upload-media-head">
                  <div>
                    <strong>图片上传</strong>
                    <p>可一次选择多张，上传后直接显示缩略图。</p>
                  </div>
                  <label class="upload-media-btn">
                    选择图片
                    <input
                      ref="photoInput"
                      type="file"
                      accept="image/*"
                      multiple
                      @change="onPhotoChange"
                    />
                  </label>
                </div>

                <div
                  v-if="uploadPhotoPreviews.length"
                  class="upload-preview-grid image"
                >
                  <article
                    v-for="(photo, index) in uploadPhotoPreviews"
                    :key="`${uploadForm.photoNames[index] || 'photo'}-${index}`"
                    class="upload-preview-item"
                  >
                    <img :src="photo" alt="图片预览" />
                  </article>
                </div>
              </section>
            </div>

            <div class="progress-wrap" v-if="isUploading">
              <div class="progress-bar">
                <span :style="{ width: `${uploadProgress}%` }"></span>
              </div>
              <p>上传进度 {{ uploadProgress }}%</p>
            </div>
          </div>

          <footer class="modal-actions">
            <button class="ghost-btn" type="button" @click="closeUploadModal">
              取消
            </button>
            <button
              class="action-btn"
              type="button"
              @click="submitUpload"
              :disabled="isUploading"
            >
              上传成果
            </button>
          </footer>

          <div class="upload-tip modal-tip">
            上传成功后会根据上传的任务自动记录实践积分。
          </div>
        </section>
      </div>
    </transition>

    <transition name="toast-fade">
      <div v-if="toast.visible" class="toast-box">{{ toast.message }}</div>
    </transition>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { showPage } from "../../store";
import sharePhotoOne from "../../assets/images/parentpage/salad.jpg";
import sharePhotoTwo from "../../assets/images/parentpage/flower.jpg";

const STORAGE_KEY = "parent-practice-center-v1";
const SEVEN_DAY_MS = 7 * 24 * 60 * 60 * 1000;

const categories = [
  { key: "kitchen", label: "粮食启蒙厨房", icon: "🍚" },
  { key: "journal", label: "农耕观察日记", icon: "📔" },
  { key: "public", label: "农耕公益小任务", icon: "🌱" },
  { key: "craft", label: "手工制作", icon: "✂️" },
];

const baseTasks = [
  {
    id: 1,
    category: "kitchen",
    icon: "🥕",
    name: "认识家里的蔬菜篮",
    difficulty: "亲子入门",
    intro: "和爸爸妈妈一起识别 5 种常见蔬菜，记录它们的颜色、形状和吃法。",
    detail: "把餐桌变成一个小小农耕课堂，让孩子在生活里认识粮食和蔬菜的来源。",
    steps: [
      "一起整理家里的蔬菜篮",
      "挑选 5 种蔬菜进行观察",
      "记录颜色、气味和用途",
      "拍照做一张蔬菜识别卡",
    ],
    materials: ["蔬菜篮", "彩笔", "记录纸", "手机或相机"],
    reward: 30,
    badge: "粮食观察徽章",
    note: "适合 15 分钟完成，强调观察和表达。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 2,
    category: "kitchen",
    icon: "🍓",
    name: "亲子水果沙拉工坊",
    difficulty: "轻松进阶",
    intro: "动手做一份水果沙拉，认识水果的季节与营养，让孩子参与洗、切、摆盘。",
    detail:
      "通过实际制作，让孩子理解“从田地到餐桌”的过程，并练习安全使用厨具。",
    steps: [
      "挑选 3 种当季水果",
      "在家长协助下清洗和切配",
      "按颜色搭配摆出沙拉造型",
      "一起品尝并记录口感",
    ],
    materials: ["当季水果", "沙拉碗", "儿童安全刀", "牙签或勺子"],
    reward: 40,
    badge: "厨房小帮手徽章",
    note: "建议家长全程陪同，注意刀具安全。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 3,
    category: "journal",
    icon: "🌿",
    name: "阳台小苗观察日记",
    difficulty: "耐心养成",
    intro: "在阳台种下一盆小绿植，连续观察 7 天，记录它每天的变化。",
    detail: "让孩子学会等待、记录和对比，建立植物生长的基本概念。",
    steps: [
      "准备种子或小苗",
      "每天固定时间观察",
      "记录叶片、土壤和光照",
      "完成 7 天观察表",
    ],
    materials: ["花盆", "土壤", "种子或小苗", "浇水壶"],
    reward: 50,
    badge: "观察记录徽章",
    note: "适合连续打卡，培养责任感。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 4,
    category: "journal",
    icon: "🌦️",
    name: "天气与作物观察卡",
    difficulty: "科学启蒙",
    intro: "把天气变化和作物生长联系起来，学会用小实验理解“光照、雨水和温度”。",
    detail: "通过观察与记录，帮助孩子理解自然环境如何影响农作物。",
    steps: [
      "选择一种作物作为观察对象",
      "记录今天的天气",
      "比较晴天和雨天的变化",
      "完成一张天气观察卡",
    ],
    materials: ["观察卡", "彩笔", "贴纸", "天气记录表"],
    reward: 45,
    badge: "自然观察徽章",
    note: "非常适合亲子共读与口头分享。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 5,
    category: "public",
    icon: "🧤",
    name: "社区护绿小行动",
    difficulty: "公益实践",
    intro:
      "和家长一起打扫社区花坛、清理落叶或为小树浇水，做一个小小护绿志愿者。",
    detail: "让孩子体验“参与公共环境维护”这件事，培养责任感和公益意识。",
    steps: [
      "查看周边可参与的护绿地点",
      "准备手套和小工具",
      "完成 10 分钟整理",
      "拍照记录前后变化",
    ],
    materials: ["手套", "垃圾袋", "小水壶", "湿巾"],
    reward: 55,
    badge: "公益小卫士徽章",
    note: "请在安全区域内开展，注意家长陪同。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 6,
    category: "public",
    icon: "🪵",
    name: "爱粮节粮宣传牌",
    difficulty: "亲子合作",
    intro: "制作一块节粮宣传牌，提醒家人珍惜每一粒粮食。",
    detail: "让孩子把“光盘行动”变成可以看见、可以分享的家庭行动。",
    steps: [
      "和家长商量宣传语",
      "设计版面与图案",
      "完成手工制作",
      "张贴到厨房或餐桌旁",
    ],
    materials: ["卡纸", "彩笔", "剪刀", "胶水"],
    reward: 35,
    badge: "节粮传播徽章",
    note: "适合家庭共创展示。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 7,
    category: "craft",
    icon: "🌻",
    name: "种子贴画小课堂",
    difficulty: "创意手工",
    intro: "用种子、豆子和谷物拼贴出农作物图案，完成一张有触感的贴画。",
    detail: "用艺术方式认识种子的形状和质感，提升孩子的动手能力。",
    steps: [
      "准备不同颜色的种子",
      "在纸上画出轮廓",
      "按区域逐步粘贴",
      "写下作品名称和感受",
    ],
    materials: ["种子若干", "白纸", "胶水", "铅笔"],
    reward: 60,
    badge: "创意手作徽章",
    note: "作品完成后可以上传到分享区。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
  {
    id: 8,
    category: "craft",
    icon: "🪻",
    name: "卡通农具模型手作",
    difficulty: "动手达人",
    intro: "用纸盒、瓶盖和木棒做一个卡通农具模型，让孩子认识真实农具的用途。",
    detail: "通过模型制作，把农具认知变成一场家庭创作。",
    steps: [
      "观察一种真实农具",
      "收集废旧材料",
      "按结构完成拼装",
      "给模型命名并展示",
    ],
    materials: ["纸盒", "瓶盖", "木棒", "胶带"],
    reward: 70,
    badge: "模型创作徽章",
    note: "鼓励家长和孩子分工合作完成。",
    status: "idle",
    startedAt: null,
    deadlineAt: null,
    completedAt: null,
  },
];

const samplePosts = [
  {
    id: 101,
    author: "涵涵和妈妈",
    avatar: "👩‍🌾",
    tag: "粮食启蒙厨房",
    taskName: "亲子水果沙拉工坊",
    description:
      "我们一起做了水果沙拉，孩子负责摆盘，第一次知道了当季水果也有不同颜色。",
    photos: [sharePhotoOne],
    likes: 24,
    likedByUser: false,
    timeLabel: "2 小时前",
    comments: [
      { id: "101-1", name: "朵朵家", text: "摆盘颜色好漂亮，想学！" },
      { id: "101-2", name: "小安", text: "这个周末也要和妈妈一起做。" },
    ],
  },
  {
    id: 102,
    author: "乐乐和爸爸",
    avatar: "👨‍👧",
    tag: "农耕观察日记",
    taskName: "阳台小苗观察日记",
    description: "在阳台给小苗换了新花盆，记录到第 4 天时发现叶子真的长大了！",
    photos: [sharePhotoTwo],
    likes: 18,
    likedByUser: false,
    timeLabel: "昨天",
    comments: [
      { id: "102-1", name: "晴晴家", text: "坚持记录很棒，期待后面的变化。" },
    ],
  },
];
const redeemItems = [
  { id: 1, name: "农耕种子礼包", icon: "🌱", cost: 80 },
  { id: 2, name: "卡通农具模型", icon: "🧰", cost: 120 },
  { id: 3, name: "实践小徽章套装", icon: "🎖️", cost: 150 },
];

const themeChallenge = {
  title: "四月春耕挑战",
  description:
    "家长和儿童共同完成 3 次亲子实践打卡，累计 3 枚主题勋章可解锁“亲子农耕达人”称号。",
};

const activeCategory = ref("kitchen");
const drawerVisible = ref(false);
const drawerTab = ref("myPractice");
const selectedTaskId = ref(baseTasks[0].id);
const practicePoints = ref(120);
const themeBadges = ref(0);
const redemptionHistory = ref([]);
const toast = reactive({ visible: false, message: "" });
const redeemForm = reactive({ name: "", phone: "", address: "" });
const uploadForm = reactive({
  description: "",
  photoNames: [],
  videoName: "",
  videoDuration: 0,
});
const commentDrafts = reactive({});
const isUploading = ref(false);
const uploadProgress = ref(0);
const now = ref(Date.now());
const uploadModalVisible = ref(false);
const photoInput = ref(null);
const videoInput = ref(null);
const uploadPhotoPreviews = ref([]);
const uploadVideoFile = ref(null);
const uploadVideoPreview = ref("");
let timerId = null;
let toastTimer = null;

const tasks = reactive(baseTasks.map((task) => ({ ...task })));
const communityPosts = reactive(
  samplePosts.map((post) => ({
    ...post,
    comments: post.comments.map((comment) => ({ ...comment })),
  })),
);

const categoryCounts = computed(() =>
  categories.reduce((counts, category) => {
    counts[category.key] = tasks.filter(
      (task) => task.category === category.key,
    ).length;
    return counts;
  }, {}),
);
const activeCategoryLabel = computed(
  () =>
    categories.find((item) => item.key === activeCategory.value)?.label || "",
);
const visibleTasks = computed(() =>
  tasks.filter((task) => task.category === activeCategory.value),
);
const selectedTask = computed(
  () => tasks.find((task) => task.id === selectedTaskId.value) || null,
);
const activeTaskCount = computed(
  () => tasks.filter((task) => task.status === "in-progress").length,
);
const completedTaskCount = computed(
  () => tasks.filter((task) => task.status === "completed").length,
);
const parentFarmerUnlocked = computed(() => themeBadges.value >= 3);
const sharePostCount = computed(() => communityPosts.length);
const shareMediaCount = computed(() =>
  communityPosts.reduce(
    (total, post) =>
      total + (post.photos?.length || 0) + (post.videoUrl ? 1 : 0),
    0,
  ),
);
const totalShareLikes = computed(() =>
  communityPosts.reduce((total, post) => total + (post.likes || 0), 0),
);
const challengeStatusText = computed(() => {
  if (themeBadges.value >= 3) return "亲子农耕达人已解锁";
  if (themeBadges.value === 2) return "再完成一次主题打卡就能解锁";
  if (themeBadges.value === 1) return "已经拿到第一枚主题勋章";
  return "本月主题挑战正在进行中";
});
const postMediaSummary = (post) => {
  const photoCount = Array.isArray(post.photos) ? post.photos.length : 0;
  if (post.videoUrl && photoCount) {
    return `${photoCount} 张图片 · 视频作品`;
  }
  if (post.videoUrl) {
    return post.videoLabel ? `视频 · ${post.videoLabel}` : "视频作品";
  }
  if (photoCount) {
    return `${photoCount} 张图片`;
  }
  return "暂无媒体";
};
const completedTaskHighlights = computed(() =>
  tasks
    .filter((task) => task.status === "completed")
    .sort(
      (left, right) =>
        Number(right.completedAt || 0) - Number(left.completedAt || 0),
    )
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      name: task.name,
      badge: task.badge,
      reward: task.reward,
      completedAt: formatDateTime(task.completedAt),
    })),
);
const earnedBadgeHighlights = computed(() =>
  tasks
    .filter((task) => task.status === "completed")
    .sort(
      (left, right) =>
        Number(right.completedAt || 0) - Number(left.completedAt || 0),
    )
    .slice(0, 4)
    .map((task) => ({
      name: task.badge,
      icon: task.icon,
      source: task.name,
      timeLabel: formatDateTime(task.completedAt),
    })),
);
const practiceRecords = computed(() =>
  tasks
    .filter((task) => task.status !== "idle")
    .sort((left, right) => {
      const leftTime = left.completedAt || left.startedAt || 0;
      const rightTime = right.completedAt || right.startedAt || 0;
      return Number(rightTime) - Number(leftTime);
    })
    .slice(0, 8)
    .map((task) => ({ ...task, statusText: progressText(task) })),
);

const remainingLabel = (task) => {
  if (!task.deadlineAt) return "任务需在 7 天内完成";

  const remaining = task.deadlineAt - now.value;
  if (remaining <= 0) return "剩余 0 天 0 小时 0 分钟";

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
  );
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `剩余 ${days} 天 ${hours} 小时 ${minutes} 分钟`;
};

const statusLabel = (status) => {
  if (status === "in-progress") return "进行中";
  if (status === "completed") return "已完成";
  if (status === "expired") return "已失效";
  return "未领取";
};

const taskActionLabel = (task) => {
  if (task.status === "in-progress") return "继续实践";
  if (task.status === "expired") return "重新领取";
  if (task.status === "completed") return "已完成";
  return "开始任务";
};

const progressText = (task) => {
  if (task.status === "completed")
    return `已完成于 ${formatDateTime(task.completedAt)}`;
  if (task.status === "in-progress")
    return `已领取于 ${formatDateTime(task.startedAt)}`;
  if (task.status === "expired")
    return `领取于 ${formatDateTime(task.startedAt)}，已超时`;
  return "尚未领取，点击开始任务即可记录实践进度。";
};

const formatDateTime = (value) => {
  if (!value) return "暂无记录";
  const date = new Date(value);
  return `${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const openDrawer = (panel) => {
  drawerTab.value = panel;
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
};

const openUploadModal = () => {
  uploadModalVisible.value = true;
};

const closeUploadModal = () => {
  if (isUploading.value) return;
  uploadForm.description = "";
  clearUploadMedia();
  uploadModalVisible.value = false;
};

const selectTask = (taskId) => {
  selectedTaskId.value = taskId;
};

const showToast = (message) => {
  toast.message = message;
  toast.visible = true;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.visible = false;
  }, 2200);
};

const taskSnapshot = () => ({
  tasks: tasks.map((task) => ({
    id: task.id,
    status: task.status,
    startedAt: task.startedAt,
    deadlineAt: task.deadlineAt,
    completedAt: task.completedAt,
  })),
  practicePoints: practicePoints.value,
  themeBadges: themeBadges.value,
  redemptionHistory: redemptionHistory.value,
  posts: communityPosts.map((post) => ({
    id: post.id,
    likes: post.likes,
    likedByUser: post.likedByUser,
    comments: post.comments,
    description: post.description,
    author: post.author,
    avatar: post.avatar,
    tag: post.tag,
    taskName: post.taskName,
    timeLabel: post.timeLabel,
    photos: post.photos,
    videoLabel: post.videoLabel,
    videoUrl:
      post.videoUrl && post.videoUrl.startsWith("blob:") ? "" : post.videoUrl,
  })),
});

const persistState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(taskSnapshot()));
};

const restoreState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const taskMap = new Map(
      (parsed.tasks || []).map((item) => [item.id, item]),
    );
    tasks.forEach((task) => {
      const saved = taskMap.get(task.id);
      if (saved) {
        task.status = saved.status || task.status;
        task.startedAt = saved.startedAt || null;
        task.deadlineAt = saved.deadlineAt || null;
        task.completedAt = saved.completedAt || null;
      }
    });

    practicePoints.value = Number(
      parsed.practicePoints || practicePoints.value,
    );
    themeBadges.value = Number(parsed.themeBadges || themeBadges.value);
    redemptionHistory.value = Array.isArray(parsed.redemptionHistory)
      ? parsed.redemptionHistory
      : [];

    if (Array.isArray(parsed.posts)) {
      const parsedPosts = parsed.posts.map((post) => {
        const seededPost = samplePosts.find((item) => item.id === post.id);
        if (seededPost) {
          return {
            ...seededPost,
            likes: Number(post.likes ?? seededPost.likes ?? 0),
            likedByUser: Boolean(post.likedByUser),
            description: post.description || seededPost.description,
            tag: post.tag || seededPost.tag,
            taskName: post.taskName || seededPost.taskName,
            timeLabel: post.timeLabel || seededPost.timeLabel,
            comments: Array.isArray(post.comments)
              ? post.comments
              : seededPost.comments.map((comment) => ({ ...comment })),
          };
        }

        return {
          ...post,
          photos: Array.isArray(post.photos) ? post.photos : [],
          videoUrl:
            post.videoUrl && post.videoUrl.startsWith("blob:")
              ? ""
              : post.videoUrl || "",
          taskName: post.taskName || post.tag || "实践任务",
          comments: Array.isArray(post.comments) ? post.comments : [],
        };
      });

      const restoredIds = new Set(parsedPosts.map((post) => post.id));
      samplePosts.forEach((post) => {
        if (!restoredIds.has(post.id)) {
          parsedPosts.push({
            ...post,
            comments: post.comments.map((comment) => ({ ...comment })),
          });
        }
      });

      communityPosts.splice(0, communityPosts.length, ...parsedPosts);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const syncExpiredTasks = () => {
  let changed = false;
  tasks.forEach((task) => {
    if (
      task.status === "in-progress" &&
      task.deadlineAt &&
      Date.now() > task.deadlineAt
    ) {
      task.status = "expired";
      changed = true;
    }
  });
  if (changed) persistState();
};

const startTask = (taskId) => {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (task.status === "completed") {
    showToast("该任务已完成，可在我的实践中查看记录。");
    return;
  }

  const nowTime = Date.now();
  task.status = "in-progress";
  task.startedAt = nowTime;
  task.deadlineAt = nowTime + SEVEN_DAY_MS;
  task.completedAt = null;
  selectedTaskId.value = taskId;
  showToast("任务已领取，记得在 7 天内完成并上传成果。");
  persistState();
};

const clearUploadMedia = () => {
  uploadPhotoPreviews.value = [];
  uploadVideoFile.value = null;
  uploadForm.photoNames = [];
  uploadForm.videoName = "";
  uploadForm.videoDuration = 0;
  uploadVideoPreview.value = "";
  if (photoInput.value) photoInput.value.value = "";
  if (videoInput.value) videoInput.value.value = "";
};

const onPhotoChange = async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    return;
  }

  const photoPreviews = await Promise.all(
    files.map((file) => fileToDataUrl(file)),
  );
  uploadPhotoPreviews.value = [...uploadPhotoPreviews.value, ...photoPreviews];
  uploadForm.photoNames = [
    ...uploadForm.photoNames,
    ...files.map((file) => file.name),
  ];
};

const getVideoDuration = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(url);
      resolve(video.duration || 0);
    };
    video.onerror = () => {
      window.URL.revokeObjectURL(url);
      reject(new Error("无法读取视频时长"));
    };
    video.src = url;
  });

const onVideoChange = async (event) => {
  const file = (event.target.files || [])[0] || null;
  uploadVideoFile.value = file;

  if (!file) {
    uploadForm.videoName = "";
    uploadForm.videoDuration = 0;
    uploadVideoPreview.value = "";
    return;
  }

  try {
    const duration = await getVideoDuration(file);
    if (duration > 60) {
      showToast("视频时长需控制在 1 分钟以内。");
      uploadVideoFile.value = null;
      uploadForm.videoName = "";
      uploadForm.videoDuration = 0;
      if (videoInput.value) videoInput.value.value = "";
      uploadVideoPreview.value = "";
      return;
    }

    uploadForm.videoName = file.name;
    uploadForm.videoDuration = Math.ceil(duration);
    uploadVideoPreview.value = await fileToDataUrl(file);
  } catch {
    showToast("无法读取视频信息，请重新选择文件。");
    uploadVideoFile.value = null;
    uploadForm.videoName = "";
    uploadForm.videoDuration = 0;
    if (videoInput.value) videoInput.value.value = "";
    uploadVideoPreview.value = "";
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });

const submitUpload = async () => {
  const targetTask = selectedTask.value;
  if (!targetTask) {
    showToast("请先选择一个任务。");
    return;
  }

  const hasImages = uploadPhotoPreviews.value.length > 0;

  if (!hasImages) {
    showToast("请先选择至少一张图片。");
    return;
  }

  if (targetTask.status !== "in-progress") {
    showToast("请先点击“开始任务”领取实践任务。");
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 8;

  try {
    const progressTimer = window.setInterval(() => {
      if (uploadProgress.value < 92) uploadProgress.value += 16;
    }, 180);

    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    window.clearInterval(progressTimer);
    uploadProgress.value = 100;

    const completedAt = Date.now();
    targetTask.status = "completed";
    targetTask.completedAt = completedAt;
    practicePoints.value += targetTask.reward + 20;
    if (themeBadges.value < 3) themeBadges.value += 1;
    const uploadedPost = {
      id: Date.now(),
      author: "我和家人",
      avatar: "👨‍👩‍👧",
      tag:
        selectedTask.value.category === "craft"
          ? "手工制作"
          : activeCategoryLabel.value,
      taskName: targetTask.name,
      description:
        uploadForm.description ||
        `我们完成了 ${targetTask.name}，并记录了实践过程。`,
      photos: uploadPhotoPreviews.value.slice(),
      videoUrl: "",
      videoLabel: "",
      likes: 0,
      likedByUser: false,
      timeLabel: "刚刚",
      comments: [],
    };

    communityPosts.unshift(uploadedPost);
    commentDrafts[uploadedPost.id] = "";
    showToast("上传成功，等待审核。");

    uploadForm.description = "";
    clearUploadMedia();
    persistState();
    uploadModalVisible.value = false;
  } catch (error) {
    showToast(
      error instanceof Error ? error.message : "上传失败，请稍后重试。",
    );
  } finally {
    uploadProgress.value = 0;
    isUploading.value = false;
  }
};

const toggleLike = (post) => {
  post.likedByUser = !post.likedByUser;
  post.likes += post.likedByUser ? 1 : -1;
  persistState();
};

const addComment = (post) => {
  const draft = (commentDrafts[post.id] || "").trim();
  if (!draft) {
    showToast("请输入评论内容。");
    return;
  }

  post.comments.push({
    id: `${post.id}-${Date.now()}`,
    name: "家长/儿童",
    text: draft,
  });
  commentDrafts[post.id] = "";
  showToast("评论已发布。");
  persistState();
};

const redeemGift = (item) => {
  if (!redeemForm.name || !redeemForm.phone || !redeemForm.address) {
    showToast("请先填写收件人、电话和地址。");
    return;
  }

  if (practicePoints.value < item.cost) {
    showToast("积分不足，继续完成更多任务吧。");
    return;
  }

  practicePoints.value -= item.cost;
  redemptionHistory.value.unshift({
    id: `${item.id}-${Date.now()}`,
    name: item.name,
    createdAt: formatDateTime(Date.now()),
    address: `${redeemForm.name} · ${redeemForm.phone} · ${redeemForm.address}`,
  });

  showToast("兑换成功，礼品将按填写地址邮寄。");
  persistState();
};

watch(activeCategory, () => {
  if (!visibleTasks.value.some((task) => task.id === selectedTaskId.value)) {
    selectedTaskId.value = visibleTasks.value[0]?.id || tasks[0].id;
  }
});

onMounted(() => {
  restoreState();
  selectedTaskId.value = visibleTasks.value[0]?.id || tasks[0].id;
  syncExpiredTasks();
  timerId = window.setInterval(() => {
    now.value = Date.now();
    syncExpiredTasks();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timerId) window.clearInterval(timerId);
  if (toastTimer) window.clearTimeout(toastTimer);
});
</script>

<style scoped>
.practice-page {
  width: 100%;
  display: grid;
  gap: 22px;
  color: #24402b;
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
  position: relative;
}

.practice-page::before,
.practice-page::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(2px);
}

.practice-page::before {
  width: 220px;
  height: 220px;
  right: -80px;
  top: 36px;
  background: radial-gradient(
    circle,
    rgba(255, 234, 177, 0.8),
    rgba(255, 234, 177, 0)
  );
}

.practice-page::after {
  width: 160px;
  height: 160px;
  left: -50px;
  bottom: 280px;
  background: radial-gradient(
    circle,
    rgba(181, 231, 150, 0.65),
    rgba(181, 231, 150, 0)
  );
}

.hero-card,
.task-panel,
.detail-panel,
.feed-card,
.share-banner {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(155, 194, 113, 0.35);
  box-shadow: 0 18px 36px rgba(87, 122, 58, 0.1);
  backdrop-filter: blur(8px);
}

.hero-card {
  border-radius: 30px;
  padding: 26px 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
  grid-template-areas:
    "copy actions"
    "side side";
  gap: 18px;
  align-items: start;
}

.hero-copy {
  grid-area: copy;
}

.hero-actions {
  grid-area: actions;
  justify-content: flex-end;
  align-content: start;
}

.hero-side {
  grid-area: side;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hero-challenge-card {
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(247, 252, 239, 0.98),
    rgba(255, 248, 226, 0.98)
  );
  border: 1px solid rgba(161, 195, 123, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);
}

.challenge-card-head {
  display: grid;
  gap: 6px;
}

.challenge-pill {
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef8e0;
  color: #5f8b31;
  font-size: 12px;
  font-weight: 700;
}

.hero-challenge-card strong {
  color: #2f6f35;
  font-size: 18px;
}

.hero-challenge-card p {
  line-height: 1.7;
  color: #5f6f60;
  font-size: 14px;
}

.eyebrow,
.section-kicker,
.section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7d9e4f;
}

.hero-copy h2,
.section-heading h3,
.detail-panel h3,
.feed-card h4,
.task-panel h4 {
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
  color: #2f6f35;
}

.hero-copy h2 {
  margin: 10px 0 12px;
  font-size: clamp(30px, 3vw, 48px);
}
.hero-desc {
  max-width: 820px;
  font-size: 16px;
  line-height: 1.8;
  color: #516454;
}
.hero-overview-card {
  display: grid;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(155, 194, 113, 0.28);
  box-shadow: 0 12px 24px rgba(87, 122, 58, 0.08);
}
.hero-overview-head {
  display: grid;
  gap: 8px;
}
.hero-overview-head strong {
  display: block;
  margin-top: 6px;
  color: #2f6f35;
  font-size: 18px;
}
.hero-overview-head p {
  margin: 0;
  line-height: 1.7;
  color: #5f6f60;
  font-size: 14px;
}
.hero-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.hero-overview-grid article,
.practice-summary div {
  border-radius: 20px;
  padding: 14px 16px;
  background: linear-gradient(
    180deg,
    rgba(239, 248, 224, 0.96),
    rgba(255, 255, 255, 0.95)
  );
  border: 1px solid rgba(142, 188, 93, 0.3);
  display: grid;
  gap: 4px;
}
.hero-overview-grid strong,
.practice-summary strong {
  font-size: 30px;
  line-height: 1;
  color: #37733f;
}
.hero-overview-grid span,
.practice-summary span {
  font-size: 13px;
  color: #617361;
}
.hero-overview-grid p,
.practice-summary p {
  margin: 0;
  line-height: 1.6;
  color: #5f6f60;
  font-size: 13px;
}
.hero-detail-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.hero-detail-block {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(250, 253, 245, 0.96);
  border: 1px solid rgba(154, 190, 121, 0.22);
}
.hero-detail-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7d9e4f;
  text-transform: uppercase;
}
.hero-detail-item,
.hero-badge-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 0;
  border-top: 1px dashed rgba(153, 188, 121, 0.24);
}
.hero-detail-block > :nth-child(2) {
  border-top: 0;
  padding-top: 0;
}
.hero-detail-item strong,
.hero-badge-item strong {
  display: block;
  color: #2f6f35;
  font-size: 15px;
}
.hero-detail-item span,
.hero-badge-item p {
  color: #5f6f60;
  line-height: 1.6;
  font-size: 13px;
}
.hero-badge-item span {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #fff7df;
  font-size: 22px;
  flex: 0 0 auto;
}
.hero-detail-empty {
  margin: 0;
  line-height: 1.7;
  color: #6d7b6c;
  font-size: 13px;
}
.hero-timeline {
  display: grid;
  gap: 10px;
}
.hero-timeline article {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 6px 0 0;
}
.hero-timeline.badges article {
  grid-template-columns: 14px 40px minmax(0, 1fr);
}
.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 50%;
  background: #d6e8b8;
  box-shadow: 0 0 0 4px rgba(214, 232, 184, 0.35);
}
.timeline-dot.done {
  background: linear-gradient(135deg, #7eb73c, #4f9630);
  box-shadow: 0 0 0 4px rgba(126, 183, 60, 0.2);
}
.timeline-dot.badge {
  background: linear-gradient(135deg, #f4db84, #f2a73a);
  box-shadow: 0 0 0 4px rgba(242, 167, 58, 0.2);
}
.hero-badge-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #fff7df;
  font-size: 22px;
}
.hero-timeline strong,
.hero-timeline p {
  line-height: 1.55;
}
.hero-timeline p {
  margin: 3px 0 0;
  color: #5f6f60;
  font-size: 13px;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: start;
}

.action-btn,
.ghost-btn,
.card-btn,
.reward-item,
.comment-form button,
.feed-actions button {
  border: 0;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}
.action-btn,
.ghost-btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
}
.action-btn {
  color: #ffffff;
  background: linear-gradient(135deg, #76b83c, #4f9630);
  box-shadow: 0 12px 22px rgba(86, 140, 52, 0.24);
}
.action-btn.accent {
  background: linear-gradient(135deg, #e69d2b, #d77913);
}
.ghost-btn {
  color: #356a39;
  background: rgba(247, 252, 242, 0.98);
  border: 1px solid rgba(101, 145, 63, 0.25);
}

.layout-grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}
.category-panel {
  position: sticky;
  top: 90px;
  align-self: start;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(162, 191, 128, 0.28);
  box-shadow: 0 14px 28px rgba(79, 110, 54, 0.08);
  display: grid;
  gap: 14px;
}
.category-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 18px;
  padding: 12px 14px;
  background: rgba(246, 251, 238, 0.92);
  color: #325339;
  cursor: pointer;
}
.category-item.active {
  background: linear-gradient(
    135deg,
    rgba(126, 183, 60, 0.18),
    rgba(232, 168, 64, 0.18)
  );
  box-shadow: inset 0 0 0 1px rgba(126, 183, 60, 0.3);
}
.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fffdf2;
  font-size: 20px;
}
.category-name {
  text-align: left;
  font-weight: 700;
  line-height: 1.35;
}
.category-count {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #f0f7e4;
  color: #5d8d35;
  font-size: 12px;
  font-weight: 700;
}

.main-stage {
  display: grid;
}
.task-workbench {
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(155, 194, 113, 0.3);
  box-shadow: 0 18px 36px rgba(87, 122, 58, 0.1);
  backdrop-filter: blur(8px);
}
.task-workbench-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
}
.task-workbench-head h3 {
  margin-top: 4px;
  font-family: "STXinwei", "STKaiti", "KaiTi", serif;
  color: #2f6f35;
  font-size: 25px;
}
.task-workbench-body {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 18px;
  align-items: start;
}
.task-panel,
.detail-panel,
.feed-card,
.share-banner {
  border-radius: 28px;
  padding: 22px;
  position: relative;
  overflow: hidden;
}
.task-panel::before,
.detail-panel::before,
.feed-card::before,
.share-banner::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #7eb73c, #f2b23c);
}
.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
}
.section-heading.compact {
  margin-bottom: 14px;
}
.section-heading h3,
.detail-panel h3,
.feed-card h4,
.task-panel h4 {
  margin-top: 4px;
  font-size: 25px;
}
.section-hint,
.task-intro,
.hero-desc,
.mini-note,
.feed-head p,
.record-item p,
.history-item p,
.upload-tip,
.feed-text,
.comment-item p,
.drawer-copy,
.modal-copy {
  line-height: 1.7;
  color: #5f6f60;
}

.task-focus-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 16px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(239, 248, 224, 0.98),
    rgba(255, 255, 255, 0.96)
  );
  border: 1px solid rgba(143, 184, 102, 0.24);
}
.task-focus-main {
  display: grid;
  gap: 6px;
}
.task-focus-label {
  font-size: 12px;
  font-weight: 700;
  color: #7d9e4f;
  letter-spacing: 0.08em;
}
.task-focus-main h4 {
  margin: 0;
  font-size: 18px;
  color: #2f6f35;
}
.task-focus-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  justify-content: flex-end;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.task-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.94),
    rgba(248, 252, 240, 0.96)
  );
  border: 1px solid rgba(143, 184, 102, 0.24);
  display: grid;
  gap: 12px;
}
.task-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 1;
  transition: opacity 0.2s ease;
}
.task-card::before {
  content: "";
  position: absolute;
  top: 14px;
  right: 14px;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.92) rotate(-8deg);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  z-index: 2;
  box-shadow: 0 10px 18px rgba(84, 102, 54, 0.18);
}
.task-card.completed::after {
  opacity: 1;
  background: linear-gradient(
    180deg,
    rgba(146, 150, 154, 0.24),
    rgba(116, 122, 128, 0.34)
  );
}
.task-card.completed::before {
  content: "已完成";
  opacity: 1;
  color: #ffffff;
  background: linear-gradient(135deg, #7f8488, #5f676d);
  border: 3px solid rgba(255, 255, 255, 0.82);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.task-card.in-progress::after {
  opacity: 1;
  background: linear-gradient(
    180deg,
    rgba(244, 238, 196, 0.18),
    rgba(235, 223, 171, 0.24)
  );
}
.task-card.in-progress::before {
  content: "进行中";
  opacity: 1;
  color: #5d5b1f;
  background: linear-gradient(135deg, #f6e58c, #e6cf5b);
  border: 3px solid rgba(255, 255, 255, 0.84);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.task-card.selected {
  box-shadow:
    inset 0 0 0 2px rgba(121, 182, 59, 0.45),
    0 12px 24px rgba(90, 120, 60, 0.08);
}
.task-card > * {
  position: relative;
  z-index: 0;
}
.task-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.task-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #fff7df;
  font-size: 28px;
}
.difficulty-tag,
.detail-badge,
.status-pill,
.countdown {
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
}
.difficulty-tag,
.detail-badge {
  background: #eef8e0;
  color: #5f8b31;
}
.task-card h4 {
  font-size: 20px;
}
.task-card.completed h4,
.task-card.completed .task-intro,
.task-card.completed .task-meta-row,
.task-card.completed .task-state-row {
  color: #4c545b;
}
.task-card.in-progress h4,
.task-card.in-progress .task-intro,
.task-card.in-progress .task-meta-row,
.task-card.in-progress .task-state-row {
  color: #5a5a30;
}
.task-intro {
  min-height: 54px;
}
.task-meta-row,
.task-state-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  font-size: 13px;
}
.status-pill.idle {
  background: #f2f4ea;
  color: #677060;
}
.status-pill.in-progress {
  background: #e5f4d6;
  color: #45772d;
}
.status-pill.completed {
  background: #dff4e8;
  color: #2e7f54;
}
.status-pill.expired {
  background: #fde9d7;
  color: #b56616;
}
.countdown {
  background: rgba(255, 248, 227, 0.98);
  color: #b06b18;
}
.countdown.expired {
  background: #fff0db;
}
.card-btn,
.comment-form button,
.feed-actions button {
  border-radius: 14px;
  min-height: 42px;
  padding: 0 16px;
  background: #7eb73c;
  color: #fff;
  font-weight: 700;
}
.card-btn:hover,
.action-btn:hover,
.ghost-btn:hover,
.reward-item:hover,
.comment-form button:hover,
.feed-actions button:hover {
  transform: translateY(-1px);
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
  gap: 16px;
}
.detail-main,
.detail-side {
  display: grid;
  gap: 14px;
}
.detail-summary {
  font-size: 16px;
  line-height: 1.8;
  color: #47614b;
}
.detail-block {
  border-radius: 22px;
  padding: 16px;
  background: rgba(251, 253, 246, 0.92);
  border: 1px solid rgba(156, 192, 120, 0.25);
}
.detail-block.soft {
  background: linear-gradient(
    180deg,
    rgba(241, 248, 231, 0.96),
    rgba(255, 255, 255, 0.92)
  );
}
.detail-block h4,
.feed-card h4 {
  margin-bottom: 8px;
  font-size: 18px;
}
.detail-block ol,
.detail-block ul {
  padding-left: 18px;
  display: grid;
  gap: 8px;
}
.chip-list {
  list-style: none;
  padding-left: 0 !important;
  display: flex !important;
  flex-wrap: wrap;
  gap: 8px;
}
.chip-list li {
  padding: 7px 11px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(143, 184, 102, 0.26);
  color: #516454;
}
.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 6px;
}

.bottom-board {
  padding-bottom: 18px;
  gap: 18px;
}
.share-banner {
  border-radius: 30px;
  padding: 22px 24px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: stretch;
  background:
    linear-gradient(
      135deg,
      rgba(247, 252, 240, 0.98),
      rgba(255, 246, 224, 0.98)
    ),
    radial-gradient(
      circle at top right,
      rgba(255, 224, 162, 0.55),
      transparent 38%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(178, 227, 146, 0.42),
      transparent 34%
    );
}
.share-banner-copy {
  display: grid;
  gap: 8px;
  max-width: 720px;
}
.share-banner-copy h3 {
  font-size: 26px;
  color: #2f6f35;
}
.share-banner-copy p:last-child {
  line-height: 1.7;
  color: #607161;
}
.share-banner-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.share-banner-chips span {
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(154, 192, 116, 0.24);
  color: #5d724f;
  font-size: 12px;
  font-weight: 700;
}
.share-banner-story {
  max-width: 360px;
  padding: 18px 18px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.6);
  border: 0;
  box-shadow: none;
  display: grid;
  gap: 8px;
  align-content: start;
}
.share-banner-story-title {
  color: #7d9e4f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.share-banner-story p:last-child {
  line-height: 1.75;
  color: #516454;
  font-size: 14px;
}
.share-banner-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  min-width: min(360px, 100%);
}
.share-banner-metrics article {
  border-radius: 22px;
  padding: 16px 14px;
  display: grid;
  gap: 4px;
  align-content: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(154, 192, 116, 0.24);
  box-shadow: 0 10px 20px rgba(73, 110, 49, 0.08);
}
.share-banner-metrics strong {
  font-size: 28px;
  color: #2f6f35;
}
.share-banner-metrics span {
  color: #6a7b6c;
  font-size: 13px;
  font-weight: 700;
}
.module-banner {
  border-radius: 28px;
  padding: 22px 24px;
  background: linear-gradient(
    135deg,
    rgba(248, 253, 240, 0.98),
    rgba(255, 248, 229, 0.98)
  );
  border: 1px solid rgba(161, 195, 123, 0.28);
  box-shadow: 0 16px 32px rgba(79, 110, 54, 0.08);
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}
.module-copy {
  margin-top: 8px;
  max-width: 760px;
  line-height: 1.75;
  color: #5f6f60;
}
.share-metrics {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.share-metrics span,
.feed-count {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(143, 184, 102, 0.24);
  color: #4d6d37;
  font-size: 12px;
  font-weight: 700;
}

.share-title-bar {
  border-radius: 28px;
  padding: 22px 24px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  background: linear-gradient(
    135deg,
    rgba(248, 253, 240, 0.98),
    rgba(255, 246, 222, 0.98)
  );
  border: 1px solid rgba(161, 195, 123, 0.28);
  box-shadow: 0 16px 32px rgba(79, 110, 54, 0.08);
}
.share-title-copy {
  display: grid;
  gap: 8px;
  max-width: 760px;
}
.challenge-progress {
  display: flex;
  gap: 10px;
  align-items: center;
}
.challenge-progress.compact {
  flex-wrap: wrap;
}
.challenge-progress span {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 0 0 1px rgba(163, 198, 126, 0.26);
  font-size: 18px;
}
.challenge-progress span.active {
  background: linear-gradient(135deg, #f4db84, #f2a73a);
}
.challenge-status {
  text-align: right;
  display: grid;
  gap: 4px;
}
.challenge-status.compact {
  text-align: left;
}
.challenge-status strong {
  color: #2f6f35;
  font-size: 15px;
}
.challenge-status p {
  color: #5f6f60;
  line-height: 1.6;
  font-size: 13px;
}

.share-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: start;
}
.feed-card {
  border-radius: 0 0 30px 30px;
  display: grid;
  gap: 18px;
  padding: 16px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.9),
      rgba(247, 251, 240, 0.96)
    ),
    radial-gradient(
      circle at top right,
      rgba(190, 231, 162, 0.2),
      transparent 30%
    );
  border: 1px solid rgba(155, 194, 113, 0.3);
  box-shadow: 0 18px 36px rgba(87, 122, 58, 0.1);
}
.feed-card::before {
  display: none;
}
.share-banner {
  border-radius: 30px 30px 0 0;
  margin-bottom: -1px;
}
.feed-card .section-heading.compact {
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(157, 188, 121, 0.28);
}
.share-flow-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding-bottom: 14px;
  border-bottom: 0;
}
.share-flow-head h4 {
  margin-top: 4px;
  font-size: 24px;
}
.share-flow-head p:last-child {
  margin-top: 6px;
  max-width: 760px;
  line-height: 1.7;
  color: #607161;
  font-size: 14px;
}
.feed-item + .feed-item {
  margin-top: 2px;
}
.feed-item {
  border-radius: 22px;
  padding: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(248, 252, 244, 0.96)
  );
  border: 1px solid rgba(153, 188, 119, 0.18);
  box-shadow: 0 10px 22px rgba(82, 113, 62, 0.06);
  display: grid;
  gap: 14px;
}
.feed-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.feed-author {
  display: flex;
  gap: 12px;
  align-items: center;
}
.feed-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #eef7df, #fff2d0);
  font-size: 24px;
  box-shadow: inset 0 0 0 1px rgba(159, 194, 126, 0.18);
}
.feed-head strong {
  font-size: 16px;
  color: #315338;
}
.feed-head p {
  color: #7a887a;
  font-size: 12px;
  margin-top: 2px;
}
.feed-tag {
  padding: 7px 11px;
  border-radius: 999px;
  background: #f2f8e8;
  color: #638a38;
  font-size: 12px;
  font-weight: 700;
}
.feed-head-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.feed-task-tag {
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 248, 228, 0.96);
  color: #a36818;
  border: 1px solid rgba(227, 180, 92, 0.26);
  font-size: 12px;
  font-weight: 700;
}
.feed-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.feed-meta-row span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(242, 248, 232, 0.92);
  color: #5d724f;
  font-size: 12px;
  font-weight: 700;
}
.feed-text {
  line-height: 1.75;
  color: #47614b;
}
.feed-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 180px));
  gap: 8px;
  justify-content: start;
}
.feed-media img,
.video-card,
.video-placeholder,
.video-card video {
  width: 100%;
  border-radius: 20px;
}
.feed-media img,
.video-card video {
  aspect-ratio: 1 / 1;
  min-height: 140px;
  object-fit: cover;
  background: #f6f8ef;
  box-shadow: inset 0 0 0 1px rgba(159, 194, 126, 0.12);
}
.video-placeholder {
  aspect-ratio: 1 / 1;
  min-height: 140px;
  display: grid;
  place-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #eef7df, #fff5d9);
  color: #4b6542;
}
.video-placeholder span {
  font-size: 40px;
}
.feed-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 12px;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px dashed rgba(157, 188, 121, 0.22);
  border-radius: 16px;
  background: rgba(247, 251, 242, 0.82);
}
.feed-task-note {
  color: #6a7a6b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}
.feed-actions button {
  min-width: 90px;
}
.comment-list {
  display: grid;
  gap: 8px;
}
.comment-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: #f7fbf2;
  border: 1px solid rgba(157, 188, 121, 0.18);
}
.comment-item strong {
  color: #43623f;
}
.comment-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}
.comment-form button {
  min-width: 82px;
}

.practice-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.record-list,
.history-box,
.reward-list,
.redeem-form {
  display: grid;
  gap: 10px;
}
.record-item,
.history-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(159, 188, 121, 0.22);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.badge-box {
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(255, 239, 191, 0.95),
    rgba(255, 255, 255, 0.95)
  );
  border: 1px solid rgba(221, 175, 72, 0.22);
  display: grid;
  gap: 6px;
}
.badge-box.unlocked {
  background: linear-gradient(
    135deg,
    rgba(219, 246, 208, 0.98),
    rgba(255, 255, 255, 0.95)
  );
}
.drawer-fade-enter-active,
.drawer-fade-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active,
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to,
.modal-fade-enter-from,
.modal-fade-leave-to,
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
.drawer-backdrop,
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(26, 43, 21, 0.42);
  backdrop-filter: blur(4px);
}
.modal-backdrop {
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 20px;
}
.module-drawer {
  position: absolute;
  right: 0;
  top: 0;
  width: min(420px, 100%);
  height: 100%;
  padding: 22px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(247, 252, 240, 0.98)
  );
  border-left: 1px solid rgba(155, 194, 113, 0.28);
  box-shadow: -18px 0 40px rgba(27, 48, 22, 0.18);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 16px;
}
.drawer-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.drawer-head h3 {
  margin-top: 4px;
  font-size: 26px;
  color: #2f6f35;
}
.drawer-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.drawer-tab {
  border: 1px solid rgba(137, 170, 109, 0.24);
  background: rgba(255, 255, 255, 0.9);
  color: #355f38;
  border-radius: 16px;
  min-height: 46px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.drawer-tab.active {
  background: linear-gradient(
    135deg,
    rgba(126, 183, 60, 0.18),
    rgba(242, 179, 60, 0.2)
  );
  box-shadow: inset 0 0 0 1px rgba(126, 183, 60, 0.3);
}
.drawer-scroll {
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 14px;
  padding-right: 4px;
}
.drawer-section {
  display: grid;
  gap: 14px;
}
.drawer-section .practice-summary {
  grid-template-columns: 1fr;
}
.drawer-section .record-item,
.drawer-section .history-item {
  align-items: flex-start;
}
.drawer-section .reward-item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 20px;
  background: linear-gradient(
    180deg,
    rgba(249, 253, 241, 0.96),
    rgba(255, 255, 255, 0.95)
  );
  text-align: left;
  border: 1px solid rgba(153, 188, 119, 0.24);
  color: #33503a;
}
.drawer-section .reward-item span {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #fff7dc;
  font-size: 26px;
}
.drawer-section .reward-item:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.upload-modal {
  width: min(660px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 30px;
  padding: 20px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(248, 253, 240, 0.98)
  );
  border: 1px solid rgba(155, 194, 113, 0.32);
  box-shadow: 0 30px 60px rgba(27, 48, 22, 0.28);
}
.modal-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.close-btn {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgba(240, 246, 233, 0.96);
  color: #325339;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}
.modal-copy {
  margin: 12px 0 18px;
}
.upload-modal-body {
  display: grid;
  gap: 14px;
}
.upload-modal-body label,
.redeem-form label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: #48604c;
}
.redeem-form input,
.redeem-form textarea,
.upload-modal-body input,
.upload-modal-body textarea,
.comment-form input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(137, 170, 109, 0.28);
  background: rgba(255, 255, 255, 0.96);
  padding: 11px 14px;
  font: inherit;
  color: #25402a;
  outline: none;
}
.redeem-form textarea,
.upload-modal-body textarea {
  resize: vertical;
}
.upload-media-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}
.upload-media-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(
    180deg,
    rgba(250, 253, 245, 0.98),
    rgba(255, 255, 255, 0.96)
  );
  border: 1px solid rgba(155, 194, 113, 0.24);
}
.upload-media-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.upload-media-head strong {
  font-size: 15px;
  color: #2f6f35;
}
.upload-media-head p {
  margin-top: 4px;
  color: #6a7a6b;
  font-size: 12px;
  line-height: 1.5;
}
.upload-media-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  background: #7eb73c;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(126, 183, 60, 0.2);
}
.upload-media-btn input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.upload-preview-grid {
  display: grid;
  gap: 10px;
}
.upload-preview-grid.image {
  grid-template-columns: repeat(auto-fit, minmax(96px, 116px));
}
.upload-preview-item {
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(159, 194, 126, 0.22);
  box-shadow: 0 8px 18px rgba(82, 113, 62, 0.06);
}
.upload-preview-item img,
.upload-preview-item video {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background: #f6f8ef;
}
.upload-preview-item span {
  display: block;
  padding: 8px 10px;
  font-size: 12px;
  color: #5b6c5d;
  line-height: 1.4;
}
.upload-preview-item.video {
  grid-column: 1 / -1;
}
.upload-empty {
  padding: 18px 14px;
  border-radius: 16px;
  background: rgba(242, 248, 232, 0.82);
  border: 1px dashed rgba(159, 194, 126, 0.34);
  color: #6a7a6b;
  font-size: 13px;
  line-height: 1.6;
}
.upload-preview-grid.video .upload-preview-item video {
  aspect-ratio: 16 / 10;
}
.file-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.file-preview span {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eff7e5;
  color: #4f6f38;
  font-size: 12px;
}
.progress-wrap {
  display: grid;
  gap: 6px;
}
.progress-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(228, 236, 216, 0.96);
  overflow: hidden;
}
.progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #78c74c, #f0b23e);
  transition: width 0.2s ease;
}
.modal-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.upload-tip {
  font-size: 13px;
}
.like-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  min-height: 40px;
  padding: 0 14px;
  background: #ffffff;
  color: #516454;
  border: 1px solid rgba(153, 188, 119, 0.22);
  font-weight: 700;
}
.like-action strong {
  margin-left: 2px;
  font-size: 12px;
  color: inherit;
}
.like-action.liked {
  background: linear-gradient(
    135deg,
    rgba(255, 228, 230, 0.96),
    rgba(255, 244, 245, 0.98)
  );
  border-color: rgba(225, 107, 124, 0.28);
  color: #c1455b;
}
.like-action-icon {
  font-size: 16px;
}
.like-action-text {
  font-size: 13px;
}
.like-hint {
  color: #6a7a6b;
  font-size: 12px;
}
.toast-box {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  padding: 14px 20px;
  border-radius: 999px;
  background: rgba(42, 65, 32, 0.92);
  color: #ffffff;
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.2);
  z-index: 5000;
}

@media (max-width: 1240px) {
  .layout-grid {
    grid-template-columns: 190px minmax(0, 1fr);
  }
}

@media (max-width: 980px) {
  .hero-card,
  .share-title-bar,
  .module-banner,
  .task-workbench-head {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "copy"
      "actions"
      "side";
  }
  .hero-actions {
    justify-content: flex-start;
  }
  .hero-side {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-detail-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .layout-grid,
  .task-workbench-body,
  .detail-grid,
  .share-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .category-panel {
    position: static;
  }
  .practice-summary {
    grid-template-columns: minmax(0, 1fr);
  }
  .module-drawer {
    width: min(92vw, 420px);
  }
}

@media (max-width: 720px) {
  .hero-card,
  .task-workbench,
  .task-panel,
  .detail-panel,
  .feed-card,
  .share-banner {
    padding: 18px;
    border-radius: 22px;
  }
  .hero-challenge-card {
    padding: 16px;
  }
  .hero-overview-card {
    padding: 16px;
  }
  .hero-side {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-detail-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .share-title-bar {
    padding: 18px;
    border-radius: 22px;
  }
  .category-panel {
    padding: 14px;
  }
  .task-list {
    grid-template-columns: minmax(0, 1fr);
  }
  .comment-form {
    grid-template-columns: minmax(0, 1fr);
  }
  .feed-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
