<template>
  <div class="home-page">
    <section class="home-top">
      <main class="home-stage">
        <section class="home-title-block" aria-label="小小农夫成长营">
          <p class="home-title-pill">小小农夫成长营</p>
          <p class="home-title-copy">在探索中认识农耕，在实践中收获成长</p>
        </section>

        <section class="feature-grid" aria-label="主要入口">
          <button
            v-for="card in entryCards"
            :key="card.page"
            class="feature-card"
            type="button"
            :aria-label="`进入${card.title}`"
            @click="showPage(card.page)"
          >
            <div class="feature-frame">
              <img :src="card.image" :alt="card.title" />
            </div>
          </button>
        </section>
      </main>
    </section>

    <section class="home-info" aria-label="成长营介绍">
      <h2>🌾 小小农夫成长营——属于你的田野冒险开始啦！</h2>

      <div class="home-info-body">
        <p>嘿，亲爱的小农夫！</p>

        <p>
          你已经种下了第一颗种子，给小苗浇过水，还打败了偷吃庄稼的杂草怪……真是太了不起啦！
        </p>

        <p>可是——田野里还有好多好多神奇的事情等着你呢！</p>

        <p>🌱 你见过水稻宝宝是怎么从一粒小种子变成香喷喷米饭的吗？</p>
        <p>🐥 你知不知道农场里的小鸡、小鸭也会帮忙“上班”，除草、施肥样样行？</p>
        <p>🌽 玉米的每一根须须，竟然都藏着一粒金黄色的玉米粒哦！</p>
        <p>
          🌾
          二十四节气里，还藏着会唱歌的秘密，你想不想学会它，当一个小小节气歌手？
        </p>

        <p>在 小小农夫成长营，每一天都有新的冒险——</p>
        <p>你可以当农场主，照顾自己的禾苗和小动物；</p>
        <p>可以和爸爸妈妈一起完成亲子实践任务，拿到真正的种子礼包；</p>
        <p>
          还可以闯关答题，收集闪闪发光的农耕勋章，成为大家心目中的
          “农耕小博士”！
        </p>

        <p>
          这里没有难懂的大道理，只有会笑的小禾苗、会点头的小农夫、会唱歌的田野风……
        </p>
        <p>每一滴汗水，都会变成收获的果实；</p>
        <p>每一次动手，都会离大自然更近一步。</p>

        <p>所以，还等什么呢？</p>

        <p>👒 戴上你的小草帽，拿起你的小水壶，</p>
        <p>点击你想去的板块，开始今天的田野大冒险吧！</p>
      </div>

      <p class="home-info-copy">走进农耕，拥抱自然——我们田野里见！</p>
    </section>
  </div>
</template>

<script setup>
import { showPage } from "../../store";

import entryImage1 from "../../assets/images/home/inner1.png";
import entryImage2 from "../../assets/images/home/inner3.png";
import entryImage3 from "../../assets/images/home/inner2.png";
import entryImage4 from "../../assets/images/home/inner4.png";
import entryImage5 from "../../assets/images/home/inner5.png";
import entryImage6 from "../../assets/images/home/inner6.png";

const entryCards = [
  {
    page: "class",
    title: "农耕小课堂",
    image: entryImage1,
  },
  {
    page: "farm",
    title: "农耕知识大闯关",
    image: entryImage2,
  },
  {
    page: "quiz",
    title: "小小农场主",
    image: entryImage3,
  },
  {
    page: "wiki",
    title: "农耕小百科",
    image: entryImage4,
  },
  {
    page: "parent",
    title: "亲子实践营",
    image: entryImage5,
  },
  {
    page: "game",
    title: "趣味小游戏",
    image: entryImage6,
  },
];
</script>

<style scoped>
.home-page {
  --sky-blue: #91c8ea;
  --lake-blue: #72b7df;
  --meadow-green: #9bcd74;
  --leaf-green: #4f8f4b;
  --title-green: #4d8a47;
  --title-stroke: #f3fbff;
  --sun-orange: #de7d3a;
  --info-bg: #d9efc6;
  --info-border: #a7d08a;
  --info-text: #2f4e34;

  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #8ec6e8 0%, #7abbe0 52%, #9bcf7a 100%);
  font-family: "SimSun", "Songti SC", "STSong", "Microsoft YaHei", serif;
}

.home-top {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    var(--sky-blue) 0%,
    var(--lake-blue) 58%,
    var(--meadow-green) 58%,
    #8ec468 100%
  );
}

.home-top::before {
  content: "";
  position: absolute;
  inset: 0 0 -2px 0;
  background: url("../../assets/images/banner.jpg") center bottom / cover
    no-repeat;
  opacity: 0.94;
  pointer-events: none;
}

.home-stage {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 18px 20px 24px;
}

.home-title-block {
  position: relative;
  z-index: 2;
  width: fit-content;
  margin: 6px auto 14px;
  text-align: center;
}

.home-title-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--title-green);
  font-family:
    "STXinwei", "STKaiti", "KaiTi", "DFKai-SB", "FangSong", "SimSun", serif;
  font-size: clamp(36px, 4vw, 62px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;
  -webkit-text-stroke: 2.5px var(--title-stroke);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95),
    0 3px 0 rgba(241, 250, 255, 0.88),
    0 8px 14px rgba(45, 96, 131, 0.22);
}

