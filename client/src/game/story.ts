export type StoryMission = {
  id: number;
  title: string;
  description: string;
  image: string;
};

export type StoryProgress = {
  activeChapter: number | null;
  unlockedChapter: number;
  completed: boolean[];
  purchased: boolean[];
};

export const STORY_STORAGE_KEY = "luli-story";
export const STORY_PAGE_PRICES = [5, 5, 5, 6, 7, 7, 8, 8, 15];

export const STORY_MISSIONS: StoryMission[] = [
  { id: 1, title: "Dois cocos juntos", description: "Tenha 2 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP1.png" },
  { id: 2, title: "Três cocos juntos", description: "Tenha 3 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP2.png" },
  { id: 3, title: "Grande pontuação", description: "Faça 80.000 pontos em uma única partida.", image: "HQCAP3.png" },
  { id: 4, title: "Fruteira estilosa", description: "Jogue uma partida com uma skin equipada em todas as frutas e faça pelo menos 1.500 pontos.", image: "HQCAP4.png" },
  { id: 5, title: "Álbum completo", description: "Conquiste todos os stickers disponíveis no álbum.", image: "HQCAP5.png" },
  { id: 6, title: "Mais cocos", description: "Tenha 2 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP6.png" },
  { id: 7, title: "Cocos por toda parte", description: "Tenha 3 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP7.png" },
  { id: 8, title: "Laranjada", description: "Tenha 5 laranjas simultaneamente no mesmo tabuleiro.", image: "HQCAP8.png" },
  { id: 9, title: "Mestre da fruteira", description: "Faça 100.000 pontos em uma única partida.", image: "HQCAP9.png" },
];

export const EMPTY_STORY: StoryProgress = { activeChapter: null, unlockedChapter: 1, completed: [], purchased: [] };

export function readStoryProgress(): StoryProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(STORY_STORAGE_KEY) || "null") as Partial<StoryProgress> | null;
    const completed = Array.from({ length: STORY_MISSIONS.length }, (_, index) => Boolean(saved?.completed?.[index]));
    const purchased = Array.from({ length: STORY_MISSIONS.length }, (_, index) => Boolean(saved?.purchased?.[index]));
    const completedCount = completed.findIndex((done) => !done);
    const nextUnlocked = completedCount === -1 ? STORY_MISSIONS.length : completedCount + 1;
    const savedUnlocked = Number(saved?.unlockedChapter || nextUnlocked);
    const unlockedChapter = Math.max(1, Math.min(STORY_MISSIONS.length, Math.max(nextUnlocked, savedUnlocked)));
    const activeChapter = Number(saved?.activeChapter) || null;
    return { activeChapter: activeChapter && activeChapter <= unlockedChapter && !completed[activeChapter - 1] ? activeChapter : null, unlockedChapter, completed, purchased };
  } catch {
    return { ...EMPTY_STORY, completed: [], purchased: [] };
  }
}

export function saveStoryProgress(progress: StoryProgress) {
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(progress));
}

export function activateStoryMission(progress: StoryProgress, chapter: number): StoryProgress {
  if (chapter !== progress.unlockedChapter || progress.completed[chapter - 1]) return progress;
  const next = { ...progress, activeChapter: chapter };
  saveStoryProgress(next);
  return next;
}

export function completeStoryMission(progress: StoryProgress, chapter: number): StoryProgress {
  if (chapter !== progress.activeChapter || progress.completed[chapter - 1]) return progress;
  const completed = [...progress.completed];
  completed[chapter - 1] = true;
  const unlockedChapter = Math.min(STORY_MISSIONS.length, chapter + 1);
  const next = { ...progress, activeChapter: null, unlockedChapter, completed };
  saveStoryProgress(next);
  return next;
}

export function purchaseStoryPage(progress: StoryProgress, chapter: number): StoryProgress {
  if (chapter < 1 || chapter > STORY_MISSIONS.length || progress.completed[chapter - 1] || progress.purchased[chapter - 1]) return progress;
  const purchased = [...progress.purchased];
  purchased[chapter - 1] = true;
  const completed = [...progress.completed];
  completed[chapter - 1] = true;
  const unlockedChapter = Math.max(progress.unlockedChapter, Math.min(STORY_MISSIONS.length, chapter + 1));
  const next = { ...progress, activeChapter: null, unlockedChapter, completed, purchased };
  saveStoryProgress(next);
  return next;
}
