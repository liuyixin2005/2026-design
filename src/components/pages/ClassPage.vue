<template>
  <div class="page active farm-classroom">
    <div class="top-bar">
      <div class="title-section">
        <span class="title-icon">📚</span>
        <h1>农耕小课堂</h1>
      </div>
      <div class="nav-buttons">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="搜索农作物、农具知识..." class="search-input" />
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>

      <div class="content-area">
        <div v-if="selectedCategory === 1" class="content-section">
          <h2>🌾 农作物认知</h2>
          <div class="crop-type-tabs">
            <button
              v-for="type in cropTypeList"
              :key="type.id"
              class="type-tab"
              :class="{ active: selectedCropType === type.name }"
              @click="selectedCropType = type.name"
            >
              {{ type.name }}
            </button>
          </div>
          <div class="crops-grid">
            <div
              v-for="crop in filteredCrops"
              :key="crop.id"
              class="crop-card"
              :class="{ pop: popCard === `crop-${crop.id}` }"
              :style="getCardBgStyle(crop.realImage)"
              @click="showCropDetail(crop)"
            >
              <div class="card-info">
                <div class="crop-name">{{ crop.name }}</div>
                <div class="crop-pinyin">{{ crop.pinyin }}</div>
                <div class="crop-group-line">
                  <span class="group-main">主类：{{ crop.primaryGroup }}</span>
                  <span v-if="crop.secondaryGroups.length" class="group-sub">副类：{{ crop.secondaryGroups.join('、') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="filteredCrops.length === 0" class="empty-tip">没有找到相关农作物哦～</div>
        </div>

        <div v-if="selectedCategory === 2" class="content-section">
          <h2>🛠️ 农具认知</h2>
          <div class="tool-type-tabs">
            <button
              v-for="type in toolTypeList"
              :key="type.id"
              class="type-tab"
              :class="{ active: selectedToolType === type.name }"
              @click="selectedToolType = type.name"
            >
              {{ type.name }}
            </button>
          </div>
          <div class="tools-grid">
            <div
              v-for="tool in filteredTools"
              :key="tool.id"
              class="tool-card"
              :class="{ pop: popCard === `tool-${tool.id}` }"
              :style="getCardBgStyle(tool.realImage)"
              @click="showToolDetail(tool)"
            >
              <div class="card-info">
                <div class="tool-name">{{ tool.name }}</div>
                <div class="tool-pinyin">{{ tool.pinyin }}</div>
              </div>
            </div>
          </div>
          <div v-if="filteredTools.length === 0" class="empty-tip">没有找到相关农具哦～</div>
        </div>

        <div v-if="selectedCategory === 3" class="content-section farm-flow-section">
          <h2>🌱 农耕流程</h2>

          <div class="farm-flow-layout">
            <div class="farm-profile-column">
              <div class="farmer-role-row">
                <div
                  v-for="role in farmRoles"
                  :key="role.id"
                  class="farmer-role-card"
                  :class="{ active: selectedFarmRole === role.id }"
                  @click="selectedFarmRole = role.id"
                >
                  <div class="role-emoji">{{ role.emoji }}</div>
                  <div class="role-name">{{ role.name }}</div>
                </div>
              </div>

              <div class="role-stage">
                <div class="stage-avatar">{{ selectedFarmRoleData?.emoji }}</div>
                <div class="stage-info">
                  <div class="stage-name">{{ selectedFarmRoleData?.name }}出发啦！</div>
                  <div class="stage-score">⭐ 成长积分：{{ farmScore }}</div>
                  <div class="stage-tools">
                    <span
                      v-for="(tool, idx) in farmUnlockTools"
                      :key="`equip-${tool.name}`"
                      class="stage-tool-badge"
                      :class="{ unlocked: completedFarmCount > idx }"
                    >
                      {{ tool.icon }} {{ tool.name }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flow-tools-row">
                <div v-for="(tool, idx) in farmUnlockTools" :key="tool.name" class="flow-tool" :class="{ unlocked: completedFarmCount > idx }">
                  <span>{{ tool.icon }}</span>
                  <span>{{ tool.name }}</span>
                </div>
                <div v-if="completedFarmCount === 4" class="flow-title-badge">🏆 荣誉小农夫</div>
              </div>

              <div class="growth-tree" @click="triggerTreeFx">
                <div class="tree-emoji">{{ growthTreeEmoji }}</div>
                <div class="tree-progress">成长树进度：{{ completedFarmCount }}/4</div>
                <div v-if="treeFx" class="tree-fx">✨ 丰收啦 ✨</div>
              </div>
            </div>

            <div class="farm-mission-column">
              <div class="coach-card">
                <button class="coach-avatar" @click="playAudio(currentFarmStep.description)">🧑‍🌾{{ coachMoodEmoji }}</button>
                <div class="coach-bubble">{{ coachMessage }}</div>
                <div class="combo-badge" :class="{ flash: comboFlash }">连击 x{{ farmCombo }}</div>
              </div>

              <div class="chest-card" :class="{ ready: chestReady }" @click="openFarmChest">
                <span class="chest-icon">{{ chestReady ? '🎁' : '📦' }}</span>
                <span>{{ chestReady ? '连击宝箱已就绪，点击开启！' : '连击达到3可解锁惊喜宝箱' }}</span>
              </div>
              <div v-if="chestFxText" class="chest-fx">{{ chestFxText }}</div>

              <div class="farm-step-tabs">
                <button
                  v-for="step in farmSteps"
                  :key="step.key"
                  class="step-card"
                  :class="{ active: activeFarmStep === step.key, done: farmGameDoneMap[step.key] && farmQuizCorrect[step.key], locked: !isFarmStepUnlocked(step.key) }"
                  :disabled="!isFarmStepUnlocked(step.key)"
                  @click="activeFarmStep = step.key"
                >
                  <span class="step-title">{{ step.name }}</span>
                  <span class="step-mark">{{ !isFarmStepUnlocked(step.key) ? '🔒' : (farmGameDoneMap[step.key] && farmQuizCorrect[step.key] ? '✅' : (activeFarmStep === step.key ? '🎯' : '⬜')) }}</span>
                </button>
              </div>

              <div class="farm-step-panel">
                <p class="farm-step-desc">{{ currentFarmStep.description }}</p>
                <div class="mission-hud">
                  <span>当前任务：{{ currentFarmStep.name }}</span>
                  <span>完成度：{{ currentStepCompleteText }}</span>
                </div>

            <div v-if="activeFarmStep === 'sow'" class="farm-game-board">
              <div class="drag-items">
                <div v-for="n in 4" :key="`seed-${n}`" class="drag-chip" draggable="true" @dragstart="onFarmDragStart('seed', n)">🌰 种子</div>
              </div>
              <div class="drop-grid">
                <div
                  v-for="(filled, idx) in farmGameState.sowFilled"
                  :key="`plot-${idx}`"
                  class="drop-cell"
                  @dragover.prevent
                  @drop="onSowDrop(idx)"
                >
                  {{ filled ? '🌱' : '田地' }}
                </div>
              </div>
            </div>

            <div v-if="activeFarmStep === 'water'" class="farm-game-board">
              <div class="drag-items">
                <div class="drag-chip" draggable="true" @dragstart="onFarmDragStart('watering', 0)">💧 洒水壶</div>
              </div>
              <div class="drop-grid">
                <div
                  v-for="(wet, idx) in farmGameState.waterWet"
                  :key="`wet-${idx}`"
                  class="drop-cell"
                  :class="{ wet }"
                  @dragover.prevent
                  @drop="onWaterDrop(idx)"
                >
                  {{ wet ? '湿润土壤' : '干涸土地' }}
                </div>
              </div>
            </div>

            <div v-if="activeFarmStep === 'weed'" class="farm-game-board">
              <div class="drag-items weeds">
                <div
                  v-for="(removed, idx) in farmGameState.weedRemoved"
                  :key="`weed-${idx}`"
                  class="drag-chip weed"
                  :class="{ removed }"
                  draggable="true"
                  @dragstart="onFarmDragStart('weed', idx)"
                  @click="removeWeedByClick(idx)"
                >
                  {{ removed ? '✅ 已清理' : '🌿 杂草' }}
                </div>
              </div>
              <div class="trash-bin" @dragover.prevent @drop="onWeedDropToBin">🗑️ 垃圾桶</div>
            </div>

            <div v-if="activeFarmStep === 'harvest'" class="farm-game-board">
              <div class="drag-items">
                <div
                  v-for="(collected, idx) in farmGameState.harvestCollected"
                  :key="`fruit-${idx}`"
                  class="drag-chip"
                  :class="{ removed: collected }"
                  draggable="true"
                  @dragstart="onFarmDragStart('fruit', idx)"
                >
                  {{ collected ? '✅ 已收获' : '🍅 果实' }}
                </div>
              </div>
              <div class="basket-zone" :class="{ shake: basketShake }" @dragover.prevent @drop="onHarvestDrop">🧺 收获篮 {{ harvestDing }}</div>
            </div>

                <div class="farm-quiz-box">
                  <p>❓ {{ currentFarmQuiz.question }}</p>
                  <div class="quiz-inline-options">
                    <button
                      v-for="option in currentFarmQuiz.options"
                      :key="option"
                      class="quiz-inline-btn"
                      @click="answerFarmQuiz(option)"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <div class="farm-poem-box">
                  <div class="farm-poem-head">
                    <strong>📜 田间诗词任务</strong>
                    <span>{{ farmPoemProgressText }}</span>
                  </div>

                  <div class="farm-poem-tabs">
                    <button
                      v-for="(item, idx) in farmPoemTasks"
                      :key="item.id"
                      class="farm-poem-tab"
                      :class="{ active: currentFarmPoem?.id === item.id, done: farmPoemAnswered[item.id], locked: idx >= unlockedFarmPoemCount }"
                      :disabled="idx >= unlockedFarmPoemCount"
                      @click="selectFarmPoem(idx)"
                    >
                      {{ idx + 1 }}. {{ item.short }}
                    </button>
                  </div>

                  <p v-if="!currentFarmPoem" class="empty-tip">先完成农耕步骤，解锁诗词挑战～</p>
                  <template v-else>
                    <p class="farm-poem-line">“{{ currentFarmPoem.line }}”</p>
                    <p class="farm-poem-q">这句更贴近哪个农耕场景？</p>
                    <div class="quiz-inline-options">
                      <button
                        v-for="opt in currentFarmPoem.options"
                        :key="opt"
                        class="quiz-inline-btn"
                        :disabled="isCurrentFarmPoemDone"
                        @click="answerFarmPoem(opt)"
                      >
                        {{ opt }}
                      </button>
                    </div>
                  </template>
                </div>

                <p v-if="farmPoemFeedback" class="farm-feedback">{{ farmPoemFeedback }}</p>

                <p v-if="farmFeedback" class="farm-feedback">{{ farmFeedback }}</p>

                <button v-if="isCurrentStepDone && activeFarmStep !== 'harvest'" class="quiz-next-btn" @click="goNextFarmStep">下一步挑战 ➜</button>
              </div>
            </div>
          </div>

          <div v-if="showStepToast" class="step-toast">{{ stepToastText }}</div>

          <div class="sparkle-layer">
            <span v-for="spark in sparkleBursts" :key="spark.id" class="spark-item" :style="{ left: spark.left + '%', top: spark.top + '%' }">
              {{ spark.text }}
            </span>
          </div>
        </div>

        <div v-if="selectedCategory === 4" class="content-section solar-section">
          <h2>🕰️ 节气与农耕</h2>

          <section class="solar-block">
            <div class="solar-block-head">
              <h3>🧭 节气转盘</h3>
              <span>点击节气查看对应农耕知识</span>
            </div>

            <div class="solar-wheel-layout">
                <div class="solar-wheel-wrap">
                    <!-- 只旋转外圈 -->
                    <div class="solar-wheel-rotator"
                         :style="{ transform: `translate(-50%, -50%) rotate(${termSpinDeg}deg)` }">
                        <div class="solar-ring"></div>

                        <div v-for="(term, idx) in solarTerms"
                             :key="term.name"
                             class="solar-term-item"
                             :class="{ active: selectedSolarTermKey === term.name }"
                             :style="termItemStyle(idx)"
                             @click="selectSolarTerm(term, idx)">
                            <span class="solar-term-label"
                                  :style="{ transform: `rotate(${-termSpinDeg}deg)` }">
                                {{ term.name }}
                            </span>
                        </div>
                    </div>

                    <!-- 中间图固定，不参与旋转 -->
                    <div class="solar-center">
                        <img class="solar-center-image"
                             :src="selectedSolarTerm.image"
                             :alt="selectedSolarTerm.name" />
                    </div>
                </div>

                <div class="solar-detail-card">
                    <h3>{{ selectedSolarTerm.name }} · {{ selectedSolarTerm.seasonName }}</h3>
                    <p>{{ selectedSolarTerm.description }}</p>
                </div>
            </div>
          </section>

          <section class="solar-block">
            <div class="solar-block-head">
              <h3>🎼 节气歌学习</h3>
              <span>点击诗句朗读，支持儿童跟唱</span>
            </div>

            <div class="solar-song-grid">
            <div class="song-card">
              <h4>🎵 传统二十四节气歌（完整版）</h4>
              <p
                v-for="(line, idx) in fullSongLines"
                :key="`full-${idx}`"
                class="song-line"
                :class="{ active: currentSongLineIndex === idx }"
                @click="singSongLine(line, idx)"
              >
                {{ line }}
              </p>
            </div>
            <div class="song-card">
              <h4>🎶 儿童简易版</h4>
              <p
                v-for="(line, idx) in kidSongLines"
                :key="`kid-${idx}`"
                class="song-line"
                :class="{ active: currentSongLineIndex === idx + 100 }"
                @click="singSongLine(line, idx + 100)"
              >
                {{ line }}
              </p>
              <button class="quiz-next-btn" @click="followSingKidSong">跟唱练习</button>
            </div>
            </div>
          </section>

          <section class="solar-block">
            <div class="solar-block-head">
              <h3>🎮 节气互动游戏</h3>
              <span>配对、拼图、填空三种闯关玩法</span>
            </div>

            <div class="solar-game-hub">
            <div class="solar-game-menu">
              <button
                v-for="g in solarGameMeta"
                :key="g.key"
                class="solar-game-tab"
                :class="{ active: selectedSolarGame === g.key }"
                @click="selectedSolarGame = g.key"
              >
                <span>{{ g.icon }} {{ g.name }}</span>
                <small>{{ gameStats[g.key].correct }}/{{ gameQuestionTotals[g.key] }}</small>
              </button>
            </div>

            <div class="solar-game-stage">
              <div class="solar-game-head">
                <h4>{{ activeSolarGameMeta.icon }} {{ activeSolarGameMeta.name }}</h4>
                <div class="game-head-right">
                  <span class="game-acc">正确率：{{ activeGameAccuracy }}</span>
                  <span class="game-streak">连对：{{ solarGameStreak }}</span>
                  <button class="reset-mini-btn" @click="resetSolarGameStats">重置成绩</button>
                </div>
              </div>

              <div class="game-overview">
                <span>总进度：{{ currentGameProgressDone }}/{{ currentGameTotal }}</span>
                <div class="game-progress-track">
                  <div class="game-progress-fill" :style="{ width: currentGameProgressPercent + '%' }"></div>
                </div>
                <span>{{ currentGameProgressPercent }}%</span>
              </div>

              <div v-if="selectedSolarGame === 'match'" class="game-card">
                <p>“{{ currentSeasonCropQuiz.term }}”时节适合什么作物？</p>
                <div class="quiz-inline-options">
                  <button
                    v-for="option in currentSeasonCropQuiz.options"
                    :key="option"
                    class="quiz-inline-btn"
                    :class="{ grow: cropGrowFx && option === currentSeasonCropQuiz.answer }"
                    :disabled="matchAnswered"
                    @click="answerSeasonCropQuiz(option)"
                  >
                    {{ option }}
                  </button>
                </div>
                <p v-if="seasonCropFeedback" class="farm-feedback">{{ seasonCropFeedback }}</p>
                <button v-if="matchNeedManualNext" class="quiz-next-btn" @click="nextSeasonCropQuiz">下一题</button>
              </div>

              <div v-if="selectedSolarGame === 'puzzle'" class="game-card">
                <p>按顺序拼出完整节气歌（已完成 {{ puzzleSolvedLines.length }}/{{ fullSongLines.length }}）</p>
                <div class="puzzle-area">
                  <div class="puzzle-solved">
                    <div v-for="(line, idx) in puzzleSolvedLines" :key="`solved-${idx}`" class="puzzle-piece solved">{{ line }}</div>
                  </div>
                  <div class="puzzle-pool">
                    <button
                      v-for="piece in puzzlePieces"
                      :key="piece"
                      class="puzzle-piece"
                      @click="pickPuzzlePiece(piece)"
                    >
                      {{ piece }}
                    </button>
                  </div>
                </div>
                <p v-if="puzzleFeedback" class="farm-feedback">{{ puzzleFeedback }}</p>
                <p v-if="puzzleMedal" class="farm-feedback">🏅 获得“节气小歌手”勋章！</p>
                <button class="quiz-next-btn" @click="resetPuzzleGame">重置拼图</button>
              </div>

              <div v-if="selectedSolarGame === 'fill'" class="game-card">
                <p class="fill-q">{{ currentFillQuiz.sentence }}</p>
                <div class="quiz-inline-options">
                  <button
                    v-for="opt in currentFillQuiz.options"
                    :key="opt"
                    class="quiz-inline-btn"
                    :disabled="fillAnswered"
                    @click="answerFillQuiz(opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
                <p v-if="fillFeedback" class="farm-feedback">{{ fillFeedback }}</p>
                <button v-if="fillNeedManualNext" class="quiz-next-btn" @click="nextFillQuiz">下一题</button>
              </div>
            </div>
            </div>
          </section>
        </div>

        <div v-if="selectedCategory === 5" class="content-section folk-section">
          <h2>🏮 农耕民俗</h2>
          <div class="folk-season-tabs">
            <button
              v-for="season in folkSeasonTabs"
              :key="season.key"
              class="type-tab"
              :class="{ active: selectedFolkSeason === season.key }"
              @click="selectedFolkSeason = season.key"
            >
              {{ season.icon }} {{ season.name }}
            </button>
          </div>

          <div class="folk-grid">
            <article v-for="item in currentFolkCustoms" :key="item.name" class="folk-card">
              <div class="folk-head">
                <h3>{{ item.name }}</h3>
                <button class="speaker-btn" @click="playAudio(`${item.name}，${item.pinyin}。${item.description}。${item.tip}`)">🔊</button>
              </div>
              <p class="folk-pinyin">（{{ item.pinyin }}）</p>
              <p class="folk-desc">{{ item.description }}</p>
              <p class="folk-tip">{{ item.tip }}</p>
            </article>
          </div>
        </div>

        <div v-if="selectedCategory === 6" class="content-section poem-section">
          <h2>📜 农耕古诗词</h2>

          <div class="poem-layout">
            <aside class="poem-left-nav">
              <h3>点击进入学习</h3>
              <button
                v-for="poem in poetPoems"
                :key="poem.key"
                class="poem-nav-item"
                :class="{ active: selectedPoemKey === poem.key }"
                @click="selectedPoemKey = poem.key"
              >
                <span>{{ poem.title }}（{{ poem.author }}）</span>
                <small>{{ poemLearnedMap[poem.key] ? '✅ 已学习' : '🕒 未学习' }}</small>
              </button>
              <div class="poem-progress">学习进度：{{ learnedPoemCount }}/{{ poetPoems.length }}</div>
            </aside>

            <section class="poem-main">
              <div class="poem-content-card">
                <h3>{{ currentPoem.title }}（{{ currentPoem.dynasty }}·{{ currentPoem.author }}）</h3>
                <div class="poem-lines">
                  <div v-for="line in currentPoem.lines" :key="line.id" class="poem-line-row">
                    <span class="poem-line-text">{{ line.text }}</span>
                    <span class="poem-line-pinyin">{{ line.pinyin }}</span>
                  </div>
                </div>
                <p class="poem-meaning">讲解：{{ currentPoem.meaning }}</p>
              </div>

              <div class="poem-games-card">
                <h4>🎨 诗意绘画坊</h4>
                <ol>
                  <li v-for="(step, idx) in currentPoem.drawingSteps" :key="`step-${idx}`">{{ step }}</li>
                </ol>
              </div>

              <div class="poem-tip-card">💡 {{ currentPoem.tip }}</div>
            </section>

            <aside class="poet-ai-panel">
              <h3>动画诗人互动</h3>
              <button class="quiz-next-btn" @click="talkWithPoet">🎙️ 点击听诗人讲解</button>
              <p class="poet-talk">{{ poetTalk }}</p>
              <p class="poet-ai-tip">点击按钮可触发AI语音讲解与互动。</p>

              <div class="poem-footprint-card">
                <h4>🗺️ 诗人足迹地图</h4>
                <div class="footprint-list">
                  <div v-for="poem in poetPoems" :key="`footprint-${poem.key}`" class="footprint-item">
                    <span>{{ poem.author }} → {{ poem.location }}</span>
                    <small>{{ poemLearnedMap[poem.key] ? '📍 已点亮' : '○ 未点亮' }}</small>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetail" class="detail-modal" @click="closeDetail">
      <div class="modal-content learning-content" @click.stop>
        <div class="learn-top">
          <div class="cartoon-panel">
            <div class="real-box">
              <img :src="detailData.realImage" alt="实物图" />
              <div>实物图（shí wù tú）</div>
            </div>
          </div>

          <div class="info-panel">
            <h3>{{ detailData.name }}（{{ detailData.pinyin }}）</h3>
            <div class="group-tags" v-if="detailData.primaryGroup">
              <span class="group-tag main">主类：{{ detailData.primaryGroup }}</span>
              <span v-for="g in detailData.secondaryGroups || []" :key="g" class="group-tag sub">副类：{{ g }}</span>
            </div>
            <div class="info-card base-card">
              <h4>📘 基础知识</h4>
              <p class="desc" v-html="detailData.description"></p>
              <div class="follow-row">
                <span>{{ detailData.readText }}</span>
                <button class="speaker-btn" @click="playAndFollowRead">🔊</button>
              </div>
              <div v-if="isRecording" class="record-tip">🎙️ 正在录音跟读中...</div>
            </div>
            <div class="info-card tip-card">
              <h4>💡 趣味提示</h4>
              <div class="detail-tip">{{ detailData.tip }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showQuizModal && detailData.quiz" class="quiz-pop-mask">
      <div class="quiz-pop-card">
        <h4>🧠 小提问</h4>
        <p class="quiz-question">{{ detailData.quiz.question }}</p>
        <div class="quiz-inline-options">
          <button
            v-for="option in detailData.quiz.options"
            :key="option"
            class="quiz-inline-btn"
            :disabled="quizAnswered"
            @click="answerQuizOption(option)"
          >
            {{ option }}
          </button>
        </div>
        <p v-if="quizFeedback" class="quiz-feedback">{{ quizFeedback }}</p>
        <button v-if="quizAnswered" class="quiz-next-btn" @click="closeQuizModal">继续学习</button>
      </div>
    </div>

    <div v-if="showMedalPopup" class="medal-pop-mask" @click="showMedalPopup = false">
      <div class="medal-pop-card" @click.stop>
        <div class="medal-emoji">🏅</div>
        <h4>太棒啦！获得知识小勋章</h4>
        <p>当前勋章数量：{{ medalCount }}</p>
        <button class="quiz-next-btn" @click="showMedalPopup = false">我知道啦</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
    // 动态导入所有节气图片
 const solarImageModules = import.meta.glob('@/assets/images/classPage/qi/*.jpg', { eager: true })
const classImageModules = import.meta.glob('@/assets/images/classPage/**/*.{png,jpg,jpeg,webp}', { eager: true })

const normalizeImageName = (name = '') =>
  String(name).replace(/[\s/＋+]/g, '').toLowerCase()

const pickImageAlias = (name = '') => String(name).split(/[\/＋+]/)[0].trim()

const classImageAliasMap = {
  镐: '镐头',
  石碾: '石磨',
  石碾石磨: '石磨',
  石碾石磨实物图: '石磨'
}

const findClassImageByName = (name, fallback = '') => {
  const targets = Array.from(
    new Set(
      [name, pickImageAlias(name), classImageAliasMap[name], classImageAliasMap[pickImageAlias(name)]]
        .filter(Boolean)
        .map((item) => normalizeImageName(item))
    )
  )
  if (targets.length === 0) return fallback
  for (const [path, module] of Object.entries(classImageModules)) {
    const fileName = path.split('/').pop()?.replace(/\.[^.]+$/, '') || ''
    if (targets.includes(normalizeImageName(fileName))) {
      return module.default || module
    }
  }
  return fallback
}

const isLocalClassImage = (imageUrl = '') => !!imageUrl && !String(imageUrl).includes('dummyimage.com')
const selectedCategory = ref(1)
const searchQuery = ref('')
const showDetail = ref(false)
const detailData = ref({})

const popCard = ref('')
const showInlineQuiz = ref(false)
const quizAnswered = ref(false)
const quizFeedback = ref('')
const medalCount = ref(0)
const isRecording = ref(false)
const showQuizModal = ref(false)
const showMedalPopup = ref(false)
const selectedCropType = ref('粮食作物')
const selectedToolType = ref('传统农具')

const categories = [
  { id: 1, name: '农作物认知', icon: '🌾' },
  { id: 2, name: '农具认知', icon: '🛠️' },
  { id: 3, name: '农耕流程', icon: '🌱' },
  { id: 4, name: '节气与农耕', icon: '🕰️' },
  { id: 5, name: '农耕民俗', icon: '🏮' },
  { id: 6, name: '农耕古诗词', icon: '📜' }
]

const farmRoles = [
  { id: 'boy-hat', name: '草帽男孩', emoji: '👦👒' },
  { id: 'girl-headscarf', name: '头巾女孩', emoji: '👧🧕' }
]
const selectedFarmRole = ref('boy-hat')

const farmSteps = [
  { key: 'sow', name: '播种', description: '把种子拖到田地格子里，完成播种。' },
  { key: 'water', name: '浇水', description: '拖拽洒水壶给干涸土地浇水，土地会变湿润。' },
  { key: 'weed', name: '除草', description: '点击或拖拽杂草到垃圾桶，清理田地。' },
  { key: 'harvest', name: '收获', description: '将果实拖进篮子，听到“叮”表示收获成功。' }
]
const activeFarmStep = ref('sow')

const farmUnlockTools = [
  { icon: '💧', name: '水壶' },
  { icon: '⛏️', name: '锄头' },
  { icon: '🧺', name: '篮子' },
  { icon: '👒', name: '草帽' }
]

const farmGameState = reactive({
  sowFilled: [false, false, false, false],
  waterWet: [false, false, false],
  weedRemoved: [false, false, false, false],
  harvestCollected: [false, false, false, false]
})

const farmQuizCorrect = reactive({
  sow: false,
  water: false,
  weed: false,
  harvest: false
})

const farmStepAwarded = reactive({
  sow: false,
  water: false,
  weed: false,
  harvest: false
})

const farmStepQuizMap = {
  sow: { question: '播种时种子应该放在哪里？', options: ['田地格子里', '垃圾桶里', '篮子里'], answer: '田地格子里' },
  water: { question: '浇水后土地会变成什么状态？', options: ['湿润', '更干', '结冰'], answer: '湿润' },
  weed: { question: '除草后杂草应该放到哪里？', options: ['垃圾桶', '水桶', '篮子'], answer: '垃圾桶' },
  harvest: { question: '收获时果实要放进哪里？', options: ['篮子', '土里', '工具箱'], answer: '篮子' }
}

const farmPoemTasks = [
  {
    id: 'poem-1',
    short: '悯农',
    title: '悯农·其二',
    line: '锄禾日当午',
    options: ['烈日下田间劳作', '雪地里堆雪人', '海边打渔'],
    answer: '烈日下田间劳作',
    hint: '想想“锄禾”发生在哪里。',
    explain: '农民在正午烈日下锄草劳作，非常辛苦。'
  },
  {
    id: 'poem-2',
    short: '归园田居',
    title: '归园田居·其三',
    line: '晨兴理荒秽',
    options: ['清晨下田除草', '夜里赶集买菜', '中午在书房读书'],
    answer: '清晨下田除草',
    hint: '“晨兴”说明时间在早晨。',
    explain: '天刚亮就去田里整理杂草，体现勤劳耕作。'
  },
  {
    id: 'poem-3',
    short: '四时田园',
    title: '四时田园杂兴',
    line: '也傍桑阴学种瓜',
    options: ['树荫下学种瓜', '山顶上看云海', '河边练习划船'],
    answer: '树荫下学种瓜',
    hint: '关键词是“桑阴”“种瓜”。',
    explain: '孩子在桑树荫下学习种瓜，表现劳动学习场景。'
  },
  {
    id: 'poem-4',
    short: '珍惜粮食',
    title: '谁知盘中餐',
    line: '粒粒皆辛苦',
    options: ['每粒粮食都来之不易', '果树开花最好看', '下雨天最适合玩耍'],
    answer: '每粒粮食都来之不易',
    hint: '和“盘中餐”有关。',
    explain: '提醒我们珍惜粮食，尊重农耕劳动成果。'
  }
]

const farmFeedback = ref('')
const farmDragData = ref(null)
const basketShake = ref(false)
const harvestDing = ref('')
const treeFx = ref(false)
const farmScore = ref(0)
const farmCombo = ref(0)
const comboFlash = ref(false)
const coachMessage = ref('欢迎来到农田挑战，先从播种开始吧！')
const chestReady = ref(false)
const chestFxText = ref('')
const showStepToast = ref(false)
const stepToastText = ref('')
const sparkleBursts = ref([])
const farmPoemIndex = ref(0)
const farmPoemAnswered = reactive({})
const farmPoemFeedback = ref('')
let sparkleAutoId = 1

const coachPraisePool = ['太棒啦！', '你真是小能手！', '继续保持！', '操作很标准！', '离丰收更近一步啦！']



    // 图片文件名映射
    const getSolarImage = (termName) => {
        const imageMap = {
            '立春': '立春.jpg',
            '雨水': '雨水.jpg',
            '惊蛰': '惊蛰.jpg',
            '春分': '春分.jpg',
            '清明': '清明.jpg',
            '谷雨': '谷雨.jpg',
            '立夏': '立夏.jpg',
            '小满': '小满.jpg',
            '芒种': '芒种.jpg',
            '夏至': '夏至.jpg',
            '小暑': '小暑.jpg',
            '大暑': '大暑.jpg',
            '立秋': '立秋.jpg',
            '处暑': '处暑.jpg',
            '白露': '白露.jpg',
            '秋分': '秋分.jpg',
            '寒露': '寒露.jpg',
            '霜降': '霜降.jpg',
            '立冬': '立冬.jpg',
            '小雪': '小雪.jpg',
            '大雪': '大雪.jpg',
            '冬至': '冬至.jpg',
            '小寒': '小寒.jpg',
            '大寒': '大寒.jpg'
        }

        const fileName = imageMap[termName]
        const imagePath = `/src/assets/images/classPage/qi/${fileName}`

        // 从动态导入的模块中获取图片
        for (const [path, module] of Object.entries(solarImageModules)) {
            if (path.includes(fileName)) {
                return module.default || module
            }
        }

        // 如果找不到，返回默认图片或空字符串
        return imagePath
    }
    const solarTerms = [
        { name: '立春', seasonName: '春季', seasonClass: 'spring', seasonIcon: '🌱', description: '立春万物复苏，农田开始备耕整地。', image: getSolarImage('立春') },
        { name: '雨水', seasonName: '春季', seasonClass: 'spring', seasonIcon: '🌿', description: '雨水增多，利于春播和幼苗生长。', image: getSolarImage('雨水') },
        { name: '惊蛰', seasonName: '春季', seasonClass: 'spring', seasonIcon: '🌼', description: '惊蛰雷动，虫苏土暖，适合翻地松土。', image: getSolarImage('惊蛰') },
        { name: '春分', seasonName: '春季', seasonClass: 'spring', seasonIcon: '🌸', description: '昼夜平分，作物进入快速生长期。', image: getSolarImage('春分') },
        { name: '清明', seasonName: '春季', seasonClass: 'spring', seasonIcon: '🍃', description: '气温回升，适合田间管理与补种。', image: getSolarImage('清明') },
        { name: '谷雨', seasonName: '春季', seasonClass: 'spring', seasonIcon: '🌾', description: '雨生百谷，是春播春种的重要节点。', image: getSolarImage('谷雨') },
        { name: '立夏', seasonName: '夏季', seasonClass: 'summer', seasonIcon: '🌞', description: '立夏后温度升高，苗壮叶茂。', image: getSolarImage('立夏') },
        { name: '小满', seasonName: '夏季', seasonClass: 'summer', seasonIcon: '🌽', description: '小满时麦类灌浆，田间追肥要及时。', image: getSolarImage('小满') },
        { name: '芒种', seasonName: '夏季', seasonClass: 'summer', seasonIcon: '🌾', description: '芒种忙种忙收，南北农事最繁忙。', image: getSolarImage('芒种') },
        { name: '夏至', seasonName: '夏季', seasonClass: 'summer', seasonIcon: '☀️', description: '日照最长，注意灌溉和病虫防治。', image: getSolarImage('夏至') },
        { name: '小暑', seasonName: '夏季', seasonClass: 'summer', seasonIcon: '💦', description: '暑热渐盛，田间保水防旱。', image: getSolarImage('小暑') },
        { name: '大暑', seasonName: '夏季', seasonClass: 'summer', seasonIcon: '🔥', description: '高温多雨并存，作物管理要精细。', image: getSolarImage('大暑') },
        { name: '立秋', seasonName: '秋季', seasonClass: 'autumn', seasonIcon: '🍂', description: '立秋后早晚转凉，果实陆续成熟。', image: getSolarImage('立秋') },
        { name: '处暑', seasonName: '秋季', seasonClass: 'autumn', seasonIcon: '🍁', description: '暑气渐退，进入秋收准备期。', image: getSolarImage('处暑') },
        { name: '白露', seasonName: '秋季', seasonClass: 'autumn', seasonIcon: '🌫️', description: '昼夜温差增大，注意作物防露防病。', image: getSolarImage('白露') },
        { name: '秋分', seasonName: '秋季', seasonClass: 'autumn', seasonIcon: '🌕', description: '秋分时节，田间收获与播种并行。', image: getSolarImage('秋分') },
        { name: '寒露', seasonName: '秋季', seasonClass: 'autumn', seasonIcon: '🥶', description: '气温明显下降，晚秋作物抓紧收。', image: getSolarImage('寒露') },
        { name: '霜降', seasonName: '秋季', seasonClass: 'autumn', seasonIcon: '❄️', description: '霜降后进入深秋，农作收尾。', image: getSolarImage('霜降') },
        { name: '立冬', seasonName: '冬季', seasonClass: 'winter', seasonIcon: '⛄', description: '立冬后农闲渐显，开始冬季储备。', image: getSolarImage('立冬') },
        { name: '小雪', seasonName: '冬季', seasonClass: 'winter', seasonIcon: '🌨️', description: '小雪时节注意作物防寒保温。', image: getSolarImage('小雪') },
        { name: '大雪', seasonName: '冬季', seasonClass: 'winter', seasonIcon: '❄️', description: '大雪寒重，田地休养生息。', image: getSolarImage('大雪') },
        { name: '冬至', seasonName: '冬季', seasonClass: 'winter', seasonIcon: '🧊', description: '冬至夜最长，规划来年农事。', image: getSolarImage('冬至') },
        { name: '小寒', seasonName: '冬季', seasonClass: 'winter', seasonIcon: '🥶', description: '小寒天气寒冷，农机农具养护关键。', image: getSolarImage('小寒') },
        { name: '大寒', seasonName: '冬季', seasonClass: 'winter', seasonIcon: '🧤', description: '大寒岁末，为新一年春耕做准备。', image: getSolarImage('大寒') }
    ].map((item) => ({
        ...item,
        videoPoster: `https://dummyimage.com/520x290/e8f5e9/2e7d32&text=${encodeURIComponent(item.name)}节气动画`,
        video: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }))

const selectedSolarTermKey = ref('立春')
const termSpinDeg = ref(0)

const fullSongLines = [
  '春雨惊春清谷天，夏满芒夏暑相连，',
  '秋处露秋寒霜降，冬雪雪冬小大寒。',
  '上半年逢六廿一，下半年逢八廿三，',
  '每月两节日期定，最多相差一两天。'
]
const kidSongLines = [
  '立春雨水忙播种，惊蛰春分虫儿动，',
  '清明谷雨长庄稼，立夏小满麦穗重。',
  '芒种夏至忙收割，小暑大暑热烘烘，',
  '立秋处暑果飘香，白露秋分丰收颂。',
  '寒露霜降收最后，立冬小雪入寒冬，',
  '大雪冬至天最冷，小寒大寒又一冬。'
]
const currentSongLineIndex = ref(-1)

const seasonCropQuizzes = [
  { term: '谷雨', options: ['水稻', '苹果', '棉花'], answer: '水稻' },
  { term: '芒种', options: ['小麦', '香蕉', '土豆'], answer: '小麦' },
  { term: '立秋', options: ['玉米', '西瓜', '甘蔗'], answer: '玉米' },
  { term: '小满', options: ['麦类', '甘蓝', '荔枝'], answer: '麦类' }
]
const seasonCropQuizIndex = ref(0)
const seasonCropFeedback = ref('')
const cropGrowFx = ref(false)

const fillQuizzes = [
  { sentence: '春雨惊春__谷天', options: ['清', '青', '轻'], answer: '清' },
  { sentence: '夏满芒夏暑__连', options: ['香', '相', '向'], answer: '相' },
  { sentence: '秋处露秋寒__降', options: ['霜', '双', '桑'], answer: '霜' },
  { sentence: '冬雪雪冬小__寒', options: ['大', '太', '达'], answer: '大' }
]
const fillQuizIndex = ref(0)
const fillFeedback = ref('')

const solarGameMeta = [
  { key: 'match', name: '作物配对', icon: '🌾' },
  { key: 'puzzle', name: '节气拼图', icon: '🧩' },
  { key: 'fill', name: '节气填空', icon: '✍️' }
]
const selectedSolarGame = ref('match')
const gameStats = reactive({
  match: { correct: 0, total: 0 },
  puzzle: { correct: 0, total: 0 },
  fill: { correct: 0, total: 0 }
})
const gameQuestionTotals = {
  match: seasonCropQuizzes.length,
  puzzle: fullSongLines.length,
  fill: fillQuizzes.length
}
const matchAnswered = ref(false)
const fillAnswered = ref(false)
const matchNeedManualNext = ref(false)
const fillNeedManualNext = ref(false)
const solarGameStreak = ref(0)

const puzzlePieces = ref([])
const puzzleSolvedLines = ref([])
const puzzleFeedback = ref('')
const puzzleMedal = ref(false)

const selectedFolkSeason = ref('spring')
const folkSeasonTabs = [
  { key: 'spring', name: '春季', icon: '🌸' },
  { key: 'summer', name: '夏季', icon: '🌞' },
  { key: 'autumn', name: '秋季', icon: '🍁' },
  { key: 'winter', name: '冬季', icon: '❄️' }
]
const folkCustomsMap = {
  spring: [
    {
      name: '二月二，龙抬头',
      pinyin: 'èr yuè èr，lóng tái tóu',
      description: '农历二月初二，传说龙王抬起头，要开始下雨啦！农民伯伯剃龙头、吃炒豆，祈盼春雨滋润庄稼。这时候要开始春耕了！',
      tip: '趣味小提示：“二月二，龙抬头，大家小户使耕牛”——这一天，农民伯伯把牛牵出来，准备犁地啦！'
    },
    {
      name: '社日节',
      pinyin: 'shè rì jié',
      description: '春天祭祀土地神的日子，感谢土地爷爷让庄稼长得壮。农民伯伯带着酒肉、米饭到田边祭拜，大家围在一起唱歌跳舞，热闹极了！',
      tip: '趣味小提示：社日节分“春社”和“秋社”，春社祈求丰收，秋社庆祝丰收！'
    },
    {
      name: '花朝节',
      pinyin: 'huā zhāo jié',
      description: '农历二月十二，是百花生日！农民伯伯给果树挂红布条，祈盼花开得多、果子结得大。姑娘们还会去郊外赏花扑蝶，可美啦！',
      tip: '趣味小提示：有些地方叫“花神节”，传说花神会保佑果树不受虫害哦！'
    }
  ],
  summer: [
    {
      name: '端午插秧',
      pinyin: 'duān wǔ chā yāng',
      description: '端午节前后，南方农民伯伯忙着插秧。水田里，大家弯着腰，把一株株秧苗插进泥里，像在田里“写字”一样！',
      tip: '趣味小提示：端午节不仅要吃粽子，还要在田边插艾草，驱赶害虫保护庄稼！'
    },
    {
      name: '祭牛节',
      pinyin: 'jì niú jié',
      description: '农历四月初八，农民伯伯给耕牛放假一天，给它洗澡、喂好吃的，感谢牛牛一年到头辛苦耕地。牛角上还会挂红布、戴花环，可神气啦！',
      tip: '趣味小提示：有些地方会给牛喂糯米粥，说“牛吃糯米粥，力气大如虎”！'
    }
  ],
  autumn: [
    {
      name: '中秋节',
      pinyin: 'zhōng qiū jié',
      description: '农历八月十五，是丰收的节日！农民伯伯用新收的粮食做成月饼、糍粑，一家人围坐赏月，感谢月亮的保佑，祈盼来年也大丰收。',
      tip: '趣味小提示：中秋节的月亮又大又圆，就像金黄的月饼，也像饱满的粮仓！'
    },
    {
      name: '尝新节',
      pinyin: 'cháng xīn jié',
      description: '新米、新麦收获后，农民伯伯第一次品尝新粮，感谢老天爷和土地爷爷的恩赐。大家把新米做成饭，先敬祖先，再全家人一起分享。',
      tip: '趣味小提示：尝新节也叫“吃新节”，侗族、苗族等少数民族特别重视，比过年还热闹！'
    },
    {
      name: '秋社',
      pinyin: 'qiū shè',
      description: '秋天祭祀土地神，感谢土地爷爷让庄稼大丰收。农民伯伯把最好的粮食、水果摆在田边，敲锣打鼓，热热闹闹地庆祝。',
      tip: '趣味小提示：唐代诗人王驾写过“桑柘影斜春社散，家家扶得醉人归”，说的就是社日节的热闹场面！'
    }
  ],
  winter: [
    {
      name: '腊八节',
      pinyin: 'là bā jié',
      description: '农历腊月初八，农民伯伯用八种粮食熬成腊八粥，感谢一年来的丰收，也祈盼来年风调雨顺。喝腊八粥，五谷丰登，六畜兴旺！',
      tip: '趣味小提示：腊八粥里的每种粮食都有寓意，红豆代表红火，花生代表长寿，红枣代表甜蜜！'
    },
    {
      name: '祭灶节',
      pinyin: 'jì zào jié',
      description: '农历腊月二十三或二十四，农民伯伯送灶王爷上天，向玉皇大帝汇报一年的收成。大家给灶王爷供上糖瓜、麦芽糖，希望他“上天言好事，下界保平安”。',
      tip: '趣味小提示：给灶王爷吃糖，是想让他的嘴巴甜一点，多说好话，保佑来年大丰收！'
    },
    {
      name: '除夕守岁',
      pinyin: 'chú xī shǒu suì',
      description: '一年的最后一天，全家团聚，辞旧迎新。农民伯伯会把粮仓装满，寓意来年粮食吃不完；还会在门口挂红灯笼，照亮来年的丰收路。',
      tip: '趣味小提示：除夕夜，有些地方会在田里点“照田蚕”的火把，火光越旺，来年收成越好！'
    }
  ]
}

const poetPoems = [
  {
    key: 'minong2',
    title: '悯农·其二',
    author: '李绅',
    dynasty: '唐',
    location: '江苏无锡',
    sceneImage: 'https://dummyimage.com/640x360/f5efe2/6d4c41&text=悯农+农夫锄地',
    illustration: 'https://dummyimage.com/220x260/fff8e1/8d6e63&text=李绅+Q版诗人',
    meaning: '农民伯伯在中午大太阳下锄草，汗水一滴一滴流到禾苗下面的土里。有谁知道我们碗里的饭，每一粒都是农民伯伯辛辛苦苦种出来的呀！',
    tip: '趣味小提示：这首诗告诉我们，不能浪费粮食，因为每一粒米饭都来之不易！古人说“一粥一饭，当思来处不易”，就是这个道理哦～',
    lines: [
      { id: 'minong-l1', text: '锄禾日当午', pinyin: 'chú hé rì dāng wǔ', sceneId: 's1' },
      { id: 'minong-l2', text: '汗滴禾下土', pinyin: 'hàn dī hé xià tǔ', sceneId: 's2' },
      { id: 'minong-l3', text: '谁知盘中餐', pinyin: 'shuí zhī pán zhōng cān', sceneId: 's3' },
      { id: 'minong-l4', text: '粒粒皆辛苦', pinyin: 'lì lì jiē xīn kǔ', sceneId: 's4' }
    ],
    matchScenes: [
      { id: 's1', label: '烈日高照，农夫弯腰锄地', image: 'https://dummyimage.com/260x140/fff3e0/ef6c00&text=烈日锄地' },
      { id: 's2', label: '汗珠滴落到禾苗下的泥土', image: 'https://dummyimage.com/260x140/e3f2fd/1565c0&text=汗滴禾下土' },
      { id: 's3', label: '孩子端着饭碗准备吃饭', image: 'https://dummyimage.com/260x140/fff8e1/f9a825&text=盘中餐' },
      { id: 's4', label: '放大的每一粒米都闪着汗水', image: 'https://dummyimage.com/260x140/f1f8e9/558b2f&text=粒粒辛苦' }
    ],
    drawingSteps: ['先画一个大太阳。', '画农民伯伯戴草帽、拿锄头。', '再画禾苗和土地。', '最后加上汗珠和笑脸。']
  },
  {
    key: 'guiyuan',
    title: '归园田居·其三',
    author: '陶渊明',
    dynasty: '东晋',
    location: '江西庐山（南山）',
    sceneImage: 'https://dummyimage.com/640x360/e8f5e9/2e7d32&text=归园田居+晨兴理荒秽',
    illustration: 'https://dummyimage.com/220x260/f1f8e9/5d4037&text=陶渊明+Q版诗人',
    meaning: '诗人清晨下田除草，黄昏扛着锄头回家，虽然辛苦，但能亲近自然、自己耕作，心里很踏实也很快乐。',
    tip: '趣味小提示：陶渊明特别喜欢田园生活，“采菊东篱下”也是他写的哦！',
    lines: [
      { id: 'guiyuan-l1', text: '晨兴理荒秽', pinyin: 'chén xīng lǐ huāng huì', sceneId: 's1' },
      { id: 'guiyuan-l2', text: '带月荷锄归', pinyin: 'dài yuè hè chú guī', sceneId: 's2' },
      { id: 'guiyuan-l3', text: '衣沾不足惜', pinyin: 'yī zhān bù zú xī', sceneId: 's3' },
      { id: 'guiyuan-l4', text: '但使愿无违', pinyin: 'dàn shǐ yuàn wú wéi', sceneId: 's4' }
    ],
    matchScenes: [
      { id: 's1', label: '清晨田间除草，露珠未干', image: 'https://dummyimage.com/260x140/e8f5e9/2e7d32&text=晨兴理荒秽' },
      { id: 's2', label: '月下扛锄头走在归家小路', image: 'https://dummyimage.com/260x140/e3f2fd/3949ab&text=带月荷锄归' },
      { id: 's3', label: '衣角沾着泥土但神情轻松', image: 'https://dummyimage.com/260x140/efebe9/6d4c41&text=衣沾不足惜' },
      { id: 's4', label: '坚持初心，笑看田园山水', image: 'https://dummyimage.com/260x140/f1f8e9/33691e&text=但使愿无违' }
    ],
    drawingSteps: ['画弯弯月亮和夜空。', '画诗人扛锄头回家。', '画田埂和小路。', '加上草木和远山。']
  },
  {
    key: 'siShi',
    title: '四时田园杂兴（其二十五）',
    author: '范成大',
    dynasty: '宋',
    location: '江苏苏州',
    sceneImage: 'https://dummyimage.com/640x360/fff3e0/ef6c00&text=四时田园杂兴+童孙学种瓜',
    illustration: 'https://dummyimage.com/220x260/fffde7/6d4c41&text=范成大+Q版诗人',
    meaning: '大人们都下田干活去了，小朋友也不闲着，在桑树下学着种瓜，表现了农村里人人热爱劳动的画面。',
    tip: '趣味小提示：古时候孩子们也会帮家里做农活，边学边玩，很有成就感！',
    lines: [
      { id: 'sishi-l1', text: '昼出耘田夜绩麻', pinyin: 'zhòu chū yún tián yè jì má', sceneId: 's1' },
      { id: 'sishi-l2', text: '村庄儿女各当家', pinyin: 'cūn zhuāng ér nǚ gè dāng jiā', sceneId: 's2' },
      { id: 'sishi-l3', text: '童孙未解供耕织', pinyin: 'tóng sūn wèi jiě gòng gēng zhī', sceneId: 's3' },
      { id: 'sishi-l4', text: '也傍桑阴学种瓜', pinyin: 'yě bàng sāng yīn xué zhòng guā', sceneId: 's4' }
    ],
    matchScenes: [
      { id: 's1', label: '白天耘田、夜晚纺麻的忙碌', image: 'https://dummyimage.com/260x140/fff3e0/e65100&text=昼出夜绩' },
      { id: 's2', label: '村里男女各自忙碌有担当', image: 'https://dummyimage.com/260x140/e8f5e9/2e7d32&text=各当家' },
      { id: 's3', label: '小朋友还不太懂耕织工序', image: 'https://dummyimage.com/260x140/e1f5fe/0277bd&text=未解耕织' },
      { id: 's4', label: '桑树荫下认真学着种瓜', image: 'https://dummyimage.com/260x140/f1f8e9/689f38&text=学种瓜' }
    ],
    drawingSteps: ['画桑树和树荫。', '画小朋友蹲着种瓜。', '画田地和小瓜苗。', '补充远处劳作的大人。']
  }
]

const selectedPoemKey = ref('minong2')
const poetTalk = ref('点击右侧诗人，一起听听古诗里的农耕故事吧！')
const poemMatchFeedback = ref('')
const poemDragLineId = ref('')
const poemMatchShuffled = ref([])
const poemLearnedMap = reactive({})
const poemMatchDoneMap = reactive({})

const cropTypeList = [
  { id: 'grain', name: '粮食作物' },
  { id: 'oil', name: '油料作物' },
  { id: 'vegetable', name: '蔬菜作物' },
  { id: 'fruit', name: '果类' },
  { id: 'wildFruit', name: '野生果类' },
  { id: 'feed', name: '饲料作物' },
  { id: 'medicine', name: '药用作物' }
]

const toolTypeList = [
  { id: 'traditional', name: '传统农具' },
  { id: 'modern', name: '现代农具' }
]

const toolGroups = {
  传统农具: ['镰刀', '锄头', '铁锹', '镐', '犁', '耙', '耧', '连枷', '石碾/石磨', '扁担+水桶', '独轮车/架子车'],
  现代农具: ['拖拉机', '旋耕机', '播种机', '联合收割机', '插秧机', '喷雾器', '农用三轮车', '脱粒机']
}

const cropGroups = {
  粮食作物: ['小麦', '水稻', '玉米', '红薯', '红豆', '绿豆', '蚕豆', '豌豆', '高粱', '黄豆（大豆）', '板栗'],
  油料作物: ['向日葵', '核桃', '油桃', '油棕榈', '油茶', '油菜', '胡麻', '芝麻', '花生'],
  蔬菜作物: ['南瓜', '卷心菜', '四季豆', '大蒜', '洋葱', '生菜', '白菜', '胡萝卜', '芦笋', '茄子', '莴笋', '菠菜', '萝卜', '葱', '蘑菇', '西兰花', '西红柿', '辣椒', '韭菜', '香菜', '黄瓜'],
  果类: ['山楂', '山竹', '李子', '杏', '柿饼', '桃子', '桑葚', '梨', '椰子', '樱桃', '橘子', '橙子', '牛油果', '猕猴桃', '百香果', '苹果', '草莓', '菠萝', '葡萄', '蓝莓', '西梅', '西瓜', '香蕉'],
  野生果类: ['山楂', '桑葚', '猕猴桃', '百香果'],
  饲料作物: ['燕麦', '甜高粱', '紫云英', '紫花苜蓿'],
  药用作物: ['五味子', '人参', '何首乌', '枸杞', '桂皮', '蒲公英', '薄荷', '金银花']
}

const groupIconMap = {
  粮食作物: '🌾',
  油料作物: '🌻',
  蔬菜作物: '🥬',
  果类: '🍎',
  野生果类: '🍒',
  饲料作物: '🌿',
  药用作物: '🌱'
}

const cropPinyinMap = {
  水稻: 'shuǐ dào', 玉米: 'yù mǐ', 豆类: 'dòu lèi', 薯类: 'shǔ lèi', 青稞: 'qīng kē', 蚕豆: 'cán dòu', 小麦: 'xiǎo mài',
  油籽: 'yóu zǐ', 蔓青: 'màn qīng', 大芥: 'dà jiè', 花生: 'huā shēng', 胡麻: 'hú má', 大麻: 'dà má', 向日葵: 'xiàng rì kuí',
  萝卜: 'luó bo', 白菜: 'bái cài', 芹菜: 'qín cài', 韭菜: 'jiǔ cài', 蒜: 'suàn', 葱: 'cōng', 胡萝卜: 'hú luó bo', 菜瓜: 'cài guā', 莲花菜: 'lián huā cài', 菊芋: 'jú yù', 刀豆: 'dāo dòu', 芫荽: 'yán sui', 莴笋: 'wō sǔn', 黄花: 'huáng huā', 辣椒: 'là jiāo', 黄瓜: 'huáng guā', 西红柿: 'xī hóng shì', 香菜: 'xiāng cài',
  梨: 'lí', 青梅: 'qīng méi', 苹果: 'píng guǒ', 桃: 'táo', 杏: 'xìng', 核桃: 'hé tao', 李子: 'lǐ zi', 樱桃: 'yīng táo', 草莓: 'cǎo méi', 沙果: 'shā guǒ', 红枣: 'hóng zǎo',
  酸梨: 'suān lí', 野杏: 'yě xìng', 毛桃: 'máo táo', 山枣: 'shān zǎo', 山樱桃: 'shān yīng táo', 沙棘: 'shā jí',
  绿肥: 'lǜ féi', 紫云英: 'zǐ yún yīng',
  人参: 'rén shēn', 当归: 'dāng guī', 金银花: 'jīn yín huā', 薄荷: 'bò he', 艾蒿: 'ài hāo'
}

const quizOptionsByGroup = {
  粮食作物: ['粮食作物', '蔬菜作物', '果类'],
  油料作物: ['油料作物', '粮食作物', '药用作物'],
  蔬菜作物: ['蔬菜作物', '果类', '药用作物'],
  果类: ['果类', '蔬菜作物', '野生果类'],
  野生果类: ['野生果类', '果类', '蔬菜作物'],
  饲料作物: ['饲料作物', '粮食作物', '油料作物'],
  药用作物: ['药用作物', '蔬菜作物', '果类']
}

let cropAutoId = 1
const makeCrop = (name, primaryGroup, secondaryGroups = []) => {
  const realImage = findClassImageByName(name, `https://dummyimage.com/300x190/c8e6c9/2e7d32&text=${encodeURIComponent(name)}实物图`)
  return {
    id: cropAutoId++,
    primaryGroup,
    secondaryGroups,
    allGroups: [primaryGroup, ...secondaryGroups],
    name,
    pinyin: cropPinyinMap[name] || 'pīn yīn',
    icon: groupIconMap[primaryGroup] || '🌱',
    realImage,
    hasLocalImage: isLocalClassImage(realImage),
    videoPoster: `https://dummyimage.com/480x270/fff59d/5d4037&text=${encodeURIComponent(name)}动画视频`,
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: `${name}（${cropPinyinMap[name] || 'pīn yīn'}）主类是${primaryGroup}${secondaryGroups.length ? `，副类还包括${secondaryGroups.join('、')}` : ''}，在农业生产中很常见，是孩子认识农耕世界的重要作物。`,
    tip: `趣味提示（qù wèi tí shì）：${name}是${primaryGroup}中的代表作物之一${secondaryGroups.length ? `，还和${secondaryGroups.join('、')}有关` : ''}。`,
    readText: `请跟读：${name}主类是${primaryGroup}${secondaryGroups.length ? `，副类有${secondaryGroups.join('、')}` : ''}。`,
    audio: `${name}，${cropPinyinMap[name] || 'pīn yīn'}。${name}主类是${primaryGroup}${secondaryGroups.length ? `，副类有${secondaryGroups.join('、')}` : ''}。`,
    quiz: {
      question: `${name}的主类是哪一类作物？`,
      options: quizOptionsByGroup[primaryGroup] || [primaryGroup, '粮食作物', '蔬菜作物'],
      answer: primaryGroup
    }
  }
}

const cropMergedMap = Object.entries(cropGroups).reduce((acc, [group, names]) => {
  names.forEach((name) => {
    if (!acc[name]) acc[name] = []
    if (!acc[name].includes(group)) acc[name].push(group)
  })
  return acc
}, {})

const crops = Object.entries(cropMergedMap).map(([name, groups]) => makeCrop(name, groups[0], groups.slice(1)))

const tools = [
  {
    id: 1,
    name: '镰刀',
    pinyin: 'lián dāo',
    icon: '🪓',
    realImage: 'https://dummyimage.com/300x190/cfd8dc/37474f&text=镰刀实物图',
    videoPoster: 'https://dummyimage.com/480x270/b0bec5/263238&text=镰刀动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '镰刀（lián dāo）常用于收割麦子、稻子和割草，是传统农户常见的随身农具。',
    tip: '趣味提示（qù wèi tí shì）：镰刀弯弯像月牙，割草和收割都很利索。',
    readText: '请跟读：镰刀常用来收割麦子和稻子。',
    audio: '镰刀，lián dāo。镰刀常用来收割庄稼。',
    quiz: {
      question: '镰刀（lián dāo）常见用途是什么？',
      options: ['收割庄稼', '给植物浇水', '测量土地'],
      answer: '收割庄稼'
    }
  },
  {
    id: 2,
    name: '锄头',
    pinyin: 'chú tóu',
    icon: '⛏️',
    realImage: 'https://dummyimage.com/300x190/b3e5fc/01579b&text=锄头实物图',
    videoPoster: 'https://dummyimage.com/480x270/b2ebf2/004d40&text=锄头动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '锄头（chú tóu）用途非常广，可用于翻土、挖沟、起垄、除草。',
    tip: '趣味提示（qù wèi tí shì）：锄头像田间小能手，几乎哪里都能帮上忙。',
    readText: '请跟读：锄头可以翻土挖沟和除草。',
    audio: '锄头，chú tóu。锄头用途非常广。',
    quiz: {
      question: '锄头（chú tóu）最常见的用途是？',
      options: ['翻土除草', '称重计量', '打稻谷'],
      answer: '翻土除草'
    }
  },
  {
    id: 3,
    name: '铁锹',
    pinyin: 'tiě qiāo',
    icon: '🛠️',
    realImage: 'https://dummyimage.com/300x190/d1c4e9/4527a0&text=铁锹实物图',
    videoPoster: 'https://dummyimage.com/480x270/b39ddb/311b92&text=铁锹动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '铁锹（tiě qiāo）可以铲土（chǎn tǔ）、挖坑（wā kēng），在种植时非常常用。',
    tip: '趣味提示（qù wèi tí shì）：铁锹像一把大勺子，能把泥土“舀”起来。',
    readText: '请跟读：铁锹可以铲土和挖坑。',
    audio: '铁锹，tiě qiāo。铁锹可以铲土。',
    quiz: {
      question: '铁锹（tiě qiāo）更常用来做哪件事？',
      options: ['铲土挖坑', '剪树枝', '称重量'],
      answer: '铲土挖坑'
    }
  },
  {
    id: 4,
    name: '镐',
    pinyin: 'gǎo',
    icon: '⛏️',
    realImage: 'https://dummyimage.com/300x190/b0bec5/263238&text=镐实物图',
    videoPoster: 'https://dummyimage.com/480x270/cfd8dc/37474f&text=镐动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '镐（gǎo）适合挖硬地、刨树根、破碎大土块。',
    tip: '趣味提示（qù wèi tí shì）：地太硬时，先用镐再用锄头更省力。',
    readText: '请跟读：镐常用来挖硬地和刨树根。',
    audio: '镐，gǎo。镐适合挖硬地。',
    quiz: {
      question: '镐（gǎo）更适合做哪件事？',
      options: ['挖硬地', '喷药', '播种'],
      answer: '挖硬地'
    }
  },
  {
    id: 5,
    name: '犁',
    pinyin: 'lí',
    icon: '🚜',
    realImage: 'https://dummyimage.com/300x190/d7ccc8/5d4037&text=犁实物图',
    videoPoster: 'https://dummyimage.com/480x270/bcaaa4/4e342e&text=犁动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '犁（lí）是耕地的核心农具，传统上常由牛或马牵引翻耕土地。',
    tip: '趣味提示（qù wèi tí shì）：犁把土地翻松后，更有利于播种。',
    readText: '请跟读：犁是耕地的重要农具。',
    audio: '犁，lí。犁是耕地的核心工具。',
    quiz: {
      question: '犁（lí）主要用于什么？',
      options: ['翻耕土地', '收割稻麦', '喷洒农药'],
      answer: '翻耕土地'
    }
  },
  {
    id: 6,
    name: '耙',
    pinyin: 'pá',
    icon: '🧹',
    realImage: 'https://dummyimage.com/300x190/dcedc8/558b2f&text=耙实物图',
    videoPoster: 'https://dummyimage.com/480x270/c5e1a5/33691e&text=耙动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '耙（pá）用于把犁过后的大土块打碎，并把地面整平。',
    tip: '趣味提示（qù wèi tí shì）：先犁后耙，土地会更平整。',
    readText: '请跟读：耙可以碎土和平地。',
    audio: '耙，pá。耙可以把土块弄碎。',
    quiz: {
      question: '耙（pá）最主要的作用是？',
      options: ['碎土平地', '脱粒', '运输'],
      answer: '碎土平地'
    }
  },
  {
    id: 7,
    name: '耧',
    pinyin: 'lóu',
    icon: '🌱',
    realImage: 'https://dummyimage.com/300x190/ffe082/6d4c41&text=耧实物图',
    videoPoster: 'https://dummyimage.com/480x270/ffd54f/5d4037&text=耧动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '耧（lóu）是传统播种农具，前面牲畜拉，后面人扶，种子可自动下到土里。',
    tip: '趣味提示（qù wèi tí shì）：耧相当于古代“播种机”。',
    readText: '请跟读：耧是传统播种工具。',
    audio: '耧，lóu。耧可以把种子下到土里。',
    quiz: {
      question: '耧（lóu）一般用于什么环节？',
      options: ['播种', '收割', '打药'],
      answer: '播种'
    }
  },
  {
    id: 8,
    name: '连枷',
    pinyin: 'lián jiā',
    icon: '🪵',
    realImage: 'https://dummyimage.com/300x190/b0bec5/37474f&text=连枷实物图',
    videoPoster: 'https://dummyimage.com/480x270/90a4ae/263238&text=连枷动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '连枷（lián jiā）用于脱粒，通过拍打谷物让籽粒掉落。',
    tip: '趣味提示（qù wèi tí shì）：连枷由长柄和可转动敲板组成。',
    readText: '请跟读：连枷常用来脱粒。',
    audio: '连枷，lián jiā。连枷用于谷物脱粒。',
    quiz: {
      question: '连枷（lián jiā）主要做什么？',
      options: ['脱粒', '播种', '翻地'],
      answer: '脱粒'
    }
  },
  {
    id: 9,
    name: '石碾/石磨',
    pinyin: 'shí niǎn / shí mò',
    icon: '⚙️',
    realImage: 'https://dummyimage.com/300x190/eeeeee/616161&text=石碾石磨实物图',
    videoPoster: 'https://dummyimage.com/480x270/e0e0e0/424242&text=石碾石磨动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '石碾/石磨用于碾压或磨碎粮食，如小麦磨面、谷子脱壳。',
    tip: '趣味提示（qù wèi tí shì）：这是传统粮食加工的重要工具。',
    readText: '请跟读：石碾石磨可以加工粮食。',
    audio: '石碾石磨，shí niǎn shí mò。它们可以磨碎粮食。',
    quiz: {
      question: '石碾/石磨（shí niǎn / shí mò）主要用于？',
      options: ['加工粮食', '收割庄稼', '浇灌农田'],
      answer: '加工粮食'
    }
  },
  {
    id: 10,
    name: '扁担+水桶',
    pinyin: 'biǎn dàn + shuǐ tǒng',
    icon: '🪣',
    realImage: 'https://dummyimage.com/300x190/c8e6c9/2e7d32&text=扁担水桶实物图',
    videoPoster: 'https://dummyimage.com/480x270/a5d6a7/1b5e20&text=扁担水桶动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '扁担加水桶用于挑水、挑粪、挑粮食，是经典的人力搬运组合。',
    tip: '趣味提示（qù wèi tí shì）：扁担利用杠杆原理，挑重物更省力。',
    readText: '请跟读：扁担和水桶可以挑运物品。',
    audio: '扁担和水桶，biǎn dàn hé shuǐ tǒng。可以用来挑运物品。',
    quiz: {
      question: '扁担+水桶主要用于什么？',
      options: ['挑运物品', '播种', '耕地'],
      answer: '挑运物品'
    }
  },
  {
    id: 11,
    name: '独轮车/架子车',
    pinyin: 'dú lún chē / jià zi chē',
    icon: '🛒',
    realImage: 'https://dummyimage.com/300x190/ffe0b2/e65100&text=独轮车架子车实物图',
    videoPoster: 'https://dummyimage.com/480x270/ffcc80/bf360c&text=独轮车架子车动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '独轮车/架子车是常见人力运输工具，架子车还可套牲口拉运。',
    tip: '趣味提示（qù wèi tí shì）：这是农村最常见的短途运输好帮手。',
    readText: '请跟读：独轮车和架子车用于运输。',
    audio: '独轮车和架子车，dú lún chē hé jià zi chē。常用来运输。',
    quiz: {
      question: '独轮车/架子车的主要作用是？',
      options: ['运输', '脱粒', '除草'],
      answer: '运输'
    }
  },
  {
    id: 12,
    name: '拖拉机',
    pinyin: 'tuō lā jī',
    icon: '🚜',
    realImage: 'https://dummyimage.com/300x190/c5e1a5/33691e&text=拖拉机实物图',
    videoPoster: 'https://dummyimage.com/480x270/aed581/1b5e20&text=拖拉机动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '拖拉机（tuō lā jī）是田间万能动力平台，可挂接犁、耙、播种机等设备。',
    tip: '趣味提示（qù wèi tí shì）：很多农机都要靠拖拉机来带动。',
    readText: '请跟读：拖拉机是田间万能动力。',
    audio: '拖拉机，tuō lā jī。拖拉机可以带动多种农具。',
    quiz: {
      question: '拖拉机（tuō lā jī）最突出的特点是？',
      options: ['可挂接多种农具', '只能收割', '只能喷药'],
      answer: '可挂接多种农具'
    }
  },
  {
    id: 13,
    name: '旋耕机',
    pinyin: 'xuán gēng jī',
    icon: '⚙️',
    realImage: 'https://dummyimage.com/300x190/dcedc8/2e7d32&text=旋耕机实物图',
    videoPoster: 'https://dummyimage.com/480x270/c5e1a5/33691e&text=旋耕机动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '旋耕机（xuán gēng jī）可快速打碎土块、整地，已替代大量传统耙锄作业。',
    tip: '趣味提示（qù wèi tí shì）：旋耕后地面更细碎平整，播种更方便。',
    readText: '请跟读：旋耕机能快速整地。',
    audio: '旋耕机，xuán gēng jī。旋耕机可以快速整地。',
    quiz: {
      question: '旋耕机（xuán gēng jī）主要作用是？',
      options: ['打碎土块整地', '运输粮食', '喷洒农药'],
      answer: '打碎土块整地'
    }
  },
  {
    id: 14,
    name: '播种机',
    pinyin: 'bō zhǒng jī',
    icon: '🌱',
    realImage: 'https://dummyimage.com/300x190/fff9c4/f57f17&text=播种机实物图',
    videoPoster: 'https://dummyimage.com/480x270/fff59d/f9a825&text=播种机动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '播种机（bō zhǒng jī）可一次完成开沟、下种、覆土，常用于玉米小麦大豆。',
    tip: '趣味提示（qù wèi tí shì）：播种机让播种更均匀、更高效。',
    readText: '请跟读：播种机可以一次完成多道工序。',
    audio: '播种机，bō zhǒng jī。播种机可以开沟下种覆土。',
    quiz: {
      question: '播种机（bō zhǒng jī）可以一次完成哪些工作？',
      options: ['开沟下种覆土', '收割脱粒装袋', '灌溉施肥采摘'],
      answer: '开沟下种覆土'
    }
  },
  {
    id: 15,
    name: '联合收割机',
    pinyin: 'lián hé shōu gē jī',
    icon: '🚜',
    realImage: 'https://dummyimage.com/300x190/ffe082/6d4c41&text=联合收割机实物图',
    videoPoster: 'https://dummyimage.com/480x270/ffd54f/5d4037&text=联合收割机动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '联合收割机（lián hé shōu gē jī）是收麦收稻的大型机械，能直接输出颗粒。',
    tip: '趣味提示（qù wèi tí shì）：它把收割、脱粒等步骤合并在一台机器里。',
    readText: '请跟读：联合收割机可以直接收出粮粒。',
    audio: '联合收割机，lián hé shōu gē jī。可以快速收割并脱粒。',
    quiz: {
      question: '联合收割机最突出的优点是？',
      options: ['收割后直接出颗粒', '只能翻地', '只能浇水'],
      answer: '收割后直接出颗粒'
    }
  },
  {
    id: 16,
    name: '插秧机',
    pinyin: 'chā yāng jī',
    icon: '🌾',
    realImage: 'https://dummyimage.com/300x190/c8e6c9/2e7d32&text=插秧机实物图',
    videoPoster: 'https://dummyimage.com/480x270/a5d6a7/1b5e20&text=插秧机动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '插秧机（chā yāng jī）在水稻种植区常见，能把秧苗整齐插入水田。',
    tip: '趣味提示（qù wèi tí shì）：机械插秧比人工更快更整齐。',
    readText: '请跟读：插秧机用于水田插秧。',
    audio: '插秧机，chā yāng jī。插秧机用于水稻插秧。',
    quiz: {
      question: '插秧机（chā yāng jī）主要服务于哪种作物？',
      options: ['水稻', '苹果', '花生'],
      answer: '水稻'
    }
  },
  {
    id: 17,
    name: '喷雾器',
    pinyin: 'pēn wù qì',
    icon: '🧴',
    realImage: 'https://dummyimage.com/300x190/b3e5fc/0277bd&text=喷雾器实物图',
    videoPoster: 'https://dummyimage.com/480x270/81d4fa/01579b&text=喷雾器动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '喷雾器（pēn wù qì）从手摇背负式到电动机动式，常用于防治病虫害。',
    tip: '趣味提示（qù wèi tí shì）：喷雾要均匀，注意防护更安全。',
    readText: '请跟读：喷雾器是常见的打药工具。',
    audio: '喷雾器，pēn wù qì。喷雾器常用于田间打药。',
    quiz: {
      question: '喷雾器（pēn wù qì）常见用途是？',
      options: ['喷洒药液', '脱粒', '翻地'],
      answer: '喷洒药液'
    }
  },
  {
    id: 18,
    name: '农用三轮车',
    pinyin: 'nóng yòng sān lún chē',
    icon: '🛺',
    realImage: 'https://dummyimage.com/300x190/ffe0b2/e65100&text=农用三轮车实物图',
    videoPoster: 'https://dummyimage.com/480x270/ffcc80/bf360c&text=农用三轮车动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '农用三轮车（nóng yòng sān lún chē）适合短途运输粮食、肥料和蔬菜。',
    tip: '趣味提示（qù wèi tí shì）：农村道路上最常见的运输机械之一。',
    readText: '请跟读：农用三轮车用于短途运输。',
    audio: '农用三轮车，nóng yòng sān lún chē。常用来短途运输。',
    quiz: {
      question: '农用三轮车（nóng yòng sān lún chē）主要用于？',
      options: ['短途运输', '插秧', '收割脱粒'],
      answer: '短途运输'
    }
  },
  {
    id: 19,
    name: '脱粒机',
    pinyin: 'tuō lì jī',
    icon: '⚙️',
    realImage: 'https://dummyimage.com/300x190/e0e0e0/424242&text=脱粒机实物图',
    videoPoster: 'https://dummyimage.com/480x270/bdbdbd/212121&text=脱粒机动画视频',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: '脱粒机（tuō lì jī）专门用于打玉米、打豆子等脱粒作业。',
    tip: '趣味提示（qù wèi tí shì）：它是单项脱粒机械，不同于联合收割机。',
    readText: '请跟读：脱粒机主要用于谷物脱粒。',
    audio: '脱粒机，tuō lì jī。脱粒机用于打玉米和豆子。',
    quiz: {
      question: '脱粒机（tuō lì jī）的主要功能是？',
      options: ['脱粒', '播种', '翻耕'],
      answer: '脱粒'
    }
  }
]

tools.forEach((tool) => {
  const localImage = findClassImageByName(pickImageAlias(tool.name), '')
  tool.realImage = localImage || tool.realImage
  tool.hasLocalImage = isLocalClassImage(localImage)
})

const selectCategory = (id) => {
  selectedCategory.value = id
}

const getCardBgStyle = (imageUrl) => {
  if (!imageUrl) return {}
  return {
    backgroundImage: `linear-gradient(rgba(255,255,255,.16), rgba(248,255,242,.22)), url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
}

    const termItemStyle = (idx) => {
        const total = solarTerms.length
        const angle = (Math.PI * 2 * idx) / total - Math.PI / 2
        const radius = 180

        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return {
            position: 'absolute',
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            width: '60px',
            height: '60px',
            transform: 'translate(-50%, -50%)'
        }
    }

    const selectSolarTerm = (term, idx) => {
        selectedSolarTermKey.value = term.name
        const stepDeg = 360 / solarTerms.length
        termSpinDeg.value = -idx * stepDeg
    }

const singSongLine = (line, idx) => {
  currentSongLineIndex.value = idx
  playAudio(line)
  setTimeout(() => {
    if (currentSongLineIndex.value === idx) currentSongLineIndex.value = -1
  }, 1700)
}

const followSingKidSong = () => {
  playAudio(kidSongLines.join('，'))
  coachMessage.value = '跟着节气歌一起唱，节奏真不错！'
}

const shufflePoemPairs = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const initPoemMatch = () => {
  const poem = poetPoems.find((p) => p.key === selectedPoemKey.value)
  if (!poem) return
  poemMatchShuffled.value = shufflePoemPairs(poem.lines.map((line) => ({ ...line })))
  poemMatchDoneMap[selectedPoemKey.value] = {}
  poemMatchFeedback.value = ''
  poemDragLineId.value = ''
}

const talkWithPoet = () => {
  const poem = currentPoem.value
  if (!poem) return
  poetTalk.value = `${poem.author}说：${poem.meaning}`
  playAudio(`${poem.title}，作者${poem.author}。${poem.meaning}`)
}

const markPoemLearned = () => {
  poemLearnedMap[selectedPoemKey.value] = true
}

const onPoemDragStart = (lineId) => {
  poemDragLineId.value = lineId
}

const onPoemDropScene = (targetId) => {
  const dragId = poemDragLineId.value
  if (!dragId) return
  const currentLine = currentPoem.value?.lines.find((line) => line.id === dragId)
  if (!currentLine) return
  const doneMap = poemMatchDoneMap[selectedPoemKey.value] || {}
  if (doneMap[targetId]) return
  if (Object.values(doneMap).includes(dragId)) return
  if (currentLine.sceneId === targetId) {
    doneMap[targetId] = dragId
    poemMatchDoneMap[selectedPoemKey.value] = { ...doneMap }
    poemMatchFeedback.value = '配对成功，真棒！'
    playAudio(`${currentLine.text}，${currentLine.pinyin}`)
  } else {
    poemMatchFeedback.value = '不匹配哦，看看意境提示再拖一次～'
  }
  poemDragLineId.value = ''
}

const resetPoemMatch = () => {
  initPoemMatch()
}

const answerSeasonCropQuiz = (option) => {
  if (matchAnswered.value) return
  matchAnswered.value = true
  increaseGameStats('match', option === currentSeasonCropQuiz.value.answer)
  if (option === currentSeasonCropQuiz.value.answer) {
    solarGameStreak.value += 1
    matchNeedManualNext.value = false
    seasonCropFeedback.value = `回答正确！${option}生长中...`
    cropGrowFx.value = true
    rewardAction('节气配对成功！')
    setTimeout(() => (cropGrowFx.value = false), 700)
    setTimeout(() => {
      if (matchAnswered.value && !matchNeedManualNext.value) nextSeasonCropQuiz()
    }, 900)
  } else {
    solarGameStreak.value = 0
    matchNeedManualNext.value = true
    seasonCropFeedback.value = `再试试，${currentSeasonCropQuiz.value.term}更适合${currentSeasonCropQuiz.value.answer}。`
    wrongAction('节气配对答错啦')
  }
}

const nextSeasonCropQuiz = () => {
  seasonCropQuizIndex.value = (seasonCropQuizIndex.value + 1) % seasonCropQuizzes.length
  seasonCropFeedback.value = ''
  matchAnswered.value = false
  matchNeedManualNext.value = false
}

const shuffleArray = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const resetPuzzleGame = () => {
  puzzleSolvedLines.value = []
  puzzlePieces.value = shuffleArray([...fullSongLines])
  puzzleFeedback.value = ''
  puzzleMedal.value = false
}

const pickPuzzlePiece = (piece) => {
  const expected = fullSongLines[puzzleSolvedLines.value.length]
  increaseGameStats('puzzle', piece === expected)
  if (piece === expected) {
    solarGameStreak.value += 1
    puzzleSolvedLines.value.push(piece)
    puzzlePieces.value = puzzlePieces.value.filter((p) => p !== piece)
    puzzleFeedback.value = '拼对啦！'
    playAudio(piece)
    rewardAction('拼图顺序正确！')
    if (puzzleSolvedLines.value.length === fullSongLines.length) {
      puzzleMedal.value = true
      coachMessage.value = '恭喜你成为节气小歌手！'
    }
  } else {
    solarGameStreak.value = 0
    puzzleFeedback.value = '顺序不对哦，听听节气歌再拼一次！'
    wrongAction('拼图顺序错误')
  }
}

const answerFillQuiz = (opt) => {
  if (fillAnswered.value) return
  fillAnswered.value = true
  increaseGameStats('fill', opt === currentFillQuiz.value.answer)
  if (opt === currentFillQuiz.value.answer) {
    solarGameStreak.value += 1
    fillNeedManualNext.value = false
    fillFeedback.value = '填空正确！'
    rewardAction('节气歌填空完成！')
    setTimeout(() => {
      if (fillAnswered.value && !fillNeedManualNext.value) nextFillQuiz()
    }, 900)
  } else {
    solarGameStreak.value = 0
    fillNeedManualNext.value = true
    fillFeedback.value = `不对哦，正确答案是：${currentFillQuiz.value.answer}`
    wrongAction('节气填空答错')
  }
}

const nextFillQuiz = () => {
  fillQuizIndex.value = (fillQuizIndex.value + 1) % fillQuizzes.length
  fillFeedback.value = ''
  fillAnswered.value = false
  fillNeedManualNext.value = false
}

const resetSolarGameStats = () => {
  gameStats.match.correct = 0
  gameStats.match.total = 0
  gameStats.puzzle.correct = 0
  gameStats.puzzle.total = 0
  gameStats.fill.correct = 0
  gameStats.fill.total = 0
  solarGameStreak.value = 0
  matchAnswered.value = false
  fillAnswered.value = false
  matchNeedManualNext.value = false
  fillNeedManualNext.value = false
  seasonCropFeedback.value = ''
  fillFeedback.value = ''
  resetPuzzleGame()
}

const increaseGameStats = (gameKey, isCorrect) => {
  const limit = gameQuestionTotals[gameKey] || 0
  if (gameStats[gameKey].total < limit) gameStats[gameKey].total += 1
  if (isCorrect && gameStats[gameKey].correct < limit) gameStats[gameKey].correct += 1
}

const filteredCrops = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  let result = crops.filter((item) => item.allGroups.includes(selectedCropType.value) && item.hasLocalImage)
  if (!keyword) return result
  result = result.filter((item) =>
    `${item.name} ${item.pinyin} ${item.tip}`.toLowerCase().includes(keyword)
  )
  return result
})

const filteredTools = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  let result = tools.filter((item) => item.hasLocalImage && (toolGroups[selectedToolType.value] || []).includes(item.name))
  if (!keyword) return result
  result = result.filter((item) =>
    `${item.name} ${item.pinyin} ${item.tip}`.toLowerCase().includes(keyword)
  )
  return result
})

    const selectedSolarTerm = computed(() => {
        return solarTerms.find(term => term.name === selectedSolarTermKey.value) || solarTerms[0]
    })

const currentFolkCustoms = computed(() => folkCustomsMap[selectedFolkSeason.value] || [])

const currentPoem = computed(() => poetPoems.find((p) => p.key === selectedPoemKey.value) || poetPoems[0])
const currentPoemDoneMap = computed(() => poemMatchDoneMap[selectedPoemKey.value] || {})
const currentPoemMatchCount = computed(() =>
  currentPoem.value.matchScenes.filter((scene) => !!currentPoemDoneMap.value[scene.id]).length
)
const currentPoemAllMatched = computed(() =>
  currentPoem.value.matchScenes.length > 0 && currentPoemMatchCount.value === currentPoem.value.matchScenes.length
)
const learnedPoemCount = computed(() => poetPoems.filter((p) => poemLearnedMap[p.key]).length)
const currentMatchedLineIdSet = computed(() => new Set(Object.values(currentPoemDoneMap.value).filter(Boolean)))

const getPoemLineTextById = (lineId) => {
  const line = currentPoem.value?.lines.find((item) => item.id === lineId)
  return line ? line.text : ''
}

const currentSeasonCropQuiz = computed(() =>
  seasonCropQuizzes[seasonCropQuizIndex.value % seasonCropQuizzes.length]
)

const currentFillQuiz = computed(() =>
  fillQuizzes[fillQuizIndex.value % fillQuizzes.length]
)

const activeSolarGameMeta = computed(() =>
  solarGameMeta.find((g) => g.key === selectedSolarGame.value) || solarGameMeta[0]
)

const activeGameAccuracy = computed(() => {
  const total = gameQuestionTotals[selectedSolarGame.value] || 0
  const correct = gameStats[selectedSolarGame.value]?.correct || 0
  if (total === 0) return '0%'
  return `${Math.round((correct / total) * 100)}%`
})

const currentGameProgressDone = computed(() => {
  const done = gameStats[selectedSolarGame.value]?.total || 0
  return Math.min(done, currentGameTotal.value)
})
const currentGameTotal = computed(() => gameQuestionTotals[selectedSolarGame.value] || 0)
const currentGameProgressPercent = computed(() => {
  if (currentGameTotal.value === 0) return 0
  return Math.round((currentGameProgressDone.value / currentGameTotal.value) * 100)
})

const currentFarmStep = computed(() => farmSteps.find((s) => s.key === activeFarmStep.value) || farmSteps[0])
const currentFarmQuiz = computed(() => farmStepQuizMap[activeFarmStep.value])
const selectedFarmRoleData = computed(() => farmRoles.find((r) => r.id === selectedFarmRole.value))

const farmGameDoneMap = computed(() => ({
  sow: farmGameState.sowFilled.every(Boolean),
  water: farmGameState.waterWet.every(Boolean),
  weed: farmGameState.weedRemoved.every(Boolean),
  harvest: farmGameState.harvestCollected.every(Boolean)
}))

const completedFarmCount = computed(() =>
  farmSteps.filter((step) => farmGameDoneMap.value[step.key] && farmQuizCorrect[step.key]).length
)

const unlockedFarmPoemCount = computed(() => Math.min(completedFarmCount.value, farmPoemTasks.length))

const farmPoemProgressText = computed(() => {
  const done = farmPoemTasks.filter((item) => farmPoemAnswered[item.id]).length
  return `已解锁 ${unlockedFarmPoemCount.value}/${farmPoemTasks.length} · 已完成 ${done}/${farmPoemTasks.length}`
})

const currentFarmPoem = computed(() => {
  if (unlockedFarmPoemCount.value === 0) return null
  const index = Math.min(farmPoemIndex.value, unlockedFarmPoemCount.value - 1)
  return farmPoemTasks[index]
})

const isCurrentFarmPoemDone = computed(() => {
  const id = currentFarmPoem.value?.id
  return id ? !!farmPoemAnswered[id] : false
})

const isCurrentStepDone = computed(() =>
  farmGameDoneMap.value[activeFarmStep.value] && farmQuizCorrect[activeFarmStep.value]
)

const currentStepCompleteText = computed(() => {
  const key = activeFarmStep.value
  const gameDone = farmGameDoneMap.value[key]
  const quizDone = farmQuizCorrect[key]
  if (gameDone && quizDone) return '100% 完成'
  if (gameDone || quizDone) return '50% 进行中'
  return '0% 未完成'
})

const growthTreeEmoji = computed(() => {
  if (completedFarmCount.value === 0) return '🌱'
  if (completedFarmCount.value === 1) return '🌿'
  if (completedFarmCount.value === 2) return '🌳'
  if (completedFarmCount.value === 3) return '🌳🌼'
  return '🌳🍎✨'
})

const coachMoodEmoji = computed(() => {
  if (farmCombo.value >= 5) return '🤩'
  if (farmCombo.value >= 3) return '😄'
  if (farmCombo.value >= 1) return '🙂'
  return '😊'
})

const isFarmStepUnlocked = (stepKey) => {
  const idx = farmSteps.findIndex((s) => s.key === stepKey)
  if (idx <= 0) return true
  const prevKey = farmSteps[idx - 1].key
  return farmGameDoneMap.value[prevKey] && farmQuizCorrect[prevKey]
}

const onFarmDragStart = (type, index) => {
  farmDragData.value = { type, index }
}

const addSpark = (text = '+1⭐') => {
  const id = sparkleAutoId++
  sparkleBursts.value.push({
    id,
    text,
    left: 30 + Math.random() * 40,
    top: 8 + Math.random() * 28
  })
  setTimeout(() => {
    sparkleBursts.value = sparkleBursts.value.filter((s) => s.id !== id)
  }, 800)
}

const rewardAction = (msg) => {
  farmScore.value += 10
  farmCombo.value += 1
  comboFlash.value = true
  farmFeedback.value = msg
  coachMessage.value = coachPraisePool[Math.floor(Math.random() * coachPraisePool.length)]
  addSpark('+10⭐')
  if (farmCombo.value >= 3) chestReady.value = true
  setTimeout(() => (comboFlash.value = false), 260)
}

const wrongAction = (msg) => {
  farmCombo.value = 0
  farmFeedback.value = msg
  coachMessage.value = '没关系，再试一次，你一定可以！'
}

const checkFarmStepMilestone = () => {
  const key = activeFarmStep.value
  if (farmGameDoneMap.value[key] && farmQuizCorrect[key] && !farmStepAwarded[key]) {
    farmStepAwarded[key] = true
    farmScore.value += 30
    stepToastText.value = `🎉 ${currentFarmStep.value.name}完成！额外+30⭐`
    showStepToast.value = true
    setTimeout(() => (showStepToast.value = false), 1200)
    coachMessage.value = `${currentFarmStep.value.name}完成啦，太厉害了！`
    addSpark('+30⭐')
  }
}

const selectFarmPoem = (idx) => {
  if (idx >= unlockedFarmPoemCount.value) return
  farmPoemIndex.value = idx
  farmPoemFeedback.value = ''
}

const answerFarmPoem = (option) => {
  const quiz = currentFarmPoem.value
  if (!quiz || farmPoemAnswered[quiz.id]) return

  if (option === quiz.answer) {
    farmPoemAnswered[quiz.id] = true
    farmPoemFeedback.value = `答对啦！${quiz.title} 学习完成。`
    rewardAction(`诗词任务完成：${quiz.short}`)
    playAudio(`${quiz.line}。${quiz.explain}`)
  } else {
    farmPoemFeedback.value = `再想想～提示：${quiz.hint}`
    wrongAction('诗词挑战答错啦')
  }
}

const openFarmChest = () => {
  if (!chestReady.value) return
  const bonus = 20 + Math.floor(Math.random() * 31)
  farmScore.value += bonus
  chestFxText.value = `🎁 宝箱奖励 +${bonus}⭐`
  chestReady.value = false
  farmCombo.value = 0
  setTimeout(() => (chestFxText.value = ''), 1200)
}

const onSowDrop = (idx) => {
  if (activeFarmStep.value !== 'sow' || farmDragData.value?.type !== 'seed') return
  if (!farmGameState.sowFilled[idx]) {
    farmGameState.sowFilled[idx] = true
    rewardAction('播种成功，真棒！')
    checkFarmStepMilestone()
  }
}

const onWaterDrop = (idx) => {
  if (activeFarmStep.value !== 'water' || farmDragData.value?.type !== 'watering') return
  if (!farmGameState.waterWet[idx]) {
    farmGameState.waterWet[idx] = true
    rewardAction('浇水完成，土地变湿润啦！')
    checkFarmStepMilestone()
  }
}

const removeWeedByClick = (idx) => {
  if (activeFarmStep.value !== 'weed' || farmGameState.weedRemoved[idx]) return
  farmGameState.weedRemoved[idx] = true
  rewardAction('杂草已清理，继续加油！')
  checkFarmStepMilestone()
}

const onWeedDropToBin = () => {
  if (activeFarmStep.value !== 'weed' || farmDragData.value?.type !== 'weed') return
  const idx = farmDragData.value.index
  if (!farmGameState.weedRemoved[idx]) {
    farmGameState.weedRemoved[idx] = true
    rewardAction('杂草成功拖入垃圾桶！')
    checkFarmStepMilestone()
  }
}

const onHarvestDrop = () => {
  if (activeFarmStep.value !== 'harvest' || farmDragData.value?.type !== 'fruit') return
  const idx = farmDragData.value.index
  if (!farmGameState.harvestCollected[idx]) {
    farmGameState.harvestCollected[idx] = true
    basketShake.value = true
    harvestDing.value = '叮~'
    rewardAction('收获成功，果实进篮子啦！')
    checkFarmStepMilestone()
    setTimeout(() => {
      basketShake.value = false
      harvestDing.value = ''
    }, 500)
  }
}

const answerFarmQuiz = (option) => {
  const stepKey = activeFarmStep.value
  const quiz = farmStepQuizMap[stepKey]
  if (!quiz) return

  if (option === quiz.answer) {
    farmQuizCorrect[stepKey] = true
    rewardAction('回答正确，继续完成该步骤小游戏吧！')
    checkFarmStepMilestone()
  } else {
    wrongAction(`再想想哦，正确答案是：${quiz.answer}`)
  }
}

watch(activeFarmStep, () => {
  farmFeedback.value = ''
})

watch(completedFarmCount, (count) => {
  if (count <= 0) {
    farmPoemIndex.value = 0
    farmPoemFeedback.value = ''
    return
  }
  const maxIndex = Math.min(count, farmPoemTasks.length) - 1
  if (farmPoemIndex.value > maxIndex) farmPoemIndex.value = maxIndex
})

watch(selectedCategory, (id) => {
  if (id === 4 && puzzlePieces.value.length === 0 && puzzleSolvedLines.value.length === 0) {
    resetPuzzleGame()
  }
  if (id === 6) {
    markPoemLearned()
    initPoemMatch()
  }
})

watch(selectedPoemKey, () => {
  markPoemLearned()
  initPoemMatch()
  poetTalk.value = '这首诗学得真认真，继续加油！'
})

const goNextFarmStep = () => {
  const currentIndex = farmSteps.findIndex((s) => s.key === activeFarmStep.value)
  if (currentIndex >= 0 && currentIndex < farmSteps.length - 1) {
    activeFarmStep.value = farmSteps[currentIndex + 1].key
    farmFeedback.value = `进入下一关：${farmSteps[currentIndex + 1].name}`
    coachMessage.value = `准备挑战${farmSteps[currentIndex + 1].name}，加油！`
  }
}

const triggerTreeFx = () => {
  if (completedFarmCount.value < 4) return
  treeFx.value = true
  setTimeout(() => (treeFx.value = false), 1200)
}

const resetLearningState = () => {
  showInlineQuiz.value = false
  quizAnswered.value = false
  quizFeedback.value = ''
  isRecording.value = false
  showQuizModal.value = false
  showMedalPopup.value = false
}

const playAudio = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance)
  }
}

const showCropDetail = (crop) => {
  popCard.value = `crop-${crop.id}`
  setTimeout(() => (popCard.value = ''), 220)
  playAudio(`${crop.name}，${crop.pinyin}`)
  detailData.value = crop
  resetLearningState()
  showDetail.value = true
}

const showToolDetail = (tool) => {
  popCard.value = `tool-${tool.id}`
  setTimeout(() => (popCard.value = ''), 220)
  playAudio(`${tool.name}，${tool.pinyin}`)
  detailData.value = tool
  resetLearningState()
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  isRecording.value = false
  showQuizModal.value = false
  showMedalPopup.value = false
}

const playAndFollowRead = () => {
  if (!detailData.value) return
  isRecording.value = true
  playAudio(detailData.value.readText || detailData.value.audio)

  const done = () => {
    isRecording.value = false
    showInlineQuiz.value = true
    showQuizModal.value = true
    quizAnswered.value = false
    quizFeedback.value = ''
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = done
    recognition.onerror = done
    recognition.onend = done
    recognition.start()
  } else {
    setTimeout(done, 2500)
  }
}

const answerQuizOption = (option) => {
  quizAnswered.value = true
  if (option === detailData.value.quiz.answer) {
    medalCount.value += 1
    quizFeedback.value = `回答正确！正确答案：${detailData.value.quiz.answer}`
    setTimeout(() => {
      showQuizModal.value = false
      showMedalPopup.value = true
    }, 600)
  } else {
    quizFeedback.value = `再试试哦～正确答案是：${detailData.value.quiz.answer}`
  }
}

const closeQuizModal = () => {
  showQuizModal.value = false
}
</script>

<style scoped>
    *, *::before, *::after {
        box-sizing: border-box;
    }

    .farm-classroom {
        --sidebar-width: clamp(210px, 22vw, 280px);
        --main-gap: clamp(16px, 2vw, 30px);
        width: 95%;
        max-width: 1600px;
        margin: 0 auto;
        padding: 20px 0;
    }

    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-left: 0;
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 30px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fff4 100%);
        padding: 18px 26px;
        border-radius: 22px;
        border: 3px solid #e7f5db;
        box-shadow: 0 10px 28px rgba(104,159,56,.10);
    }

    .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .title-icon {
        font-size: 34px;
        filter: drop-shadow(0 3px 0 #d9efc8);
    }

    .title-section h1 {
        margin: 0;
        color: #2e7d32;
        font-weight: 900;
        letter-spacing: 1px;
    }

    .main-content {
        display: flex;
        gap: var(--main-gap);
        align-items: stretch;
    }

    .sidebar {
        width: var(--sidebar-width);
        flex-shrink: 0;
        background: #fff;
        border-radius: 22px;
        padding: 20px 16px;
        border: 3px solid #f0f7ea;
        box-shadow: 0 8px 24px rgba(104,159,56,.08);
    }

    .content-area {
        flex: 1;
        min-width: 0;
        background: #fff;
        border-radius: 22px;
        padding: clamp(20px, 3vw, 40px);
        border: 3px solid #f0f7ea;
        box-shadow: 0 8px 24px rgba(104,159,56,.08);
        min-height: clamp(520px, 70vh, 760px);
    }

    .category-item {
        cursor: pointer;
        margin-bottom: 12px;
        padding: 12px 14px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all .22s ease;
        font-weight: 700;
        color: #546e7a;
    }

        .category-item:hover {
            transform: translateX(4px);
            background: #f2fbe8;
        }

        .category-item.active {
            background: linear-gradient(180deg, #fff7d1, #ffefac);
            color: #f57c00;
            box-shadow: 0 6px 14px rgba(245,124,0,.18);
        }

    .crops-grid, .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(clamp(220px, 24vw, 300px), 1fr));
        gap: clamp(14px, 1.8vw, 22px);
        max-width: 980px;
        margin: 0 auto;
    }

    .crops-grid {
        margin-top: 18px;
    }

    .tools-grid {
        margin-top: 18px;
    }

    .crop-type-tabs, .tool-type-tabs {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 12px;
    }

    .type-tab {
        border: none;
        background: #eef7e5;
        color: #4e6b50;
        padding: 8px 14px;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
        transition: all .2s;
    }

        .type-tab:hover {
            transform: translateY(-1px);
            background: #e2f2d2;
        }

        .type-tab.active {
            background: linear-gradient(180deg, #ffe082, #ffd54f);
            color: #6d4c41;
            box-shadow: 0 4px 10px rgba(255, 193, 7, .25);
        }

    .solar-section,
    .folk-section,
    .poem-section {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .solar-section {
        gap: 16px;
    }

    .poem-layout {
        display: grid;
        grid-template-columns: 240px 1fr 300px;
        gap: 12px;
        align-items: start;
        width: min(100%, 1360px);
        margin: 0 auto;
    }

    .poem-left-nav,
    .poet-ai-panel,
    .poem-content-card,
    .poem-games-card,
    .poem-footprint-card {
        background: linear-gradient(180deg, #ffffff, #f8fff3);
        border: 2px solid #e5f2d8;
        border-radius: 12px;
        padding: 12px;
    }

        .poem-left-nav h3, .poet-ai-panel h3 {
            margin: 0 0 10px;
            color: #2e7d32;
        }

    .poem-nav-item {
        width: 100%;
        border: 2px solid #dcedc8;
        background: #fff;
        border-radius: 10px;
        padding: 8px 10px;
        margin-bottom: 8px;
        text-align: left;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 2px;
        color: #546e7a;
        font-weight: 700;
    }

        .poem-nav-item.active {
            background: linear-gradient(180deg, #fff8e1, #ffe082);
            color: #6d4c41;
            border-color: #ffd54f;
        }

        .poem-nav-item small {
            color: #90a4ae;
            font-size: 12px;
        }

    .poem-progress {
        margin-top: 6px;
        color: #2e7d32;
        font-weight: 800;
    }

    .poem-main {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .poem-content-card h3 {
        margin: 0 0 8px;
        color: #2e7d32;
        text-align: center;
    }

    .poem-lines {
        width: min(100%, 560px);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .poem-line-row {
        width: 100%;
        text-align: center;
        padding: 8px 0;
        border-bottom: 1px dashed #dbe8cf;
    }

        .poem-line-row:last-child {
            border-bottom: none;
        }

    .poem-line-text {
        display: block;
        font-size: 30px;
        line-height: 1.25;
        letter-spacing: 2px;
        color: #37474f;
        font-weight: 800;
    }

    .poem-line-pinyin {
        display: block;
        margin-top: 4px;
        color: #78909c;
        font-size: 14px;
        font-weight: 700;
    }

    .poem-meaning {
        margin: 10px 0;
        color: #5d4037;
        line-height: 1.7;
    }

    .poem-scene img {
        width: 100%;
        border-radius: 10px;
        border: 1px solid #e5f2d8;
    }

    .poem-games-card h4, .poem-footprint-card h4 {
        margin: 0 0 8px;
        color: #2e7d32;
    }

    .poem-games-card ol {
        margin: 0;
        padding-left: 18px;
        color: #546e7a;
        line-height: 1.8;
    }

    .poem-game-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .poem-match-layout {
        display: grid;
        grid-template-columns: minmax(200px, 240px) 1fr;
        gap: 12px;
        align-items: start;
    }

    .poem-match-lines {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .poem-match-scenes {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }

    .poem-line-chip {
        border: 2px dashed #c5e1a5;
        border-radius: 10px;
        background: #fff;
        padding: 8px;
        cursor: grab;
        font-weight: 700;
        color: #546e7a;
    }

        .poem-line-chip.done {
            background: #e8f5e9;
            border-style: solid;
            color: #2e7d32;
            cursor: default;
        }

    .poem-scene-target {
        border: 2px dashed #ffe082;
        border-radius: 10px;
        background: #fffef7;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

        .poem-scene-target.done {
            border-style: solid;
            background: #f1f8e9;
        }

    .poem-scene-thumb {
        width: 100%;
        height: 92px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #e8e0c7;
    }

    .poem-scene-target span {
        font-weight: 700;
        color: #5d4037;
    }

    .poem-scene-target small {
        color: #90a4ae;
    }

    .footprint-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .footprint-item {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        background: #fff;
        border: 1px dashed #c5e1a5;
        border-radius: 10px;
        padding: 6px 8px;
        color: #546e7a;
    }

    .poem-tip-card {
        background: linear-gradient(180deg, #fff8e1, #fff3e0);
        border: 2px solid #ffe0b2;
        color: #ef6c00;
        border-radius: 12px;
        padding: 10px 12px;
        font-weight: 700;
    }

    .poet-avatar-btn {
        width: 100%;
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 0;
    }

        .poet-avatar-btn img {
            width: 100%;
            border-radius: 12px;
            border: 1px solid #e5f2d8;
        }

    .poet-talk {
        color: #5d4037;
        font-weight: 700;
        line-height: 1.7;
        margin: 8px 0;
    }

    .poet-video {
        width: 100%;
        border-radius: 10px;
        background: #000;
    }

    .poet-ai-tip {
        color: #78909c;
        font-size: 12px;
        margin: 8px 0 0;
    }

    .folk-season-tabs {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 6px;
    }

    .folk-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
    }

    .folk-card {
        background: linear-gradient(180deg, #ffffff, #f8fff3);
        border: 2px solid #e5f2d8;
        border-radius: 12px;
        padding: 12px;
    }

    .folk-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

        .folk-head h3 {
            margin: 0;
            color: #2e7d32;
            font-size: 18px;
        }

    .folk-pinyin {
        margin: 6px 0 8px;
        color: #78909c;
        font-weight: 700;
    }

    .folk-desc {
        margin: 0 0 8px;
        color: #455a64;
        line-height: 1.7;
    }

    .folk-tip {
        margin: 0;
        padding: 8px 10px;
        border-radius: 10px;
        background: #fff8e1;
        color: #ef6c00;
        font-weight: 700;
    }

    .solar-block {
        background: linear-gradient(180deg, #ffffff, #f9fff5);
        border: 2px solid #e4f1d8;
        border-radius: 16px;
        padding: 14px;
        box-shadow: 0 8px 18px rgba(104,159,56,.08);
    }

        .solar-block + .solar-block {
            margin-top: 2px;
        }

    .solar-block-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px dashed #d6e7c4;
    }

        .solar-block-head h3 {
            margin: 0;
            color: #2e7d32;
            font-size: 20px;
        }

        .solar-block-head span {
            color: #78909c;
            font-size: 13px;
        }

    /* ================== 节气转盘（最终唯一版） ================== */

    .solar-wheel-layout {
        display: flex;
        align-items: center;
        gap: 40px;
    }

    .solar-wheel-wrap {
        width: 500px;
        height: 500px;
        position: relative;
        flex-shrink: 0;
        margin: 0 auto;
    }

    .solar-wheel-rotator {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 420px;
        height: 420px;
        transform-origin: center center;
        transition: transform 0.6s ease;
    }

    .solar-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 8px solid #dbe8c8;
        box-sizing: border-box;
        background: radial-gradient(circle, #ffffff 55%, #f7fbf2 100%);
    }

    .solar-term-item {
        position: absolute;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #fffdf6;
        border: 2px solid #d8e7c8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        z-index: 2;
        box-sizing: border-box;
        transform: translate(-50%, -50%);
    }

        .solar-term-item.active {
            background: #f7d65a;
            border-color: #e4bd2a;
            box-shadow: 0 0 0 4px rgba(241, 201, 74, 0.18);
        }

    .solar-term-label {
        font-size: 12px;
        color: #5f7f45;
        font-weight: 600;
        line-height: 1.2;
        text-align: center;
        display: block;
        transition: transform 0.6s ease;
        white-space: nowrap;
    }

    .solar-term-item.active .solar-term-label {
        color: #d96b00;
        font-weight: 800;
    }

    .solar-center {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 140px;
        height: 140px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        overflow: hidden;
        border: 6px solid #eef5e6;
        background: #f6fbf2;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        z-index: 5;
        box-sizing: border-box;
    }

    .solar-center-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    /* ======================================================== */

    .solar-detail-card {
        background: #f8fff3;
        border: 2px solid #e5f2d8;
        border-radius: 14px;
        padding: 14px;
    }

        .solar-detail-card h3 {
            margin: 0 0 8px;
            color: #2e7d32;
        }

        .solar-detail-card p {
            margin: 0 0 10px;
            color: #546e7a;
        }

    .solar-video {
        width: 100%;
        border-radius: 12px;
        background: #000;
    }

    .solar-song-grid, .solar-games-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .song-card, .game-card {
        background: #f8fff3;
        border: 2px solid #e5f2d8;
        border-radius: 12px;
        padding: 12px;
    }

    .solar-game-hub {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 14px;
        align-items: start;
    }

    .solar-game-menu {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .solar-game-tab {
        border: 2px solid #dcedc8;
        background: #fff;
        border-radius: 12px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        color: #546e7a;
        font-weight: 800;
    }

        .solar-game-tab.active {
            background: linear-gradient(180deg, #fff8e1, #ffe082);
            border-color: #ffd54f;
            color: #6d4c41;
        }

    .solar-game-stage {
        background: #f8fff3;
        border: 2px solid #e5f2d8;
        border-radius: 12px;
        padding: 12px;
    }

    .solar-game-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .game-acc {
        color: #2e7d32;
        font-weight: 800;
    }

    .game-head-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .game-streak {
        background: #fff3e0;
        color: #ef6c00;
        border-radius: 999px;
        padding: 2px 10px;
        font-weight: 800;
        font-size: 12px;
    }

    .reset-mini-btn {
        border: none;
        background: #eceff1;
        color: #546e7a;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 12px;
        cursor: pointer;
    }

    .game-overview {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        color: #607d8b;
        font-weight: 700;
        font-size: 13px;
    }

    .game-progress-track {
        height: 8px;
        border-radius: 999px;
        background: #e8f5e9;
        overflow: hidden;
    }

    .game-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #81c784, #43a047);
    }

    .song-line {
        margin: 6px 0;
        padding: 6px 8px;
        border-radius: 8px;
        cursor: pointer;
    }

        .song-line.active {
            background: #fff8e1;
            color: #ef6c00;
            font-weight: 800;
        }

    .puzzle-area {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .puzzle-solved, .puzzle-pool {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .puzzle-piece {
        border: 1px dashed #c5e1a5;
        background: #fff;
        border-radius: 8px;
        padding: 6px 8px;
        cursor: pointer;
    }

        .puzzle-piece.solved {
            border-style: solid;
            background: #e8f5e9;
            color: #2e7d32;
        }

    .fill-q {
        font-weight: 800;
        color: #455a64;
        margin-bottom: 8px;
    }

    .quiz-inline-btn.grow {
        animation: growPlant .7s ease;
    }

    .farm-flow-section {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .farm-flow-layout {
        display: grid;
        grid-template-columns: minmax(260px, 340px) 1fr;
        gap: 14px;
        align-items: start;
    }

    .farm-profile-column,
    .farm-mission-column {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .coach-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: center;
        background: #fffdf3;
        border: 2px solid #ffe082;
        border-radius: 12px;
        padding: 10px;
    }

    .coach-avatar {
        border: none;
        background: #fff3cd;
        min-width: 58px;
        height: 46px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 18px;
        padding: 0 8px;
    }

    .coach-bubble {
        color: #5d4037;
        font-weight: 700;
    }

    .combo-badge {
        background: #ede7f6;
        color: #5e35b1;
        border-radius: 999px;
        padding: 4px 10px;
        font-weight: 800;
        font-size: 12px;
    }

        .combo-badge.flash {
            animation: comboPulse .26s ease;
        }

    .chest-card {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 2px dashed #cfd8dc;
        background: #fafafa;
        color: #607d8b;
        border-radius: 12px;
        padding: 10px;
        cursor: pointer;
        font-weight: 700;
    }

        .chest-card.ready {
            border-color: #ffb300;
            background: #fff8e1;
            color: #ef6c00;
            box-shadow: 0 8px 16px rgba(255,179,0,.24);
        }

    .chest-icon {
        font-size: 24px;
    }

    .chest-fx {
        color: #ef6c00;
        font-weight: 900;
        margin-top: -4px;
    }

    .farmer-role-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .farmer-role-card {
        min-width: 150px;
        background: #f7fbf2;
        border: 2px solid #e3efd8;
        border-radius: 14px;
        padding: 10px 12px;
        cursor: pointer;
        text-align: center;
    }

        .farmer-role-card.active {
            border-color: #8bc34a;
            box-shadow: 0 6px 14px rgba(139,195,74,.22);
        }

    .role-emoji {
        font-size: 28px;
    }

    .role-name {
        font-weight: 700;
        color: #3f5b46;
        margin-top: 2px;
    }

    .role-stage {
        display: flex;
        gap: 14px;
        align-items: center;
        background: linear-gradient(180deg, #ffffff, #f5fbeF);
        border: 2px solid #e4f0d7;
        border-radius: 14px;
        padding: 12px 14px;
    }

    .stage-avatar {
        font-size: 52px;
        line-height: 1;
        filter: drop-shadow(0 4px 0 rgba(139,195,74,.25));
    }

    .stage-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .stage-name {
        font-weight: 800;
        color: #2e7d32;
    }

    .stage-score {
        color: #ff8f00;
        font-weight: 800;
    }

    .stage-tools {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .stage-tool-badge {
        padding: 4px 8px;
        border-radius: 999px;
        background: #eceff1;
        color: #90a4ae;
        font-size: 12px;
    }

        .stage-tool-badge.unlocked {
            background: #e8f5e9;
            color: #2e7d32;
        }

    .flow-tools-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .flow-tool {
        padding: 6px 10px;
        border-radius: 999px;
        background: #eceff1;
        color: #78909c;
        display: inline-flex;
        gap: 4px;
        align-items: center;
    }

        .flow-tool.unlocked {
            background: #e8f5e9;
            color: #2e7d32;
        }

    .flow-title-badge {
        background: linear-gradient(180deg, #fff7d1, #ffe082);
        color: #6d4c41;
        border-radius: 999px;
        padding: 6px 12px;
        font-weight: 800;
    }

    .farm-step-tabs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
    }

    .step-card {
        border: 2px solid #d8eac7;
        background: #f8fff3;
        border-radius: 12px;
        padding: 8px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font-weight: 800;
        color: #4f6955;
    }

        .step-card.active {
            border-color: #8bc34a;
            box-shadow: 0 6px 12px rgba(139,195,74,.2);
        }

        .step-card.done {
            background: linear-gradient(180deg, #e8f5e9, #f1f8e9);
            color: #2e7d32;
        }

        .step-card.locked {
            opacity: .55;
            cursor: not-allowed;
        }

        .step-card:disabled {
            pointer-events: none;
        }

    .step-title {
        font-size: 15px;
    }

    .step-mark {
        font-size: 18px;
    }

    .farm-step-panel {
        background: #f9fdf5;
        border: 2px solid #e9f3df;
        border-radius: 14px;
        padding: 14px;
    }

    .farm-step-desc {
        color: #4f6955;
        margin-bottom: 10px;
        font-weight: 700;
    }

    .mission-hud {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        background: #ffffff;
        border: 1px dashed #d6e7c4;
        border-radius: 10px;
        padding: 8px 10px;
        color: #607d8b;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .farm-game-board {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .drag-items {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .drag-chip {
        background: #fff;
        border: 2px solid #e8f1dd;
        border-radius: 10px;
        padding: 8px 10px;
        cursor: grab;
        user-select: none;
    }

        .drag-chip.removed {
            opacity: .55;
        }

        .drag-chip.weed:not(.removed) {
            background: #fff8e1;
            border-color: #ffe082;
        }

    .drop-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 8px;
        min-width: 0;
        width: 100%;
        flex: 1;
    }

    .drop-cell {
        border: 2px dashed #c5e1a5;
        border-radius: 10px;
        min-height: 58px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        color: #689f38;
        font-weight: 700;
    }

        .drop-cell.wet {
            background: #e1f5fe;
            border-color: #81d4fa;
            color: #0277bd;
        }

    .trash-bin {
        min-width: 130px;
        min-height: 58px;
        border: 2px dashed #ffcc80;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff8e1;
        color: #ef6c00;
        font-weight: 700;
    }

    .basket-zone {
        min-width: 160px;
        min-height: 58px;
        border: 2px dashed #aed581;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f8e9;
        color: #558b2f;
        font-weight: 800;
    }

        .basket-zone.shake {
            animation: basketShake .35s ease;
        }

    .farm-quiz-box {
        margin-top: 12px;
        background: #fff;
        border: 1px solid #e6f0dc;
        border-radius: 10px;
        padding: 10px;
    }

    .farm-poem-box {
        margin-top: 12px;
        background: #fffdf6;
        border: 1px solid #f2e5bc;
        border-radius: 10px;
        padding: 10px;
    }

    .farm-poem-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: center;
        color: #6d4c41;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .farm-poem-head span {
        color: #8d6e63;
        font-size: 12px;
    }

    .farm-poem-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
    }

    .farm-poem-tab {
        border: 1px solid #ffe082;
        background: #fff8e1;
        color: #6d4c41;
        border-radius: 999px;
        padding: 4px 10px;
        cursor: pointer;
        font-weight: 700;
        font-size: 12px;
    }

    .farm-poem-tab.active {
        background: #ffe082;
    }

    .farm-poem-tab.done {
        border-color: #81c784;
        background: #e8f5e9;
        color: #2e7d32;
    }

    .farm-poem-tab.locked {
        opacity: .55;
        cursor: not-allowed;
    }

    .farm-poem-line {
        margin: 0;
        color: #5d4037;
        font-weight: 800;
    }

    .farm-poem-q {
        margin: 6px 0 8px;
        color: #607d8b;
        font-weight: 700;
    }

    .farm-feedback {
        margin-top: 8px;
        color: #2e7d32;
        font-weight: 700;
    }

    .growth-tree {
        margin-top: 4px;
        text-align: center;
        background: #f6fbef;
        border: 2px dashed #dcedc8;
        border-radius: 12px;
        padding: 12px;
        cursor: pointer;
    }

    .tree-emoji {
        font-size: 42px;
    }

    .tree-progress {
        color: #607d8b;
        font-weight: 700;
    }

    .tree-fx {
        margin-top: 6px;
        color: #f57c00;
        font-weight: 800;
    }

    .sparkle-layer {
        position: relative;
        height: 0;
        pointer-events: none;
    }

    .spark-item {
        position: absolute;
        transform: translate(-50%, -50%);
        color: #ff9800;
        font-weight: 900;
        animation: popStar .8s ease forwards;
    }

    .step-toast {
        position: sticky;
        bottom: 12px;
        margin-top: 6px;
        background: linear-gradient(180deg, #66bb6a, #43a047);
        color: #fff;
        font-weight: 800;
        text-align: center;
        padding: 10px 12px;
        border-radius: 999px;
        box-shadow: 0 10px 18px rgba(67,160,71,.35);
        animation: popIn .2s ease;
    }

    .crop-card, .tool-card {
        border-radius: 22px;
        padding: clamp(18px, 2.2vw, 26px) 14px 14px;
        min-height: 270px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        gap: 6px;
        text-align: center;
        cursor: pointer;
        transition: .25s;
        background: linear-gradient(180deg, #fffefa 0%, #f8fff2 100%);
        border: 2px solid #e8f5d9;
        box-shadow: 0 8px 16px rgba(139,195,74,.10);
        position: relative;
        overflow: hidden;
    }

        .crop-card::before, .tool-card::before {
            content: '';
            position: absolute;
            top: -30px;
            right: -30px;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, rgba(255,241,118,.55), rgba(255,241,118,0));
        }

        .crop-card::after, .tool-card::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 42%;
            background: linear-gradient(180deg, rgba(255,255,255,.2), rgba(247,252,242,.96));
            border-top: 1px solid rgba(163, 191, 139, .55);
            z-index: 1;
        }

        .crop-card.pop, .tool-card.pop {
            transform: scale(1.06);
        }

        .crop-card:hover, .tool-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 14px 24px rgba(255,193,7,.18);
            border-color: #ffe082;
        }

    .crop-name, .tool-name {
        font-size: 24px;
        font-weight: 800;
        color: #14381c;
        margin: 0;
        padding: 2px 8px 0;
        text-shadow: 0 1px 0 rgba(255, 255, 255, .95);
        z-index: 2;
        position: relative;
    }

    .card-info {
        width: 100%;
        margin-top: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 2px;
        position: relative;
        z-index: 2;
    }

    .crop-pinyin, .tool-pinyin {
        font-size: 16px;
        color: #455a64;
        background: rgba(236, 239, 241, .9);
        padding: 4px 12px;
        border-radius: 12px;
        display: inline-block;
        margin-top: 0;
        position: relative;
        z-index: 2;
    }

    .crop-icon, .tool-icon {
        font-size: 48px;
        margin-bottom: 8px;
    }

    .crop-group-line {
        margin-top: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        position: relative;
        z-index: 2;
    }

    .group-main, .group-sub {
        font-size: 14px;
        padding: 3px 10px;
        border-radius: 999px;
    }

    .group-main {
        background: #e8f5e9;
        color: #1b5e20;
    }

    .group-sub {
        background: #fff3e0;
        color: #bf360c;
    }

    .detail-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.42);
        backdrop-filter: blur(3px);
        z-index: 1200;
    }

    .modal-content {
        background: white;
        padding: 30px 34px;
        border-radius: 20px;
        max-width: 1160px;
        width: min(94vw, 1160px);
        max-height: 88vh;
        overflow-y: auto;
        position: relative;
        z-index: 1201;
    }

    .learning-content {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .learn-top {
        display: grid;
        grid-template-columns: minmax(220px, .8fr) minmax(460px, 2fr);
        gap: 20px;
        align-items: stretch;
    }

    .cartoon-panel, .info-panel, .real-panel {
        background: #fafdf6;
        border: 1px solid #edf6e2;
        border-radius: 14px;
        padding: 14px;
    }

        .info-panel h3 {
            margin: 0 0 8px;
            font-size: 24px;
            color: #2f4f38;
        }

    .info-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .info-card {
        background: #ffffff;
        border: 1px solid #e7efdc;
        border-radius: 12px;
        padding: 12px;
    }

        .info-card h4 {
            margin: 0 0 8px;
            color: #2f5d37;
            font-size: 18px;
        }

    .base-card {
        background: linear-gradient(180deg, #ffffff, #f8fff4);
    }

    .tip-card {
        background: linear-gradient(180deg, #fffef7, #fff7e6);
    }

    .group-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 8px 0 10px;
    }

    .group-tag {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
    }

        .group-tag.main {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .group-tag.sub {
            background: #fff8e1;
            color: #ef6c00;
        }

    .img-group {
        display: flex;
        gap: 12px;
        margin-top: 10px;
    }

    .cartoon-box, .real-box {
        background: #f7f7f7;
        border-radius: 12px;
        padding: 12px;
        text-align: center;
        min-height: 200px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .detail-image {
        font-size: 78px;
    }

    .real-box img {
        width: 100%;
        height: 160px;
        object-fit: cover;
        border-radius: 10px;
    }

    .desc {
        line-height: 1.9;
        font-size: 18px;
        margin: 0;
        color: #3d4f43;
    }

    .detail-tip {
        margin-top: 0;
        background: #fff8e1;
        padding: 12px;
        border-radius: 10px;
        font-size: 16px;
    }

    .learn-middle {
        margin-top: 2px;
        border-top: 1px dashed #ddd;
        padding-top: 16px;
    }

    .learn-video {
        width: min(100%, 820px);
        aspect-ratio: 16 / 9;
        max-height: none;
        border-radius: 12px;
        background: #000;
        display: block;
        margin: 0 auto;
    }

    .follow-row {
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        background: #f7fbf2;
        border: 1px solid #e3efd8;
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 16px;
    }

    .speaker-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
    }

    .record-tip {
        margin-top: 8px;
        color: #2e7d32;
        font-weight: 700;
    }

    .learn-bottom {
        margin-top: 14px;
        border-top: 1px dashed #ddd;
        padding-top: 12px;
    }

    .quiz-inline-options {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .quiz-inline-btn {
        padding: 8px 12px;
        border: none;
        background: linear-gradient(180deg, #fff9c4, #ffe082);
        border-radius: 12px;
        cursor: pointer;
        font-weight: 700;
        color: #6d4c41;
        box-shadow: 0 4px 10px rgba(255, 193, 7, .25);
    }

        .quiz-inline-btn:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

    .quiz-feedback {
        margin-top: 8px;
        color: #ef6c00;
        font-weight: 700;
    }

    .medal {
        margin-top: 6px;
        color: #f57c00;
        font-weight: 700;
    }

    .empty-tip {
        margin-top: 14px;
        color: #90a4ae;
        text-align: center;
    }

    .quiz-pop-mask,
    .medal-pop-mask {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1300;
    }

    .quiz-pop-card,
    .medal-pop-card {
        width: min(760px, 94vw);
        background: linear-gradient(180deg, #ffffff, #f8fff4);
        border: 4px solid #dcedc8;
        border-radius: 22px;
        padding: 26px 28px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(46, 125, 50, 0.25);
        animation: popIn .25s ease;
    }

    .quiz-question {
        font-size: 30px;
        font-weight: 700;
        color: #2e7d32;
        line-height: 1.6;
        margin: 10px auto 18px;
        max-width: 92%;
    }

    .quiz-pop-card h4 {
        margin: 0;
        font-size: 20px;
    }

    .quiz-pop-card .quiz-inline-options {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 14px;
    }

    .quiz-pop-card .quiz-inline-btn {
        min-width: 220px;
        padding: 12px 18px;
        font-size: 18px;
        border-radius: 14px;
    }

    .quiz-next-btn {
        margin-top: 12px;
        border: none;
        background: linear-gradient(180deg, #66bb6a, #43a047);
        color: #fff;
        padding: 10px 16px;
        border-radius: 999px;
        cursor: pointer;
        font-weight: 700;
    }

    .medal-emoji {
        font-size: 58px;
        animation: bounce .8s infinite alternate;
    }

    @keyframes popIn {
        from {
            transform: scale(.85);
            opacity: 0;
        }

        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    @keyframes bounce {
        from {
            transform: translateY(0);
        }

        to {
            transform: translateY(-8px);
        }
    }

    @keyframes basketShake {
        0% {
            transform: translateX(0);
        }

        25% {
            transform: translateX(-4px);
        }

        50% {
            transform: translateX(4px);
        }

        75% {
            transform: translateX(-3px);
        }

        100% {
            transform: translateX(0);
        }
    }

    @keyframes popStar {
        0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(.8);
        }

        20% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -32px) scale(1.1);
        }
    }

    @keyframes comboPulse {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.12);
        }

        100% {
            transform: scale(1);
        }
    }

    @keyframes seasonPulse {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.06);
        }

        100% {
            transform: scale(1);
        }
    }

    @keyframes growPlant {
        0% {
            transform: scale(1);
        }

        35% {
            transform: scale(1.16);
        }

        100% {
            transform: scale(1);
        }
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #ffffff;
        border: 2px solid #dcedc8;
        border-radius: 999px;
        padding: 8px 14px;
        min-width: 280px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 6px 14px rgba(104,159,56,.08);
    }

    .search-icon {
        font-size: 16px;
        opacity: .8;
    }

    .search-input {
        border: none;
        outline: none;
        width: 100%;
        background: transparent;
        font-size: 14px;
        color: #455a64;
    }

        .search-input::placeholder {
            color: #9e9e9e;
        }

    /* 1920×1080 及更大屏 */
    @media (min-width: 1600px) {
        .farm-classroom {
            --sidebar-width: 300px;
            max-width: 1760px;
        }

        .main-content {
            gap: 28px;
        }

        .sidebar {
            width: 300px;
        }

        .content-area {
            padding: 42px;
        }

        .crops-grid, .tools-grid {
            max-width: 1160px;
        }
    }

    /* 1366×768 主流笔记本 */
    @media (max-width: 1440px) and (min-width: 1101px) {
        .farm-classroom {
            --sidebar-width: 240px;
            width: 96%;
        }

        .sidebar {
            width: 240px;
        }

        .content-area {
            padding: 26px;
        }

        .crops-grid, .tools-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            max-width: 980px;
        }
    }

    @media (max-width: 1200px) {
        .farm-classroom {
            --sidebar-width: 220px;
        }

        .sidebar {
            width: 220px;
        }

        .content-area {
            min-height: auto;
            padding: 22px;
        }

        .crops-grid, .tools-grid {
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        }
    }

    /* 平板（约 768~1024） */
    @media (max-width: 1100px) and (min-width: 901px) {
        .farm-classroom {
            --sidebar-width: 200px;
        }

        .main-content {
            gap: 16px;
        }

        .sidebar {
            width: 200px;
            padding: 16px 12px;
        }

        .content-area {
            padding: 20px;
        }

        .crop-name, .tool-name {
            font-size: 18px;
        }

        .learn-top {
            gap: 12px;
        }
    }

    @media (max-width: 900px) {
        .main-content {
            flex-direction: column;
        }

        .sidebar {
            width: 100%;
        }

        .content-area {
            padding: 18px;
        }

        .crops-grid, .tools-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .solar-wheel-layout {
            flex-direction: column;
            gap: 18px;
        }

        .solar-block-head {
            flex-direction: column;
            align-items: flex-start;
        }

        .solar-game-hub {
            grid-template-columns: 1fr;
        }

        .solar-game-menu {
            flex-direction: row;
            overflow-x: auto;
        }

        .solar-game-tab {
            min-width: 160px;
        }

        .solar-game-head {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
        }

        .game-head-right {
            flex-wrap: wrap;
        }

        .farm-flow-layout {
            grid-template-columns: 1fr;
        }

        .poem-layout {
            grid-template-columns: 1fr;
        }

        .poem-match-layout {
            grid-template-columns: 1fr;
        }

        .poem-match-scenes {
            grid-template-columns: 1fr;
        }

        .top-bar {
            margin-left: 0;
            width: 100%;
        }

        .learn-top {
            grid-template-columns: 1fr;
        }

        .modal-content {
            padding: 18px;
            width: 96vw;
        }

        .search-box {
            min-width: 220px;
        }

        .solar-wheel-wrap {
            width: 360px;
            height: 360px;
        }

        .solar-wheel-rotator {
            width: 320px;
            height: 320px;
        }

        .solar-ring {
            border-width: 6px;
        }

        .solar-term-item {
            width: 52px;
            height: 52px;
        }

        .solar-term-label {
            font-size: 11px;
        }

        .solar-center {
            width: 108px;
            height: 108px;
        }
    }

    @media (max-width: 640px) {
        .top-bar {
            padding: 14px 16px;
        }

        .title-section h1 {
            font-size: 22px;
        }

        .search-input {
            width: 180px;
        }

        .crops-grid, .tools-grid {
            grid-template-columns: 1fr;
        }

        .modal-content {
            width: 96%;
            padding: 16px;
        }

        .real-box img {
            height: 120px;
        }

        .solar-wheel-wrap {
            width: 300px;
            height: 300px;
        }

        .solar-wheel-rotator {
            width: 270px;
            height: 270px;
        }

        .solar-term-item {
            width: 46px;
            height: 46px;
        }

        .solar-term-label {
            font-size: 10px;
        }

        .solar-center {
            width: 92px;
            height: 92px;
        }
    }
</style>

