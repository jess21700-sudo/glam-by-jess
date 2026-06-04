import { useState } from "react";

// ── Palette ──────────────────────────────────────────────
const C = {
  bg: "#FDF5F0", card: "#FFFFFF", primary: "#C97B8A", primaryDark: "#A85F6E",
  primaryLight: "#F7E0E5", nude: "#E8C9B0", nudeDark: "#C4956A", nudeLight: "#FAF0E8",
  text: "#3A2A2E", textMid: "#8A6A70", textLight: "#BFA8AC",
  warn: "#F5E6C8", warnText: "#8A6A30", green: "#A8C9A0", greenText: "#3A6A38",
  greenBg: "#EEF7EE", border: "#F0DDE3",
};
const shadow = "0 2px 14px rgba(180,100,120,0.08)";
const fullBtn = { background: C.primary, color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, cursor: "pointer", width: "100%", fontFamily: "Georgia", marginTop: 8 };

// ── Grille tarifaire ongles ───────────────────────────────
const PRESTATIONS = [
  { id: "semi", label: "Vernis semi-permanent", prix: { unique: 35 } },
  { id: "depose", label: "Dépose (sans repose)", prix: { unique: 20 } },
  { id: "couleur", label: "Couleur / French / Babyboomer", prix: { unique: 5 } },
  { id: "renforcement", label: "Renforcement (ongles naturels)", prix: { S: 45, M: 50, L: 55 } },
  { id: "rallongement", label: "Rallongement", prix: { S: 50, M: 55, L: 60 } },
  { id: "remplissage", label: "Remplissage", prix: { S: 40, M: 45, L: 50 } },
];
const SERVICES_CILS = ["Volume russe", "Cils à cils", "Mega volume", "Retouche", "Dépose cils", "Lifting cils", "Teinture cils"];

const hasTaille = (id) => ["renforcement", "rallongement", "remplissage"].includes(id);

const getPrix = (prestId, taille) => {
  const p = PRESTATIONS.find(p => p.id === prestId);
  if (!p) return 0;
  if (p.prix.un
