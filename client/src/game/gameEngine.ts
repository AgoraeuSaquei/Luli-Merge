// Direcção visual: Picnic Pop — o motor expõe eventos simples para a camada React desenhar uma mesa de jogo táctil.
import Matter from "matter-js";
import { FRUITS, FruitDefinition, getFruit, pickNextFruit } from "./fruits";
import { GAME_CONFIG } from "./config";

export type AbilityKind = "prism-orb" | "fruit-bomb";
export type GameEventId = "free-points" | "repeat-ten" | "spring";
export type GameEventStatus = "inactive" | "active" | "completed";
export type GameEventSnapshot = {
  id: GameEventId;
  status: GameEventStatus;
  remainingMs: number;
  announcement: string | null;
  repeatRemaining: number;
  repeatFruitLevel: number | null;
  springFlowers: number;
};
export type GameSnapshot = {
  score: number;
  best: number;
  combo: number;
  next: FruitDefinition;
  upcoming: FruitDefinition;
  over: boolean;
  paused: boolean;
  dangerMs: number;
  abilityOffer: boolean;
  activeAbility: AbilityKind | null;
  event: GameEventSnapshot;
};
export type Particle = { x: number; y: number; color: string; life: number; size: number; vx: number; vy: number };

type FruitBody = Matter.Body & { fruitLevel?: number; fruitId?: string; merged?: boolean; isFlower?: boolean; flowerTurns?: number };

export class FruitGame {
  readonly engine = Matter.Engine.create({ enableSleeping: true });
  readonly world = this.engine.world;
  readonly particles: Particle[] = [];
  private bodies: FruitBody[] = [];
  private walls: Matter.Body[] = [];
  private width = 360;
  private height = 560;
  private dangerTimer = 0;
  private lastMerge = 0;
  private comboValue = 0;
  private scoreValue = 0;
  private nextFruit = pickNextFruit(GAME_CONFIG.spawn.firstMaxLevel);
  private upcomingFruit = pickNextFruit(GAME_CONFIG.spawn.firstMaxLevel);
  private listeners = new Set<(snapshot: GameSnapshot) => void>();
  private onMergeListeners = new Set<(x: number, y: number, level: number, combo: number, score: number) => void>();
  private onAbilityListeners = new Set<(x: number, y: number, text: string) => void>();
  private audioEnabled = true;
  private effectsVolume = 0.7;
  private gameOverValue = false;
  private pausedValue = false;
  private lastDropAt = 0;
  private abilityOfferValue = false;
  private activeAbilityValue: AbilityKind | null = null;
  private luckyChanceUsed = false;
  private testFusionBonus = false;
  private eventId: GameEventId = "free-points";
  private eventStatus: GameEventStatus = "inactive";
  private eventTriggerScore = 0;
  private eventEndsAt = 0;
  private eventAnnouncement: string | null = null;
  private eventAnnouncementEndsAt = 0;
  private repeatRemaining = 0;
  private repeatFruitLevel: number | null = null;
  private springSecondWaveSpawned = false;
  private springTargetScore = 0;

