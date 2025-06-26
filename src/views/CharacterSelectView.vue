<template>
  <div class="character-selection">
    <h1 class="title">캐릭터를 선택해 주세요</h1>

    <div class="avatars-container">
      <div
          v-for="avatar in avatars"
          :key="avatar.id"
          class="avatar-wrapper"
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
  </div>
</template>

<script setup lang="ts">
interface Avatar {
  id: number;
  name: string;
  image: string;
}

// Define your avatars here - replace with your actual image paths
const avatars: Avatar[] = [
  {
    id: 1,
    name: "개발자",
    image: "/images/avatar_dev.png" // Replace with your image path
  },
  {
    id: 2,
    name: "기획자",
    image: "/images/avatar_designer.png" // Replace with your image path
  },
  {
    id: 3,
    name: "디자이너",
    image: "/images/avatar_artist.png" // Replace with your image path
  }
];

const selectAvatar = (avatar: Avatar): void => {
  alert(`You chose ${avatar.name}!`);
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
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

.title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.avatars-container {
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: 1rem;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-wrapper:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
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
}

/* Responsive design */
@media (max-width: 768px) {
  .avatars-container {
    flex-direction: column;
    gap: 2rem;
  }

  .title {
    font-size: 2rem;
  }

  .avatar-image {
    width: 120px;
    height: 120px;
  }
}
</style>
