// 알라딘 도서 카테고리 정보
export interface Category {
  id: number;
  name: string;
  subCategories?: Category[];
}

// 알라딘 도서 카테고리 목록 (주요 카테고리만 포함)
export const bookCategories: Category[] = [
  {
    id: 0,
    name: "전체",
  },
  {
    id: 1,
    name: "국내도서",
    subCategories: [
      { id: 1230, name: "소설" },
      { id: 170, name: "시/에세이" },
      { id: 987, name: "예술/대중문화" },
      { id: 2551, name: "사회과학" },
      { id: 798, name: "역사와 문화" },
      { id: 656, name: "잡지" },
      { id: 2923, name: "만화" },
      { id: 1, name: "어린이" },
      { id: 55890, name: "청소년" },
      { id: 1196, name: "초등학습서" },
      { id: 1322, name: "중고등학습서" },
      { id: 1237, name: "기술/공학" },
      { id: 8257, name: "컴퓨터/IT" },
      { id: 2105, name: "자기계발" },
      { id: 2030, name: "취미/실용/스포츠" },
      { id: 1317, name: "여행" }
    ]
  },
  {
    id: 2,
    name: "외국도서",
    subCategories: [
      { id: 2721, name: "문학" },
      { id: 90764, name: "교양" },
      { id: 2722, name: "예술/디자인" },
      { id: 2735, name: "언어/사전" },
      { id: 2730, name: "인문/사회" },
      { id: 29276, name: "경제/경영" },
      { id: 2732, name: "과학/기술" },
      { id: 2753, name: "컴퓨터" },
      { id: 2733, name: "청소년" },
      { id: 2734, name: "어린이" }
    ]
  },
  {
    id: 3,
    name: "eBook",
    subCategories: [
      { id: 4395, name: "소설" },
      { id: 4336, name: "시/에세이" },
      { id: 4337, name: "경제/경영" },
      { id: 56388, name: "자기계발" },
      { id: 4338, name: "인문" },
      { id: 56389, name: "사회과학" },
      { id: 6795, name: "여행" },
      { id: 4398, name: "종교" },
      { id: 50245, name: "만화" },
      { id: 4399, name: "어린이/청소년" }
    ]
  },
  {
    id: 5,
    name: "중고도서",
    subCategories: [
      { id: 112011, name: "소설/시/희곡" },
      { id: 112013, name: "사회과학" },
      { id: 112014, name: "역사" },
      { id: 112022, name: "예술/대중문화" },
      { id: 112017, name: "자기계발" },
      { id: 112025, name: "만화" },
      { id: 112027, name: "유아" },
      { id: 112029, name: "아동" },
      { id: 117216, name: "청소년" }
    ]
  }
]; 