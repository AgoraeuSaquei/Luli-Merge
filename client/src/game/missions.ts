export type MissionKind = "accumulative" | "best-of-match";
export type MissionRewardType = "golden-fragment" | "golden-card";

export type MissionDefinition = {
  id: number;
  title: string;
  subtitle: string;
  target: number;
  reward: string;
  rewardType: MissionRewardType;
  kind: MissionKind;
};

export type MissionProgress = {
  missionId: number;
  progress: number;
  completed: boolean;
};

export type MissionState = {
  activeMissionIds: number[];
  progress: MissionProgress[];
};

export type MissionEvent = {
  level: number;
  combo: number;
  score: number;
};

export const MISSION_DEFINITIONS: MissionDefinition[] = [
  { id: 1, title: "Primeiras Fusões", subtitle: "realizar 10 fusões", target: 10, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "accumulative" },
  { id: 2, title: "Frutífera", subtitle: "realizar 25 fusões", target: 25, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "accumulative" },
  { id: 3, title: "Combo", subtitle: "alcançar Combo x5", target: 5, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "best-of-match" },
  { id: 4, title: "Combo Insano", subtitle: "alcançar Combo x10", target: 10, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "best-of-match" },
  { id: 5, title: "Reação em Cadeia", subtitle: "3 fusões em sequência", target: 3, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "best-of-match" },
  { id: 6, title: "Primeiro Grande Marco", subtitle: "25.000 pontos em uma partida", target: 25000, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "best-of-match" },
  { id: 7, title: "Quase Lá", subtitle: "50.000 pontos em uma partida", target: 50000, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "best-of-match" },
  { id: 8, title: "Frutas Grandes", subtitle: "criar 3 frutas nível 8+", target: 3, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "accumulative" },
  { id: 9, title: "Fruta Rara", subtitle: "criar 1 fruta nível 9", target: 1, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "accumulative" },
  { id: 10, title: "Coco", subtitle: "criar 1 Coco (nível 10)", target: 1, reward: "1 Fragmento de Card Dourado", rewardType: "golden-fragment", kind: "accumulative" },
  { id: 11, title: "Mestre Luli", subtitle: "alcançar 100.000 pontos em uma partida", target: 100000, reward: "1 Card Dourado", rewardType: "golden-card", kind: "best-of-match" },
];

export const MISSION_STORAGE_KEY = "luli-missions";
export const ACTIVE_MISSION_COUNT = 3;

export function createMissionState(): MissionState {
  const shuffled = [...MISSION_DEFINITIONS].sort(() => Math.random() - 0.5);
  const activeMissionIds = shuffled.slice(0, ACTIVE_MISSION_COUNT).map((mission) => mission.id);
  return { activeMissionIds, progress: activeMissionIds.map((missionId) => ({ missionId, progress: 0, completed: false })) };
}

export function readMissionState(): MissionState {
  try {
    const parsed = JSON.parse(localStorage.getItem(MISSION_STORAGE_KEY) || "null") as Partial<MissionState> | null;
    if (!parsed || !Array.isArray(parsed.activeMissionIds) || parsed.activeMissionIds.length !== ACTIVE_MISSION_COUNT) return createMissionState();
    const validIds = parsed.activeMissionIds.filter((id): id is number => MISSION_DEFINITIONS.some((mission) => mission.id === id));
    if (validIds.length !== ACTIVE_MISSION_COUNT) return createMissionState();
    return { activeMissionIds: validIds, progress: validIds.map((missionId) => parsed.progress?.find((item) => item.missionId === missionId) || { missionId, progress: 0, completed: false }) };
  } catch {
    return createMissionState();
  }
}

export function getMission(missionId: number) {
  return MISSION_DEFINITIONS.find((mission) => mission.id === missionId) || MISSION_DEFINITIONS[0];
}

export function applyMissionEvent(state: MissionState, event: MissionEvent) {
  const completed: MissionDefinition[] = [];
  const nextProgress = state.progress.map((entry) => {
    const mission = getMission(entry.missionId);
    if (entry.completed) return entry;
    let increment = 0;
    if (mission.id === 1 || mission.id === 2) increment = 1;
    if (mission.id === 3 || mission.id === 4 || mission.id === 5) increment = event.combo;
    if (mission.id === 6 || mission.id === 7 || mission.id === 11) increment = event.score;
    if (mission.id === 8 && event.level >= 8) increment = 1;
    if (mission.id === 9 && event.level === 9) increment = 1;
    if (mission.id === 10 && event.level === 10) increment = 1;
    const progress = mission.kind === "best-of-match" ? Math.max(entry.progress, increment) : entry.progress + increment;
    const isCompleted = progress >= mission.target;
    if (isCompleted) completed.push(mission);
    return { missionId: entry.missionId, progress: Math.min(progress, mission.target), completed: isCompleted };
  });
  return { state: { ...state, progress: nextProgress }, completed };
}

export function missionRewardLabel(mission: MissionDefinition) {
  return mission.rewardType === "golden-card" ? "+1 Card Dourado" : "+1 Fragmento";
}

export function allMissionsCompleted(state: MissionState) {
  return state.progress.every((entry) => entry.completed);
}

export function createNextMissionState(previous: MissionState) {
  const excluded = new Set(previous.activeMissionIds);
  const candidates = MISSION_DEFINITIONS.filter((mission) => !excluded.has(mission.id));
  const pool = candidates.length >= ACTIVE_MISSION_COUNT ? candidates : MISSION_DEFINITIONS;
  const activeMissionIds = [...pool].sort(() => Math.random() - 0.5).slice(0, ACTIVE_MISSION_COUNT).map((mission) => mission.id);
  return { activeMissionIds, progress: activeMissionIds.map((missionId) => ({ missionId, progress: 0, completed: false })) };
}
