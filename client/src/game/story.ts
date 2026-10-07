export type StoryMissionKind = "score" | "simultaneous" | "skins" | "stickers" | "combo" | "event";

export type StoryMission = {
  id: number;
  title: string;
  description: string;
  image: string;
  kind?: StoryMissionKind;
  target?: number;
  level?: number;
  eventOnly?: boolean;
};

export type StoryProgress = {
  activeChapter: number | null;
  unlockedChapter: number;
  completed: boolean[];
  purchased: boolean[];
};

export type StoryEventPhase = "none" | "victory" | "prompt" | "no" | "challenge" | "unlocked";

export const STORY_STORAGE_KEY = "luli-story";
export const STORY_EVENT_KEY = "luli-story-final-event";
export const STORY_FINAL_REWARD_KEY = "luli-story-final-reward-39";
export const STORY_EVENT_SCORE_TARGET = 50000;
export const STORY_PAGE_PRICES = [
  5, 5, 5, 6, 7, 8, 15, 15, 15,
  5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 10, 10, 10, 12, 12, 12,
  5, 5, 6, 6, 7, 7, 8, 9, 10, 0, 0, 0,
];

export const STORY_MISSIONS: StoryMission[] = [
  { id: 1, title: "Dois cocos juntos", description: "Tenha 2 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP1.png", kind: "simultaneous", target: 2, level: 10 },
  { id: 2, title: "Três cocos juntos", description: "Tenha 3 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP2.png", kind: "simultaneous", target: 3, level: 10 },
  { id: 3, title: "Grande pontuação", description: "Faça 80.000 pontos em uma única partida.", image: "HQCAP3.png", kind: "score", target: 80000 },
  { id: 4, title: "Fruteira estilosa", description: "Jogue uma partida com uma skin equipada em todas as frutas e faça pelo menos 1.500 pontos.", image: "HQCAP4.png", kind: "skins", target: 1500 },
  { id: 5, title: "Álbum completo", description: "Conquiste todos os stickers disponíveis no álbum.", image: "HQCAP5.png", kind: "stickers" },
  { id: 6, title: "Mais cocos", description: "Tenha 2 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP6.png", kind: "simultaneous", target: 2, level: 10 },
  { id: 7, title: "Cocos por toda parte", description: "Tenha 3 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP7.png", kind: "simultaneous", target: 3, level: 10 },
  { id: 8, title: "Laranjada", description: "Tenha 5 laranjas simultaneamente no mesmo tabuleiro.", image: "HQCAP8.png", kind: "simultaneous", target: 5, level: 5 },
  { id: 9, title: "Mestre da fruteira", description: "Faça 100.000 pontos em uma única partida.", image: "HQCAP9.png", kind: "score", target: 100000 },
  { id: 10, title: "Primeiro passo", description: "Faça 6.000 pontos em uma única partida.", image: "HQCAP10.png", kind: "score", target: 6000 },
  { id: 11, title: "Cocos resistentes", description: "Tenha 2 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP11.png", kind: "simultaneous", target: 2, level: 10 },
  { id: 12, title: "Ritmo crescente", description: "Faça 18.000 pontos em uma única partida.", image: "HQCAP12.png", kind: "score", target: 18000 },
  { id: 13, title: "Combo saboroso", description: "Alcance um combo de pelo menos 5 fusões.", image: "HQCAP13.png", kind: "combo", target: 5 },
  { id: 14, title: "Luli fashion", description: "Faça 30.000 pontos usando uma skin equipada em todas as frutas.", image: "HQCAP14.png", kind: "skins", target: 30000 },
  { id: 15, title: "Ponto a ponto", description: "Faça 36.000 pontos em uma única partida.", image: "HQCAP15.png", kind: "score", target: 36000 },
  { id: 16, title: "Dupla de cocos", description: "Tenha 3 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP16.png", kind: "simultaneous", target: 3, level: 10 },
  { id: 17, title: "Combo de respeito", description: "Alcance um combo de pelo menos 8 fusões.", image: "HQCAP17.png", kind: "combo", target: 8 },
  { id: 18, title: "Meio do caminho", description: "Faça 54.000 pontos em uma única partida.", image: "HQCAP18.png", kind: "score", target: 54000 },
  { id: 19, title: "Coco colossal", description: "Tenha 4 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP19.png", kind: "simultaneous", target: 4, level: 10 },
  { id: 20, title: "Colecionador", description: "Conquiste pelo menos 15 stickers no álbum.", image: "HQCAP20.png", kind: "stickers", target: 15 },
  { id: 21, title: "Grande colheita", description: "Faça 72.000 pontos em uma única partida.", image: "HQCAP21.png", kind: "score", target: 72000 },
  { id: 22, title: "Estilo completo", description: "Faça 78.000 pontos usando uma skin equipada em todas as frutas.", image: "HQCAP22.png", kind: "skins", target: 78000 },
  { id: 23, title: "Laranjas em festa", description: "Tenha 5 laranjas simultaneamente no mesmo tabuleiro.", image: "HQCAP23.png", kind: "simultaneous", target: 5, level: 5 },
  { id: 24, title: "Pontuação avançada", description: "Faça 84.000 pontos em uma única partida.", image: "HQCAP24.png", kind: "score", target: 84000 },
  { id: 25, title: "Combo mestre", description: "Alcance um combo de pelo menos 10 fusões.", image: "HQCAP25.png", kind: "combo", target: 10 },
  { id: 26, title: "Cinco cocos", description: "Tenha 5 cocos simultaneamente no mesmo tabuleiro.", image: "HQCAP26.png", kind: "simultaneous", target: 5, level: 10 },
  { id: 27, title: "O grande final", description: "Faça 105.000 pontos em uma única partida e conclua a História.", image: "HQCAP27.png", kind: "score", target: 105000 },
  { id: 28, title: "Jabuticabas reunidas", description: "Tenha 10 jabuticabas simultaneamente no mesmo tabuleiro.", image: "HQCAP28.png", kind: "simultaneous", target: 10, level: 1 },
  { id: 29, title: "Maçãs em festa", description: "Tenha 5 maçãs simultaneamente no mesmo tabuleiro.", image: "HQCAP29.png", kind: "simultaneous", target: 5, level: 6 },
  { id: 30, title: "Morangos por todo lado", description: "Tenha 8 morangos simultaneamente no mesmo tabuleiro.", image: "HQCAP30.png", kind: "simultaneous", target: 8, level: 3 },
  { id: 31, title: "Ameixas agrupadas", description: "Tenha 5 ameixas simultaneamente no mesmo tabuleiro.", image: "HQCAP31.png", kind: "simultaneous", target: 5, level: 4 },
  { id: 32, title: "Laranjas em dobro", description: "Tenha 4 laranjas simultaneamente no mesmo tabuleiro.", image: "HQCAP32.png", kind: "simultaneous", target: 4, level: 5 },
  { id: 33, title: "Pêssegos reunidos", description: "Tenha 3 pêssegos simultaneamente no mesmo tabuleiro.", image: "HQCAP33.png", kind: "simultaneous", target: 3, level: 7 },
  { id: 34, title: "Melões no tabuleiro", description: "Tenha 3 melões simultaneamente no mesmo tabuleiro.", image: "HQCAP34.png", kind: "simultaneous", target: 3, level: 8 },
  { id: 35, title: "Abacaxis alinhados", description: "Tenha 2 abacaxis simultaneamente no mesmo tabuleiro.", image: "HQCAP35.png", kind: "simultaneous", target: 2, level: 9 },
  { id: 36, title: "Pontuação lendária", description: "Faça 80.000 pontos em uma única partida.", image: "HQCAP36.png", kind: "score", target: 80000 },
  { id: 37, title: "Parabéns, você venceu!", description: "Faça 120.000 pontos em uma única partida para chegar ao grande final.", image: "HQCAP37.png", kind: "score", target: 120000 },
  { id: 38, title: "A surpresa começa", description: "Página especial do evento secreto.", image: "HQCAP38.png", kind: "event", eventOnly: true },
  { id: 39, title: "O segredo final", description: "Página especial do evento secreto.", image: "HQCAP39.png", kind: "event", eventOnly: true },
];

