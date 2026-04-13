<template>
  <div class="navbar">
    <button
      class="brand-lockup"
      type="button"
      @click="showPage('home')"
      aria-label="返回首页"
    >
      <span class="brand-wordmark">小小农夫成长营</span>
    </button>

    <nav class="home-nav" aria-label="站点导航">
      <button
        v-for="item in navItems"
        :key="item.label"
        class="home-nav-link"
        type="button"
        @click="showPage(item.page)"
      >
        {{ item.label }}
      </button>
      <button class="menu-btn" type="button" aria-label="菜单">☰</button>
    </nav>
  </div>
</template>

<script setup>
import { showPage } from "../../store";

const navItems = [
  { label: "小课堂", page: "class" },
  { label: "闯关", page: "quiz" },
  { label: "小农场", page: "farm" },
  { label: "农耕百科", page: "wiki" },
  { label: "成长档案", page: "user" },
];
</script>

<style scoped>
.navbar {
  width: 100%;
  min-height: 74px;
  font-family: "SimSun", "Songti SC", "STSong", "Microsoft YaHei", serif;
  background: rgb(72, 179, 39);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 0 22px;
  position: fixed;
  top: 0;
  z-index: 999;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.08);
}

.brand-lockup {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.brand-wordmark {
  display: inline-flex;
  align-items: center;
  color: #2f8d39;
  font-family:
    "STXinwei", "STKaiti", "KaiTi", "DFKai-SB", "FangSong", "SimSun", serif;
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1px;
  -webkit-text-stroke: 2px #f9fff6;
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95),
    0 3px 0 rgba(255, 255, 255, 0.85),
    0 7px 12px rgba(35, 98, 36, 0.2);
}

.home-nav {
  display: flex;
  align-items: center;
  gap: 0;
  color: #ffffff;
}

.home-nav-link,
.menu-btn {
  border: 0;
  background: transparent;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  padding: 0 16px;
  height: 74px;
  position: relative;
}

.home-nav-link + .home-nav-link::before,
.menu-btn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 18px;
  width: 1px;
  height: 38px;
  background: rgba(255, 255, 255, 0.42);
}

.home-nav-link + .home-nav-link {
  padding-left: 18px;
}

.menu-btn {
  width: 58px;
  padding-left: 14px;
  padding-right: 14px;
  font-size: 28px;
  line-height: 1;
}

@media (max-width: 1180px) {
  .navbar {
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
}

@media (max-width: 760px) {
  .navbar {
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
}
</style>
