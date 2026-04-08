<template>
  <div id="app-container">
    <Navbar />

    <div class="container">
        <Home v-if="store.currentPage === 'home'" />
        <ClassPage v-else-if="store.currentPage === 'class'" />
        <QuizPage v-else-if="store.currentPage === 'quiz'" />
        <FarmPage v-else-if="store.currentPage === 'farm'" />
        <ParentPage v-else-if="store.currentPage === 'parent'" />
        <WikiPage v-else-if="store.currentPage === 'wiki'" />
        <GamePage v-else-if="store.currentPage === 'game'" />
        <UserPage v-else-if="store.currentPage === 'user'" />
    </div>

    <DetailModal />
    <AppFooter />
  </div>
</template>

<script setup>
import { store } from './store'
import Navbar from './components/layout/Navbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import DetailModal from './components/layout/DetailModal.vue'
import Home from './components/pages/Home.vue'
import ClassPage from './components/pages/ClassPage.vue'
import QuizPage from './components/pages/QuizPage.vue'
import FarmPage from './components/pages/FarmPage.vue'
import ParentPage from './components/pages/ParentPage.vue'
import WikiPage from './components/pages/WikiPage.vue'
import GamePage from './components/pages/GamePage.vue'
import UserPage from './components/pages/UserPage.vue'
</script>

<style>
@import './assets/global.css';
</style>