.home-title-copy {
  margin-top: 8px;
  color: #eef8ff;
  font-size: clamp(14px, 1.2vw, 18px);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(37, 90, 125, 0.4);
}

.feature-grid {
  position: relative;
  z-index: 2;
  width: min(1180px, calc(100% - 90px));
  margin: 22px auto 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px 44px;
  align-items: start;
}

.feature-card {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
  width: min(100%, 300px);
  justify-self: center;
  transition: transform 0.18s ease;
}

.feature-card:hover {
  transform: translateY(-6px) scale(1.01);
  filter: drop-shadow(0 12px 20px rgba(54, 107, 54, 0.24));
}

.feature-frame {
  position: relative;
  overflow: hidden;
  /* border-radius: 34px; */
  /* background: rgba(255, 255, 255, 0.94); */
  /* border: 8px solid rgba(255, 255, 255, 0.95); */
  /* box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.34),
    0 20px 34px rgba(0, 0, 0, 0.18);
  aspect-ratio: 1 / 1; */
}

/* .feature-frame::before {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 26px;
  border: 2px solid rgba(255, 255, 255, 0.62);
  pointer-events: none;
} */

.feature-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
}

.feature-card:nth-child(1) {
  transform: rotate(-1deg);
}

.feature-card:nth-child(2) {
  transform: translateY(5px);
}

.feature-card:nth-child(3) {
  transform: rotate(1deg);
}

.feature-card:nth-child(4) {
  transform: rotate(-0.8deg);
}

.feature-card:nth-child(5) {
  transform: translateY(5px);
}

.feature-card:nth-child(6) {
  transform: rotate(0.8deg);
}

.home-info {
  margin: 0 auto;
  width: min(1400px, calc(100% - 24px));
  border-top: 4px solid var(--info-border);
  background: linear-gradient(180deg, var(--info-bg) 0%, #cfe8b7 100%);
  padding: 22px 26px 20px;
  color: var(--info-text);
  text-align: center;
  font-family: "KaiTi", "STKaiti", "DFKai-SB", "FangSong", "SimSun", serif;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 -8px 20px rgba(105, 152, 82, 0.16);
}

.home-info h2 {
  font-family:
    "STXinwei", "STKaiti", "KaiTi", "DFKai-SB", "FangSong", "SimSun", serif;
  font-size: clamp(30px, 2.3vw, 42px);
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.6px;
  margin-bottom: 16px;
  color: #3d7340;
  text-shadow: 0 1px 0 rgba(245, 255, 241, 0.78);
}

.home-info p {
  margin: -1px auto 0;
  font-size: clamp(14px, 1.05vw, 18px);
  line-height: 1.62;
  color: #37583c;
}

.home-info-body {
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
  column-count: 2;
  column-gap: 52px;
}

.home-info-body p {
  break-inside: avoid;
  width: 88%;
  margin: 0 auto 10px;
}

.home-info-copy {
  margin-top: 12px;
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 700;
  color: #2f6434;
  text-shadow: 0 1px 0 rgba(242, 252, 238, 0.76);
}

@media (max-width: 1180px) {
  .home-header {
    height: auto;
    min-height: 74px;
    flex-wrap: wrap;
    gap: 8px 14px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .home-nav {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .home-nav-link,
  .menu-btn {
    height: 42px;
  }

  .home-nav-link + .home-nav-link::before,
  .menu-btn::before {
    top: 4px;
    height: 30px;
  }

  .home-stage {
    min-height: calc(100vh - 92px);
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(860px, calc(100% - 30px));
    gap: 22px 34px;
  }

  .home-info {
    width: calc(100% - 20px);
    padding: 18px 16px;
    margin-top: 0;
  }

  .home-info h2 {
    font-size: clamp(24px, 3.4vw, 34px);
  }

  .home-info p {
    font-size: 16px;
  }

  .home-info-body {
    column-count: 1;
    max-width: 900px;
  }
}

@media (max-width: 760px) {
  .home-header {
    padding-left: 14px;
    padding-right: 14px;
  }

  .brand-wordmark {
    font-size: 24px;
    -webkit-text-stroke: 1.2px #f9fff6;
  }

  .home-nav {
    gap: 4px;
  }

  .home-nav-link,
  .menu-btn {
    padding-left: 10px;
    padding-right: 10px;
    font-size: 13px;
  }

  .menu-btn {
    width: 46px;
    font-size: 24px;
  }

  .home-stage {
    padding-left: 12px;
    padding-right: 12px;
  }

  .home-title-pill {
    -webkit-text-stroke: 1.5px #f9fff6;
    letter-spacing: 0.8px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    width: 100%;
    gap: 16px;
  }

  .feature-card,
  .feature-card:nth-child(3),
  .feature-card:nth-child(4),
  .feature-card:nth-child(5),
  .feature-card:nth-child(6) {
    width: 100%;
    grid-column: auto;
    transform: none;
  }

  .feature-frame {
    border-width: 7px;
    border-radius: 28px;
  }

  .home-info {
    width: 100%;
    padding: 14px 10px 16px;
    margin-top: 0;
  }

  .home-info-links {
    font-size: 16px;
    line-height: 1.5;
  }

  .home-info h2 {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .home-info p {
    font-size: 14px;
    line-height: 1.55;
  }

  .home-info-body {
    column-count: 1;
    column-gap: 0;
  }

  .home-info-copy {
    font-size: 16px;
  }
}
</style>
