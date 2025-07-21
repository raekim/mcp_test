<template>
  <div class="character-selection">
    <h1 class="title" :class="{ 'title-hidden': selectedCharacter }">캐릭터를 선택해 주세요</h1>

    <div class="main-content">
      <!-- Character Selection Area -->
      <div class="avatars-container" :class="{ 'avatars-selected': selectedCharacter }">
        <div
            v-for="avatar in avatars"
            :key="avatar.id"
            class="avatar-wrapper"
            :class="{
            'avatar-selected': selectedCharacter?.id === avatar.id,
            'avatar-hidden': selectedCharacter && selectedCharacter.id !== avatar.id
          }"
            @click="selectAvatar(avatar)"
        >
          <img
              :src="avatar.image"
              :alt="avatar.name"
              :class="`avatar-image avatar-${avatar.id}`"
          />
          <p class="avatar-name">{{ avatar.name }}</p>
        </div>
      </div>

      <!-- Books Display Area -->
      <div class="books-panel" :class="{ 'books-panel-visible': selectedCharacter }">
        <div class="books-header">
          <h2>{{ selectedCharacter?.name }} 추천 베스트셀러</h2>
          <button class="back-button" @click="goBack">← 캐릭터 선택으로 돌아가기</button>
        </div>
        <div class="books-list">
          <div v-for="book in currentBooks" :key="book.id" class="book-item">
            <div class="book-cover"><img :src="book.img" width="100%"></div>
            <div class="book-info">
              <h3>{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
              <p class="book-price">{{ book.price }}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {MCPConnector} from "@/views/MCPConnector.ts";

interface Avatar {
  id: number;
  name: string;
  image: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  price: string;
  img: string;
}

// Define your avatars here - replace with your actual image paths
const avatars: Avatar[] = [
  {
    id: 1,
    name: "개발자",
    image: "/images/avatar_dev.png"
  },
  {
    id: 2,
    name: "기획자",
    image: "/images/avatar_designer.png"
  },
  {
    id: 3,
    name: "디자이너",
    image: "/images/avatar_artist.png"
  }
];

const selectedCharacter = ref<Avatar | null>(null);
const connector = new MCPConnector('', '');

const currentBooks = ref<Book[]>([]);

watch(selectedCharacter, async (newChar) => {
  if (!newChar) {
    currentBooks.value = [];
    return;
  }
  const books = await connector.getBooksByAvatar(newChar.name);
  console.log(books);
  currentBooks.value = books;
}, { immediate: true });

const selectAvatar = (avatar: Avatar): void => {
  selectedCharacter.value = avatar;
};

const goBack = (): void => {
  selectedCharacter.value = null;
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.character-selection {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
  overflow-x: hidden;
}

.title {
  color: white;
  font-size: 2.5rem;
  text-align: center;
  padding: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

.title-hidden {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

.main-content {
  display: flex;
  flex: 1;
  position: relative;
}

.avatars-container {
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  padding: 2rem;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatars-selected {
  width: 300px;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  justify-content: flex-start;
  padding-top: 2rem;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  padding: 1rem;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  opacity: 1;
  transform: scale(1);
  transform-origin: center;
}

.avatar-wrapper:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.avatar-selected {
  transform: scale(0.85) !important;
  margin-bottom: 1rem;
  opacity: 1;
}

.avatar-selected:hover {
  transform: scale(0.9) !important;
}

.avatar-hidden {
  opacity: 0;
  transform: scale(0.8) translateX(-20px);
  pointer-events: none;
}

.avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.avatars-selected .avatar-image {
  width: 100px;
  height: 100px;
}

.avatar-wrapper:hover .avatar-image {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.avatar-name {
  margin-top: 1rem;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: font-size 0.3s ease;
}

.avatars-selected .avatar-name {
  font-size: 1rem;
  margin-top: 0.5rem;
}

.books-panel {
  flex: 1;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 2rem;
  transform: translateX(100%);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.books-panel-visible {
  transform: translateX(0);
}

.books-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333;
}

.books-header h2 {
  font-size: 1.8rem;
  color: #fff;
}

.back-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.back-button:hover {
  background: #5a67d8;
}

.books-list {
  display: grid;
  gap: 1.5rem;
}

.book-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.book-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.book-cover {
  font-size: 2.5rem;
  margin-right: 1.5rem;
  width: 60px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 8px;
}

.book-info {
  flex: 1;
}

.book-info h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.book-author {
  color: #bbb;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.book-price {
  color: #4ecdc4;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .avatars-container {
    flex-direction: column;
    gap: 2rem;
  }

  .avatars-selected {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .avatar-image {
    width: 120px;
    height: 120px;
  }

  .avatars-selected .avatar-image {
    width: 80px;
    height: 80px;
  }

  .books-panel {
    transform: translateY(100%);
  }

  .books-panel-visible {
    transform: translateY(0);
  }

  .books-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