export const EMPTY_STORY: StoryProgress = { activeChapter: null, unlockedChapter: 1, completed: [], purchased: [] };

export function readStoryProgress(): StoryProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(STORY_STORAGE_KEY) || "null") as Partial<StoryProgress> | null;
    const completed = Array.from({ length: STORY_MISSIONS.length }, (_, index) => Boolean(saved?.completed?.[index]));
    const purchased = Array.from({ length: STORY_MISSIONS.length }, (_, index) => Boolean(saved?.purchased?.[index]));
    if (purchased[36]) {
      completed[36] = false;
      purchased[36] = false;
    }
    const completedCount = completed.findIndex((done) => !done);
    const nextUnlocked = completedCount === -1 ? STORY_MISSIONS.length : completedCount + 1;
    const savedUnlocked = Number(saved?.unlockedChapter || nextUnlocked);
    const eventUnlocked = readStoryEventPhase() === "unlocked";
    const unlockedChapter = eventUnlocked ? STORY_MISSIONS.length : Math.max(1, Math.min(37, Math.max(nextUnlocked, savedUnlocked)));
    const activeChapter = Number(saved?.activeChapter) || null;
    return { activeChapter: activeChapter && activeChapter <= unlockedChapter && !completed[activeChapter - 1] ? activeChapter : null, unlockedChapter, completed, purchased };
  } catch { return { ...EMPTY_STORY, completed: [], purchased: [] }; }
}

