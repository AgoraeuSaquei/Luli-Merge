// CONFIGURAÇÃO RÁPIDA — altere este ficheiro para personalizar o comportamento do jogo.
// Direcção visual: Picnic Pop — os valores de jogo ficam separados da apresentação.

export const GAME_CONFIG = {
  physics: {
    gravity: 1.08,
    restitution: 0.16,
    friction: 0.45,
    airFriction: 0.012,
  },
  danger: {
    lineY: 82,
    maxTimeMs: 15000,
  },
  combo: {
    resetAfterMs: 2800,
  },
  events: {
    freePointsMinScore: 40000,
    freePointsMaxScore: 60000,
    freePointsDurationMs: 60000,
    announcementDurationMs: 3500,
    scoreMultiplier: 2,
    repeatTenMinScore: 70000,
    repeatTenMaxScore: 80000,
    repeatTenCount: 10,
    repeatTenBonusScore: 300,
    springMinScore: 30000,
    springMaxScore: 60000,
    springInitialFlowers: 5,
    springSecondWaveFlowers: 3,
    springTurnsToTransform: 3,
    springSecondWaveScore: 10000,
    springFlowerRadius: 18,
  },
  spawn: {
    firstMaxLevel: 4,
    maxLevelIncreaseScore: 180,
    maxLevel: 5,
  },
  audio: {
    mergeDuration: 0.17,
    baseFrequency: 260,
    levelStep: 42,
  },
  storageKeys: {
    best: "luli-best",
    sound: "luli-sound",
  },
} as const;
