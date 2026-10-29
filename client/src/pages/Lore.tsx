import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, LockKeyhole, Check } from "lucide-react";
import { LORE_FINAL_IMAGES, LORE_IMAGE_PRICE, LORE_IMAGES_STORAGE_KEY, LORE_OPENING, LORE_SCENES, LORE_SUBTITLE } from "@/game/lore";

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
const readUnlockedImages = (): string[] => { try { return JSON.parse(localStorage.getItem(LORE_IMAGES_STORAGE_KEY) || "[]"); } catch { return []; } };

export function LorePage({ goldenCards, onSpendCards, onClose }: { goldenCards: number; onSpendCards: (amount: number) => void; onClose: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const [unlockedImages, setUnlockedImages] = useState<string[]>(readUnlockedImages);
  const scene = LORE_SCENES[sceneIndex];
  const part = scene.parts[partIndex];
  const isFirst = sceneIndex === 0 && partIndex === 0;
  const isLast = sceneIndex === LORE_SCENES.length - 1 && partIndex === scene.parts.length - 1;
  const moveNext = () => { if (partIndex < scene.parts.length - 1) setPartIndex(partIndex + 1); else if (sceneIndex < LORE_SCENES.length - 1) { setSceneIndex(sceneIndex + 1); setPartIndex(0); } };
  const moveBack = () => { if (partIndex > 0) setPartIndex(partIndex - 1); else if (sceneIndex > 0) { const previous = LORE_SCENES[sceneIndex - 1]; setSceneIndex(sceneIndex - 1); setPartIndex(previous.parts.length - 1); } };
  const unlockImage = (image: string) => { if (unlockedImages.includes(image) || goldenCards < LORE_IMAGE_PRICE) return; const next = [...unlockedImages, image]; setUnlockedImages(next); localStorage.setItem(LORE_IMAGES_STORAGE_KEY, JSON.stringify(next)); onSpendCards(LORE_IMAGE_PRICE); };
  const totalParts = LORE_SCENES.reduce((sum, item) => sum + item.parts.length, 0);
  const currentPartNumber = LORE_SCENES.slice(0, sceneIndex).reduce((sum, item) => sum + item.parts.length, 0) + partIndex + 1;
  return <section className="lore-page">
    <button className="back-link" onClick={onClose}><ChevronLeft size={17} /> Voltar</button>
    <header className="lore-heading"><div><p className="eyebrow">UMA LORE ESCONDIDA</p><h2>Eu sou <em>Alma</em>,<br />Você é Sangy</h2><p>{LORE_SUBTITLE} · 119 anos atrás, antes dos acontecimentos de Luli Merge.</p></div><div className="lore-badge"><BookOpen size={18} /><strong>{currentPartNumber}/{totalParts}</strong><span>LEITURA</span></div></header>
    {isFirst && <div className="lore-opening"><strong>O CONTO</strong><p>{LORE_OPENING}</p></div>}
    <img className="lore-scene-image" src={asset(scene.image)} alt={scene.alt || `Ilustração da ${scene.name}`} />
    <article className="lore-reader"><div className="lore-reader-top"><span>{scene.name}</span><small>{sceneIndex + 1}/{LORE_SCENES.length}</small></div><h3>{part.title}</h3><div className="lore-body">{part.text.split(/\n\n+/).filter(Boolean).map((paragraph, index) => <p key={`${sceneIndex}-${partIndex}-${index}`}>{paragraph}</p>)}</div><div className="lore-controls"><button className="lore-control" onClick={moveBack} disabled={isFirst}><ChevronLeft size={17} /> Voltar</button><button className="lore-control lore-next" onClick={moveNext} disabled={isLast}>{isLast ? "Fim da Lore" : "Continuar"} {!isLast && <ChevronRight size={17} />}</button></div></article>
    {isLast && <section className="lore-gallery"><div className="lore-gallery-heading"><div><p className="eyebrow">MEMÓRIAS FINAIS</p><h3>O que restou da promessa</h3><p>Desbloqueie as imagens finais uma por uma com Cartas Douradas.</p></div><strong className="lore-currency">🎴 {goldenCards} cartas</strong></div><div className="lore-image-grid">{LORE_FINAL_IMAGES.map((image, index) => { const unlocked = unlockedImages.includes(image); const canBuy = goldenCards >= LORE_IMAGE_PRICE; return <article className={`lore-image-card ${unlocked ? "is-unlocked" : "is-locked"}`} key={image}><div className="lore-image-frame">{unlocked ? <img src={asset(image)} alt={`Memória final ${index + 1}`} /> : <><img src={asset(image)} alt="Imagem bloqueada" /><span><LockKeyhole size={24} /></span></>}</div><strong>MEMÓRIA {index + 1}</strong>{unlocked ? <small><Check size={13} /> DESBLOQUEADA</small> : <button onClick={() => unlockImage(image)} disabled={!canBuy}>DESBLOQUEAR · {LORE_IMAGE_PRICE} CARTAS</button>}</article>; })}</div></section>}
  </section>;
}