export function saveStoryProgress(progress: StoryProgress) { localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(progress)); }
export function readStoryEventPhase(): StoryEventPhase { return (localStorage.getItem(STORY_EVENT_KEY) as StoryEventPhase | null) || "none"; }
export function saveStoryEventPhase(phase: StoryEventPhase) { localStorage.setItem(STORY_EVENT_KEY, phase); }
export function activateStoryMission(progress: StoryProgress, chapter: number): StoryProgress { if (chapter !== progress.unlockedChapter || progress.completed[chapter - 1] || chapter > 37) return progress; const next = { ...progress, activeChapter: chapter }; saveStoryProgress(next); return next; }
export function completeStoryMission(progress: StoryProgress, chapter: number): StoryProgress { if (chapter !== progress.activeChapter || progress.completed[chapter - 1]) return progress; const completed = [...progress.completed]; completed[chapter - 1] = true; const unlockedChapter = Math.min(37, chapter + 1); const next = { ...progress, activeChapter: null, unlockedChapter, completed }; saveStoryProgress(next); return next; }
export function unlockStoryEventPages(progress: StoryProgress): StoryProgress { const completed = [...progress.completed]; completed[37] = true; completed[38] = true; const purchased = [...progress.purchased]; purchased[37] = true; purchased[38] = true; const next = { ...progress, activeChapter: null, unlockedChapter: 39, completed, purchased }; saveStoryProgress(next); return next; }
export function purchaseStoryPage(progress: StoryProgress, chapter: number): StoryProgress { if (chapter < 1 || chapter >= 37 || progress.completed[chapter - 1] || progress.purchased[chapter - 1]) return progress; const purchased = [...progress.purchased]; purchased[chapter - 1] = true; const completed = [...progress.completed]; completed[chapter - 1] = true; const unlockedChapter = Math.max(progress.unlockedChapter, Math.min(37, chapter + 1)); const next = { ...progress, activeChapter: null, unlockedChapter, completed, purchased }; saveStoryProgress(next); return next; }