  constructor() {
    this.engine.gravity.y = GAME_CONFIG.physics.gravity;
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA as FruitBody;
        const b = pair.bodyB as FruitBody;
        if (this.tryFlowerCollision(a, b)) continue;
        this.tryMerge(a, b);
      }
    });
  }

  resize(width: number, height: number) {
    this.width = width; this.height = height;
    if (this.walls.length) Matter.Composite.remove(this.world, this.walls);
    const wall = (x: number, y: number, w: number, h: number) => Matter.Bodies.rectangle(x, y, w, h, { isStatic: true, label: "wall", restitution: 0.15, friction: 0.6 });
    this.walls = [wall(width / 2, height + 18, width + 80, 36), wall(-18, height / 2, 36, height + 80), wall(width + 18, height / 2, 36, height + 80)];
    Matter.Composite.add(this.world, this.walls);
  }

  reset() {
    Matter.Composite.clear(this.world, false, true); this.bodies = []; this.walls = [];
    this.resize(this.width, this.height); this.scoreValue = 0; this.comboValue = 0; this.dangerTimer = 0; this.gameOverValue = false; this.pausedValue = false; this.lastDropAt = 0; this.abilityOfferValue = false; this.activeAbilityValue = null; this.luckyChanceUsed = false; this.particles.length = 0; this.nextFruit = pickNextFruit(); this.upcomingFruit = pickNextFruit();
    this.eventId = this.chooseEvent();
    const minScore = this.eventId === "free-points" ? GAME_CONFIG.events.freePointsMinScore : this.eventId === "repeat-ten" ? GAME_CONFIG.events.repeatTenMinScore : GAME_CONFIG.events.springMinScore;
    const maxScore = this.eventId === "free-points" ? GAME_CONFIG.events.freePointsMaxScore : this.eventId === "repeat-ten" ? GAME_CONFIG.events.repeatTenMaxScore : GAME_CONFIG.events.springMaxScore;
    this.eventStatus = "inactive"; this.eventTriggerScore = minScore + Math.random() * (maxScore - minScore); this.eventEndsAt = 0; this.eventAnnouncement = null; this.eventAnnouncementEndsAt = 0; this.repeatRemaining = 0; this.repeatFruitLevel = null; this.springSecondWaveSpawned = false; this.springTargetScore = 0;
    this.emit();
  }

  setAudio(enabled: boolean) { this.audioEnabled = enabled; }
  setTestFusionBonus(enabled: boolean) { this.testFusionBonus = enabled; }
  setEffectsVolume(volume: number) { this.effectsVolume = Math.max(0, Math.min(1, volume)); }
  subscribe(listener: (snapshot: GameSnapshot) => void) { this.listeners.add(listener); listener(this.snapshot()); return () => this.listeners.delete(listener); }
  onMerge(listener: (x: number, y: number, level: number, combo: number, score: number) => void) { this.onMergeListeners.add(listener); return () => this.onMergeListeners.delete(listener); }
  onAbility(listener: (x: number, y: number, text: string) => void) { this.onAbilityListeners.add(listener); return () => this.onAbilityListeners.delete(listener); }
  togglePause() { if (!this.gameOverValue && !this.abilityOfferValue) { this.pausedValue = !this.pausedValue; this.emit(); } }
  private snapshot(): GameSnapshot {
    const remainingMs = this.eventId === "free-points" && this.eventStatus === "active" ? Math.max(0, this.eventEndsAt - performance.now()) : 0;
    return { score: this.scoreValue, best: Number(localStorage.getItem("luli-best") || 0), combo: this.comboValue, next: { ...this.nextFruit, upcoming: this.upcomingFruit }, upcoming: this.upcomingFruit, over: this.gameOverValue, paused: this.pausedValue, dangerMs: this.dangerTimer, abilityOffer: this.abilityOfferValue, activeAbility: this.activeAbilityValue, event: { id: this.eventId, status: this.eventStatus, remainingMs, announcement: this.eventAnnouncement, repeatRemaining: this.repeatRemaining, repeatFruitLevel: this.repeatFruitLevel, springFlowers: this.bodies.filter((body) => body.isFlower).length } };
  }

  private chooseEvent(): GameEventId {
    const last = localStorage.getItem("luli-last-event") as GameEventId | null;
    const all: GameEventId[] = ["free-points", "repeat-ten", "spring"];
    const available = all.filter((event) => event !== last);
    const selected = available[Math.floor(Math.random() * available.length)] || "free-points";
    localStorage.setItem("luli-last-event", selected);
    return selected;
  }
  private emit() { const snapshot = this.snapshot(); this.listeners.forEach(listener => listener(snapshot)); }

  private maybeStartEvent() {
    if (this.eventStatus !== "inactive" || this.scoreValue < this.eventTriggerScore) return;
    this.eventStatus = "active";
    this.eventAnnouncement = this.eventId === "free-points" ? "TÁ DE GRAÇA!" : this.eventId === "repeat-ten" ? "COMPRE 1, LEVE 10!" : "AAH! PRIMAVERA!";
    this.eventAnnouncementEndsAt = performance.now() + GAME_CONFIG.events.announcementDurationMs;
    if (this.eventId === "free-points") {
      this.eventEndsAt = performance.now() + GAME_CONFIG.events.freePointsDurationMs;
    } else if (this.eventId === "repeat-ten") {
      this.repeatFruitLevel = this.nextFruit.level;
      this.repeatRemaining = GAME_CONFIG.events.repeatTenCount;
    } else {
      this.springTargetScore = this.scoreValue + GAME_CONFIG.events.springSecondWaveScore;
      this.addSpringFlowers(GAME_CONFIG.events.springInitialFlowers);
    }
    this.addEventParticles();
  }

  private addSpringFlowers(count: number) {
    for (let i = 0; i < count; i++) {
      const flower = Matter.Bodies.circle(28 + Math.random() * Math.max(20, this.width - 56), 28 + Math.random() * 18, GAME_CONFIG.events.springFlowerRadius, { restitution: 0.28, friction: 0.5, frictionAir: 0.018, density: 0.7, label: "flower" }) as FruitBody;
      flower.isFlower = true;
      flower.flowerTurns = 0;
      Matter.Body.setVelocity(flower, { x: (Math.random() - 0.5) * 2, y: 1 + Math.random() * 2 });
      this.bodies.push(flower);
      Matter.Composite.add(this.world, flower);
    }
  }
  private transformFlower(flower: FruitBody, level?: number) {
    if (!flower.isFlower) return;
    const chosen = getFruit(level || pickNextFruit(4).level);
    const position = { x: flower.position.x, y: flower.position.y };
    const velocity = { x: flower.velocity.x, y: flower.velocity.y - 1.2 };
    Matter.Composite.remove(this.world, flower);
    this.bodies = this.bodies.filter((body) => body !== flower);
    const fruit = Matter.Bodies.circle(position.x, position.y, chosen.radius, { restitution: GAME_CONFIG.physics.restitution, friction: GAME_CONFIG.physics.friction, frictionAir: GAME_CONFIG.physics.airFriction, density: chosen.mass / 100, label: "fruit" }) as FruitBody;
    fruit.fruitLevel = chosen.level;
    fruit.fruitId = chosen.id;
    Matter.Body.setVelocity(fruit, velocity);
    Matter.Composite.add(this.world, fruit);
    this.bodies.push(fruit);
    if (this.eventId === "spring" && this.eventStatus === "active" && this.springSecondWaveSpawned && this.bodies.every((body) => !body.isFlower)) {
      this.eventStatus = "completed";
      this.eventAnnouncement = "AAH! PRIMAVERA ENCERRADA!";
      this.eventAnnouncementEndsAt = performance.now() + GAME_CONFIG.events.announcementDurationMs;
    }
  }
  private tryFlowerCollision(a: FruitBody, b: FruitBody) {
    const flower = a.isFlower ? a : b.isFlower ? b : null;
    const fruit = a.isFlower ? b : b.isFlower ? a : null;
    if (!flower || !fruit || fruit.isFlower || fruit.label !== "fruit") return false;
    this.transformFlower(flower, fruit.fruitLevel);
    return true;
  }
  private advanceSpringFlowers() {
    if (this.eventId !== "spring" || this.eventStatus !== "active") return;
    this.bodies.filter((body) => body.isFlower).forEach((flower) => {
      flower.flowerTurns = (flower.flowerTurns || 0) + 1;
      if ((flower.flowerTurns || 0) >= GAME_CONFIG.events.springTurnsToTransform) this.transformFlower(flower);
    });
  }
  private scoreWithEvent(amount: number) {
    return this.eventStatus === "active" && this.eventId === "free-points" ? amount * GAME_CONFIG.events.scoreMultiplier : amount;
  }

  private addEventParticles() {
    for (let i = 0; i < 34; i++) this.particles.push({ x: this.width / 2, y: 90, color: i % 2 ? "#F7D96D" : "#FFF08B", life: 1.4, size: 3 + Math.random() * 6, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.8) * 5 });
  }

  drop(x: number) {
    if (this.gameOverValue || this.pausedValue || this.abilityOfferValue || this.activeAbilityValue) return;
    const now = performance.now();
    const cooldownMs = 700;
    if (now - this.lastDropAt < cooldownMs) return;
    this.lastDropAt = now;
    const fruit = this.nextFruit; const body = Matter.Bodies.circle(Math.max(fruit.radius + 4, Math.min(this.width - fruit.radius - 4, x)), 42, fruit.radius, { restitution: GAME_CONFIG.physics.restitution, friction: GAME_CONFIG.physics.friction, frictionAir: GAME_CONFIG.physics.airFriction, density: fruit.mass / 100, label: "fruit" }) as FruitBody;
    body.fruitLevel = fruit.level; body.fruitId = fruit.id; Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);
    this.bodies.push(body); Matter.Composite.add(this.world, body);
    const normalNext = this.upcomingFruit;
    this.nextFruit = normalNext;
    this.upcomingFruit = pickNextFruit(Math.min(GAME_CONFIG.spawn.maxLevel, GAME_CONFIG.spawn.firstMaxLevel - 1 + Math.floor(this.scoreValue / GAME_CONFIG.spawn.maxLevelIncreaseScore)));
    if (this.eventStatus === "active" && this.eventId === "repeat-ten" && this.repeatRemaining > 0 && this.repeatFruitLevel !== null) {
      this.repeatRemaining -= 1;
      if (this.repeatRemaining > 0) this.nextFruit = getFruit(this.repeatFruitLevel);
      else {
        this.eventStatus = "completed";
        this.eventAnnouncement = "COMPRE 1, LEVE 10 ENCERRADO!";
        this.eventAnnouncementEndsAt = performance.now() + GAME_CONFIG.events.announcementDurationMs;
        this.scoreValue += GAME_CONFIG.events.repeatTenBonusScore;
      }
    }
    if (!this.luckyChanceUsed && this.scoreValue >= 50000 && Math.random() < 0.05) { this.luckyChanceUsed = true; this.abilityOfferValue = true; this.pausedValue = true; }
    this.advanceSpringFlowers();
    this.emit();
  }

  chooseAbility(kind: AbilityKind) {
    if (!this.abilityOfferValue || this.gameOverValue) return;
    this.abilityOfferValue = false; this.activeAbilityValue = kind; this.pausedValue = false; this.emit();
  }

  cancelAbility() { this.activeAbilityValue = null; this.emit(); }

  useAbilityAt(x: number, y: number): boolean {
    if (!this.activeAbilityValue || this.gameOverValue || this.abilityOfferValue) return false;
    const target = [...this.bodies].reverse().find((body) => {
      if (body.fruitLevel === undefined) return false;
      const fruit = getFruit(body.fruitLevel || 1);
      return Math.hypot(body.position.x - x, body.position.y - y) <= fruit.radius;
    });
    if (!target || target.fruitLevel === undefined) return false;
    const level = target.fruitLevel;
    const sameType = this.bodies.filter((body) => body.fruitLevel === level);
    const canUpgrade = level < FRUITS.length;
    const ability = this.activeAbilityValue;
    if (ability === "prism-orb" && !canUpgrade) return false;
    const centerX = target.position.x;
    const centerY = target.position.y;
    if (ability === "prism-orb") {
      const upgraded = getFruit(level + 1);
      sameType.forEach((body) => {
        Matter.Composite.remove(this.world, body);
        this.bodies = this.bodies.filter((item) => item !== body);
        const nextBody = Matter.Bodies.circle(body.position.x, body.position.y, upgraded.radius, { restitution: GAME_CONFIG.physics.restitution, friction: GAME_CONFIG.physics.friction, frictionAir: GAME_CONFIG.physics.airFriction, density: upgraded.mass / 100, label: "fruit" }) as FruitBody;
        nextBody.fruitLevel = level + 1; nextBody.fruitId = upgraded.id; Matter.Composite.add(this.world, nextBody); this.bodies.push(nextBody);
        this.scoreValue += this.scoreWithEvent(1000);
        this.addAbilityParticles(body.position.x, body.position.y, upgraded.color, upgraded.accent);
      });
      this.onAbilityListeners.forEach((listener) => listener(centerX, centerY, `ORBE: +${sameType.length * 1000}`));
    } else {
      sameType.forEach((body) => {
        Matter.Composite.remove(this.world, body);
        this.bodies = this.bodies.filter((item) => item !== body);
        this.scoreValue += this.scoreWithEvent(250);
        this.addAbilityParticles(body.position.x, body.position.y, getFruit(level).color, getFruit(level).accent);
      });
      this.onAbilityListeners.forEach((listener) => listener(centerX, centerY, `BOMBA: +${sameType.length * 250}`));
    }
    this.activeAbilityValue = null;
    this.emit();
    if (this.audioEnabled) this.beep(level);
    return true;
  }

  update(delta = 1000 / 60) {
    if (this.pausedValue || this.gameOverValue) return;
    Matter.Engine.update(this.engine, delta);
    const now = performance.now();
    if (this.eventStatus === "inactive") this.maybeStartEvent();
    if (this.eventStatus === "active" && this.eventId === "spring" && !this.springSecondWaveSpawned && this.scoreValue >= this.springTargetScore) {
      this.springSecondWaveSpawned = true;
      this.addSpringFlowers(GAME_CONFIG.events.springSecondWaveFlowers);
      this.eventAnnouncement = "MAIS FLORES CHEGARAM!";
      this.eventAnnouncementEndsAt = now + GAME_CONFIG.events.announcementDurationMs;
    }
    if (this.eventStatus === "active" && this.eventId === "free-points" && now >= this.eventEndsAt) {
      this.eventStatus = "completed";
      this.eventEndsAt = 0;
      this.eventAnnouncement = "TÁ DE GRAÇA ENCERRADO!";
      this.eventAnnouncementEndsAt = now + GAME_CONFIG.events.announcementDurationMs;
    }
    if (this.eventAnnouncement && now >= this.eventAnnouncementEndsAt) this.eventAnnouncement = null;
    const highest = this.bodies.reduce((value, body) => Math.min(value, body.position.y - (getFruit(body.fruitLevel || 1).radius)), this.height);
    const isInDangerZone = this.bodies.length > 0 && highest < GAME_CONFIG.danger.lineY;
    if (isInDangerZone) { if (this.dangerTimer <= 0) this.dangerTimer = GAME_CONFIG.danger.maxTimeMs; this.dangerTimer = Math.max(0, this.dangerTimer - delta); if (this.dangerTimer === 0) { this.gameOverValue = true; const best = Math.max(this.scoreValue, Number(localStorage.getItem("luli-best") || 0)); localStorage.setItem("luli-best", String(best)); this.emit(); } } else this.dangerTimer = 0;
    if (this.comboValue && now - this.lastMerge > GAME_CONFIG.combo.resetAfterMs) { this.comboValue = 0; this.emit(); }
    for (let i = this.particles.length - 1; i >= 0; i--) { const p = this.particles[i]; p.life -= delta / 700; p.x += p.vx; p.y += p.vy; p.vy += 0.08; if (p.life <= 0) this.particles.splice(i, 1); }
  }

  private tryMerge(a: FruitBody, b: FruitBody) {
    if (a.isFlower || b.isFlower || a.label !== "fruit" || b.label !== "fruit" || a.merged || b.merged || a.fruitLevel === undefined || b.fruitLevel === undefined || a.fruitLevel !== b.fruitLevel || a.fruitLevel >= FRUITS.length) return;
    a.merged = true; b.merged = true;
    const x = (a.position.x + b.position.x) / 2; const y = (a.position.y + b.position.y) / 2; const level = a.fruitLevel + 1;
    Matter.Composite.remove(this.world, a); Matter.Composite.remove(this.world, b); this.bodies = this.bodies.filter(body => body !== a && body !== b);
    const fruit = getFruit(level); const merged = Matter.Bodies.circle(x, y, fruit.radius, { restitution: GAME_CONFIG.physics.restitution, friction: GAME_CONFIG.physics.friction, frictionAir: GAME_CONFIG.physics.airFriction, density: fruit.mass / 100, label: "fruit" }) as FruitBody;
    merged.fruitLevel = level; merged.fruitId = fruit.id; Matter.Body.setVelocity(merged, { x: (Math.random() - 0.5) * 1.2, y: -2.4 }); Matter.Composite.add(this.world, merged); this.bodies.push(merged);
    this.comboValue = this.comboValue ? this.comboValue + 1 : 2; this.lastMerge = performance.now(); this.scoreValue += this.scoreWithEvent(this.testFusionBonus ? 100000 : fruit.score * this.comboValue);
    for (let i = 0; i < 14; i++) this.particles.push({ x, y, color: i % 2 ? fruit.color : fruit.accent, life: 1, size: 2 + Math.random() * 4, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.8) * 4 });
    this.onMergeListeners.forEach(listener => listener(x, y, level, this.comboValue, this.scoreValue)); this.maybeStartEvent(); this.emit(); if (this.audioEnabled) this.beep(level);
  }

  private addAbilityParticles(x: number, y: number, color: string, accent: string) { for (let i = 0; i < 18; i++) this.particles.push({ x, y, color: i % 2 ? color : accent, life: 1.2, size: 3 + Math.random() * 5, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 }); }
  private beep(level: number) { try { if (this.effectsVolume <= 0) return; const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = "sine"; osc.frequency.value = GAME_CONFIG.audio.baseFrequency + level * GAME_CONFIG.audio.levelStep; gain.gain.setValueAtTime(0.045 * this.effectsVolume, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + GAME_CONFIG.audio.mergeDuration); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + GAME_CONFIG.audio.mergeDuration); } catch { /* áudio é opcional */ } }
  getBodies() { return this.bodies; }
  getDangerRatio() { return this.dangerTimer > 0 ? 1 - (this.dangerTimer / GAME_CONFIG.danger.maxTimeMs) : 0; }
}
