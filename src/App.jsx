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
  if (p.prix.unique !== undefined) return p.prix.unique;
  return taille ? (p.prix[taille] || 0) : 0;
};

// ── Données initiales ─────────────────────────────────────
const initialClients = [
  { id: 1, nom: "Martin", prenom: "Sophie", telephone: "06 12 34 56 78", allergies: "Latex", notes: "Préfère les tons nude", fidelite: 2 },
  { id: 2, nom: "Dupont", prenom: "Camille", telephone: "07 98 76 54 32", allergies: "", notes: "Aime le nail art créatif", fidelite: 8 },
  { id: 3, nom: "Bernard", prenom: "Léa", telephone: "06 55 44 33 22", allergies: "Nickel", notes: "", fidelite: 10 },
];

const initialRdvs = [
  { id: 1, clientId: 1, categorie: "ongles", prestId: "remplissage", taille: "M", date: "2026-06-10", heure: "10:00", statut: "termine", prixBase: 45, nailArt: true, prixNailArt: 8, prixOffre: 0, labelOffre: "", produits: "Gel Luxio nude", remarques: "RAS", pointAdded: true },
  { id: 2, clientId: 2, categorie: "ongles", prestId: "rallongement", taille: "L", date: "2026-06-12", heure: "14:00", statut: "aVenir", prixBase: 60, nailArt: false, prixNailArt: 0, prixOffre: 0, labelOffre: "", produits: "", remarques: "", pointAdded: false },
  { id: 3, clientId: 3, categorie: "ongles", prestId: "semi", taille: "", date: "2026-06-15", heure: "11:00", statut: "aVenir", prixBase: 35, nailArt: false, prixNailArt: 0, prixOffre: 0, labelOffre: "", produits: "", remarques: "", pointAdded: false },
];

const initialOffres = [
  { id: 1, label: "Offre Noël ❄️", remise: 10 },
  { id: 2, label: "Parrainage 🌸", remise: 5 },
];

export default function App() {
  const [page, setPage] = useState("accueil");
  const [clients, setClients] = useState(initialClients);
  const [rdvs, setRdvs] = useState(initialRdvs);
  const [offres, setOffres] = useState(initialOffres);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddRdv, setShowAddRdv] = useState(false);
  const [showAddOffre, setShowAddOffre] = useState(false);
  const [cloturerRdv, setCloturerRdv] = useState(null); // RDV en cours de clôture
  const [search, setSearch] = useState("");
  const [agendaDate, setAgendaDate] = useState("2026-06-10");
  const [toast, setToast] = useState(null);

  // Formulaire nouveau RDV
  const [newRdv, setNewRdv] = useState({ clientId: "", categorie: "ongles", prestId: "", taille: "", date: "", heure: "" });
  // Formulaire clôture
  const [cloture, setCloture] = useState({ nailArt: false, prixNailArt: "", prixOffre: "", offreId: "", produits: "", remarques: "" });
  // Formulaire nouvelle cliente
  const [newClient, setNewClient] = useState({ nom: "", prenom: "", telephone: "", allergies: "", notes: "" });
  // Formulaire nouvelle offre
  const [newOffre, setNewOffre] = useState({ label: "", remise: "" });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const sortedClients = [...clients].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const filteredClients = sortedClients.filter(c =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) || c.telephone.includes(search)
  );

  const rdvsJour = rdvs.filter(r => r.date === agendaDate).sort((a, b) => a.heure.localeCompare(b.heure));
  const rdvsAVenir = rdvs.filter(r => r.statut === "aVenir" && r.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => r => a.date.localeCompare(b.date));
  const totalMois = rdvs.filter(r => r.statut === "termine" && r.date.startsWith("2026-06")).reduce((sum, r) => sum + prixTotal(r), 0);

  function prixTotal(r) {
    return (r.prixBase || 0) + (r.prixNailArt || 0) - (r.prixOffre || 0);
  }

  const clientName = (clientId) => {
    const c = clients.find(c => c.id === clientId);
    return c ? `${c.prenom} ${c.nom}` : "";
  };

  const labelPrestation = (r) => {
    if (r.categorie === "cils") return r.prestId;
    const p = PRESTATIONS.find(p => p.id === r.prestId);
    if (!p) return "";
    return hasTaille(r.prestId) && r.taille ? `${p.label} (${r.taille})` : p.label;
  };

  const historiqueCliente = (clientId) =>
    rdvs.filter(r => r.clientId === clientId && r.statut === "termine").sort((a, b) => b.date.localeCompare(a.date));

  // Ajouter RDV (étape 1)
  const addRdv = () => {
    if (!newRdv.clientId || !newRdv.prestId || !newRdv.date || !newRdv.heure) return showToast("Remplis tous les champs obligatoires !");
    if (hasTaille(newRdv.prestId) && !newRdv.taille) return showToast("Choisis une taille S, M ou L !");
    const prixBase = getPrix(newRdv.prestId, newRdv.taille);
    setRdvs([...rdvs, { ...newRdv, id: Date.now(), clientId: parseInt(newRdv.clientId), prixBase, statut: "aVenir", nailArt: false, prixNailArt: 0, prixOffre: 0, labelOffre: "", produits: "", remarques: "", pointAdded: false }]);
    setNewRdv({ clientId: "", categorie: "ongles", prestId: "", taille: "", date: "", heure: "" });
    setShowAddRdv(false);
    showToast("RDV enregistré 📅");
  };

  // Ouvrir clôture
  const ouvrirCloture = (rdv) => {
    setCloturerRdv(rdv);
    setCloture({ nailArt: rdv.nailArt, prixNailArt: rdv.prixNailArt || "", prixOffre: rdv.prixOffre || "", offreId: rdv.offreId || "", produits: rdv.produits || "", remarques: rdv.remarques || "" });
  };

  // Valider clôture (étape 2)
  const validerCloture = () => {
    const offre = offres.find(o => o.id === parseInt(cloture.offreId));
    const prixOffre = offre ? offre.remise : (parseFloat(cloture.prixOffre) || 0);
    const labelOffre = offre ? offre.label : "";
    const updated = rdvs.map(r => r.id === cloturerRdv.id ? {
      ...r, statut: "termine",
      nailArt: cloture.nailArt,
      prixNailArt: parseFloat(cloture.prixNailArt) || 0,
      prixOffre, labelOffre,
      produits: cloture.produits,
      remarques: cloture.remarques,
      pointAdded: true,
    } : r);
    setRdvs(updated);
    if (!cloturerRdv.pointAdded) {
      setClients(clients.map(c => c.id === cloturerRdv.clientId ? { ...c, fidelite: c.fidelite + 1 } : c));
    }
    setCloturerRdv(null);
    showToast("Prestation clôturée ✅ +1 point fidélité 🌸");
  };

  const deleteRdv = (id) => {
    const rdv = rdvs.find(r => r.id === id);
    setRdvs(rdvs.filter(r => r.id !== id));
    if (rdv.pointAdded) setClients(clients.map(c => c.id === rdv.clientId ? { ...c, fidelite: Math.max(0, c.fidelite - 1) } : c));
    showToast("RDV supprimé");
  };

  const addClient = () => {
    if (!newClient.nom || !newClient.prenom) return showToast("Nom et prénom requis !");
    setClients([...clients, { ...newClient, id: Date.now(), fidelite: 0 }]);
    setNewClient({ nom: "", prenom: "", telephone: "", allergies: "", notes: "" });
    setShowAddClient(false);
    showToast("Cliente ajoutée 🌸");
  };

  const addOffre = () => {
    if (!newOffre.label || !newOffre.remise) return showToast("Remplis le nom et la remise !");
    setOffres([...offres, { id: Date.now(), label: newOffre.label, remise: parseFloat(newOffre.remise) }]);
    setNewOffre({ label: "", remise: "" });
    setShowAddOffre(false);
    showToast("Offre ajoutée 🎉");
  };

  const updateFidelite = (clientId, delta) =>
    setClients(clients.map(c => c.id === clientId ? { ...c, fidelite: Math.max(0, c.fidelite + delta) } : c));

  const nav = [
    { id: "accueil", icon: "🏠", label: "Accueil" },
    { id: "agenda", icon: "📅", label: "Agenda" },
    { id: "clientes", icon: "👤", label: "Clientes" },
    { id: "fidelite", icon: "⭐", label: "Fidélité" },
  ];

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Georgia', serif", background: C.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", paddingBottom: 84 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, padding: "22px 20px 16px", color: "white", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(180,80,100,0.18)" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", opacity: 0.75, marginBottom: 3 }}>Glam by Jess</div>
        <div style={{ fontSize: 21, fontWeight: "bold" }}>
          {page === "accueil" && "✨ Tableau de bord"}
          {page === "agenda" && "📅 Mon Agenda"}
          {page === "clientes" && "👤 Mes Clientes"}
          {page === "fidelite" && "⭐ Fidélité"}
          {page === "fiche" && selectedClient && `${selectedClient.prenom} ${selectedClient.nom}`}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", top: 78, left: "50%", transform: "translateX(-50%)", background: C.primaryDark, color: "white", padding: "10px 22px", borderRadius: 20, fontSize: 13, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ padding: 16 }}>

        {/* ── ACCUEIL ── */}
        {page === "accueil" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <StatCard label="Clientes" value={clients.length} icon="👥" bg={C.primaryLight} />
              <StatCard label="RDV ce mois" value={rdvs.filter(r => r.date.startsWith("2026-06")).length} icon="📆" bg={C.nudeLight} />
              <StatCard label="CA du mois" value={`${totalMois}€`} icon="💰" bg={C.greenBg} />
              <StatCard label="RDV à venir" value={rdvs.filter(r => r.statut === "aVenir").length} icon="🌸" bg={C.warn} />
            </div>

            <SectionTitle>Prochains rendez-vous</SectionTitle>
            {rdvs.filter(r => r.statut === "aVenir").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(r => (
              <MiniRdv key={r.id} rdv={r} nom={clientName(r.clientId)} label={labelPrestation(r)} />
            ))}
            {rdvs.filter(r => r.statut === "aVenir").length === 0 && <Empty>Aucun RDV à venir 🌸</Empty>}

            <SectionTitle style={{ marginTop: 18 }}>Accès rapide</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <QuickBtn icon="➕" label="Nouvelle cliente" onClick={() => { setPage("clientes"); setShowAddClient(true); }} />
              <QuickBtn icon="📅" label="Nouveau RDV" onClick={() => { setPage("agenda"); setShowAddRdv(true); }} />
            </div>
          </div>
        )}

        {/* ── AGENDA ── */}
        {page === "agenda" && (
          <div>
            <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: shadow }}>
              <label style={{ fontSize: 11, color: C.textLight, display: "block", marginBottom: 5, letterSpacing: 1 }}>DATE</label>
              <input type="date" value={agendaDate} onChange={e => setAgendaDate(e.target.value)}
                style={{ width: "100%", border: "none", fontSize: 17, fontFamily: "Georgia", color: C.text, background: "transparent", outline: "none" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.textMid }}>{rdvsJour.length} rendez-vous ce jour</div>
              <Btn onClick={() => setShowAddRdv(true)}>+ Ajouter</Btn>
            </div>

            {rdvsJour.length === 0 && <Empty>Aucun RDV ce jour 🌸</Empty>}
            {rdvsJour.map(r => (
              <div key={r.id} style={{ background: C.card, borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: shadow, borderLeft: `4px solid ${r.statut === "termine" ? C.green : C.primary}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: "bold", fontSize: 15, color: C.text }}>{r.heure} — {clientName(r.clientId)}</div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: r.statut === "termine" ? C.greenBg : C.primaryLight, color: r.statut === "termine" ? C.greenText : C.primaryDark, fontWeight: "bold" }}>
                        {r.statut === "termine" ? "✅ Terminé" : "🕐 À venir"}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{labelPrestation(r)}</div>
                    {r.statut === "termine" && (
                      <div style={{ marginTop: 4 }}>
                        {r.nailArt && <div style={{ fontSize: 12, color: C.nudeDark }}>💅 Nail art +{r.prixNailArt}€</div>}
                        {r.labelOffre && <div style={{ fontSize: 12, color: C.greenText }}>🎁 {r.labelOffre} −{r.prixOffre}€</div>}
                        {r.produits && <div style={{ fontSize: 12, color: C.textLight }}>🧴 {r.produits}</div>}
                        {r.remarques && <div style={{ fontSize: 12, color: C.textLight }}>📝 {r.remarques}</div>}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                    <div style={{ fontWeight: "bold", color: C.primaryDark, fontSize: 16 }}>
                      {r.statut === "termine" ? `${prixTotal(r)}€` : `~${r.prixBase}€`}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                      {r.statut === "aVenir" && (
                        <button onClick={() => ouvrirCloture(r)} style={{ fontSize: 11, color: "white", background: C.green, border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>Clôturer</button>
                      )}
                      <button onClick={() => deleteRdv(r.id)} style={{ fontSize: 11, color: "#E07070", background: "none", border: "none", cursor: "pointer" }}>Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Modal Nouveau RDV */}
            {showAddRdv && (
              <Modal title="Nouveau rendez-vous" onClose={() => setShowAddRdv(false)}>
                <Sel label="Cliente *" value={newRdv.clientId} onChange={v => setNewRdv({ ...newRdv, clientId: v })}>
                  <option value="">-- Choisir --</option>
                  {sortedClients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                </Sel>
                <Sel label="Catégorie *" value={newRdv.categorie} onChange={v => setNewRdv({ ...newRdv, categorie: v, prestId: "", taille: "" })}>
                  <option value="ongles">💅 Ongles</option>
                  <option value="cils">👁️ Cils</option>
                </Sel>
                {newRdv.categorie === "ongles" ? (
                  <Sel label="Prestation *" value={newRdv.prestId} onChange={v => setNewRdv({ ...newRdv, prestId: v, taille: "" })}>
                    <option value="">-- Choisir --</option>
                    {PRESTATIONS.map(p => <option key={p.id} value={p.id}>{p.label}{p.prix.unique !== undefined ? ` — ${p.prix.unique}€` : ""}</option>)}
                  </Sel>
                ) : (
                  <Sel label="Prestation *" value={newRdv.prestId} onChange={v => setNewRdv({ ...newRdv, prestId: v })}>
                    <option value="">-- Choisir --</option>
                    {SERVICES_CILS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Sel>
                )}
                {newRdv.categorie === "ongles" && hasTaille(newRdv.prestId) && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: C.textLight, display: "block", marginBottom: 6, letterSpacing: 1 }}>TAILLE *</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["S", "M", "L"].map(t => {
                        const px = getPrix(newRdv.prestId, t);
                        return (
                          <button key={t} onClick={() => setNewRdv({ ...newRdv, taille: t })}
                            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${newRdv.taille === t ? C.primary : C.border}`, background: newRdv.taille === t ? C.primaryLight : "white", cursor: "pointer", fontFamily: "Georgia", color: C.text }}>
                            <div style={{ fontWeight: "bold" }}>{t}</div>
                            <div style={{ fontSize: 12, color: C.textMid }}>{px}€</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Fld label="Date *" type="date" value={newRdv.date} onChange={v => setNewRdv({ ...newRdv, date: v })} />
                <Fld label="Heure *" type="time" value={newRdv.heure} onChange={v => setNewRdv({ ...newRdv, heure: v })} />
                {newRdv.prestId && (
                  <div style={{ background: C.nudeLight, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.nudeDark }}>
                    💰 Prix estimé : <strong>{getPrix(newRdv.prestId, newRdv.taille)}€</strong> — tu pourras compléter après la prestation
                  </div>
                )}
                <button onClick={addRdv} style={fullBtn}>Enregistrer le RDV</button>
              </Modal>
            )}

            {/* Modal Clôture */}
            {cloturerRdv && (
              <Modal title="Clôturer la prestation" onClose={() => setCloturerRdv(null)}>
                <div style={{ background: C.primaryLight, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.primaryDark }}>
                  🌸 <strong>{clientName(cloturerRdv.clientId)}</strong> — {labelPrestation(cloturerRdv)}<br />
                  Prix de base : <strong>{cloturerRdv.prixBase}€</strong>
                </div>

                {/* Nail art */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: C.textLight, display: "block", marginBottom: 6, letterSpacing: 1 }}>NAIL ART EN SUPPLÉMENT ?</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setCloture({ ...cloture, nailArt: false, prixNailArt: "" })}
                      style={{ flex: 1, padding: 10, borderRadius: 10, border: `2px solid ${!cloture.nailArt ? C.primary : C.border}`, background: !cloture.nailArt ? C.primaryLight : "white", cursor: "pointer", fontFamily: "Georgia", fontSize: 13 }}>Non</button>
                    <button onClick={() => setCloture({ ...cloture, nailArt: true })}
                      style={{ flex: 1, padding: 10, borderRadius: 10, border: `2px solid ${cloture.nailArt ? C.primary : C.border}`, background: cloture.nailArt ? C.primaryLight : "white", cursor: "pointer", fontFamily: "Georgia", fontSize: 13 }}>Oui 💅</button>
                  </div>
                </div>
                {cloture.nailArt && (
                  <Fld label="Prix nail art (€)" type="number" value={cloture.prixNailArt} onChange={v => setCloture({ ...cloture, prixNailArt: v })} placeholder="Ex: 8" />
                )}

                {/* Offre spéciale */}
                <Sel label="Offre spéciale" value={cloture.offreId} onChange={v => setCloture({ ...cloture, offreId: v })}>
                  <option value="">Aucune offre</option>
                  {offres.map(o => <option key={o.id} value={o.id}>{o.label} (−{o.remise}€)</option>)}
                </Sel>

                <Fld label="Produits utilisés" value={cloture.produits} onChange={v => setCloture({ ...cloture, produits: v })} placeholder="Ex: Gel Luxio rose nude, top coat..." />
                <Fld label="Remarques / Réactions" value={cloture.remarques} onChange={v => setCloture({ ...cloture, remarques: v })} placeholder="Ex: cliente satisfaite, légère rougeur..." />

                {/* Total */}
                <div style={{ background: C.nudeLight, borderRadius: 10, padding: "12px 14px", marginBottom: 8, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.textMid }}><span>Prestation</span><span>{cloturerRdv.prixBase}€</span></div>
                  {cloture.nailArt && cloture.prixNailArt && <div style={{ display: "flex", justifyContent: "space-between", color: C.nudeDark }}><span>Nail art</span><span>+{cloture.prixNailArt}€</span></div>}
                  {cloture.offreId && <div style={{ display: "flex", justifyContent: "space-between", color: C.greenText }}><span>{offres.find(o => o.id === parseInt(cloture.offreId))?.label}</span><span>−{offres.find(o => o.id === parseInt(cloture.offreId))?.remise}€</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: C.primaryDark, marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                    <span>TOTAL</span>
                    <span>{cloturerRdv.prixBase + (cloture.nailArt ? parseFloat(cloture.prixNailArt) || 0 : 0) - (cloture.offreId ? offres.find(o => o.id === parseInt(cloture.offreId))?.remise || 0 : 0)}€</span>
                  </div>
                </div>
                <button onClick={validerCloture} style={fullBtn}>✅ Valider la prestation</button>
              </Modal>
            )}
          </div>
        )}

        {/* ── CLIENTES ── */}
        {page === "clientes" && !selectedClient && (
          <div>
            <input placeholder="🔍 Rechercher par nom ou téléphone..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.card, outline: "none", fontFamily: "Georgia" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.textMid }}>{filteredClients.length} clientes</div>
              <Btn onClick={() => setShowAddClient(true)}>+ Ajouter</Btn>
            </div>
            {filteredClients.map(c => (
              <div key={c.id} onClick={() => { setSelectedClient(c); setPage("fiche"); }}
                style={{ background: C.card, borderRadius: 14, padding: 16, marginBottom: 9, boxShadow: shadow, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar prenom={c.prenom} nom={c.nom} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: C.text, fontSize: 15 }}>{c.nom} {c.prenom}</div>
                  <div style={{ fontSize: 13, color: C.textLight, marginTop: 2 }}>{c.telephone}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: C.primary }}>⭐ {c.fidelite} pts</div>
                  <div style={{ fontSize: 12, color: C.textLight }}>{historiqueCliente(c.id).length} RDV</div>
                </div>
              </div>
            ))}
            {showAddClient && (
              <Modal title="Nouvelle cliente" onClose={() => setShowAddClient(false)}>
                <Fld label="Nom *" value={newClient.nom} onChange={v => setNewClient({ ...newClient, nom: v })} />
                <Fld label="Prénom *" value={newClient.prenom} onChange={v => setNewClient({ ...newClient, prenom: v })} />
                <Fld label="Téléphone" value={newClient.telephone} onChange={v => setNewClient({ ...newClient, telephone: v })} />
                <Fld label="Allergies / Santé" value={newClient.allergies} onChange={v => setNewClient({ ...newClient, allergies: v })} />
                <Fld label="Notes" value={newClient.notes} onChange={v => setNewClient({ ...newClient, notes: v })} />
                <button onClick={addClient} style={fullBtn}>Enregistrer</button>
              </Modal>
            )}
          </div>
        )}

        {/* ── FICHE CLIENTE ── */}
        {page === "fiche" && selectedClient && (() => {
          const histo = historiqueCliente(selectedClient.id);
          const clientActuel = clients.find(c => c.id === selectedClient.id);
          return (
            <div>
              <button onClick={() => { setPage("clientes"); setSelectedClient(null); }}
                style={{ background: "none", border: "none", color: C.primary, fontSize: 14, cursor: "pointer", marginBottom: 14, padding: 0 }}>← Retour</button>
              <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, borderRadius: 18, padding: 22, color: "white", marginBottom: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
                  {selectedClient.prenom[0]}{selectedClient.nom[0]}
                </div>
                <div style={{ fontSize: 21, fontWeight: "bold" }}>{selectedClient.nom} {selectedClient.prenom}</div>
                <div style={{ opacity: 0.85, marginTop: 4, fontSize: 14 }}>📱 {selectedClient.telephone}</div>
                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>⭐ {clientActuel?.fidelite} points · {histo.length} prestation{histo.length > 1 ? "s" : ""}</div>
              </div>
              {selectedClient.allergies && (
                <div style={{ background: C.warn, borderRadius: 12, padding: 14, marginBottom: 12, borderLeft: `4px solid ${C.nudeDark}` }}>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: C.warnText, letterSpacing: 1 }}>⚠️ ALLERGIES / SANTÉ</div>
                  <div style={{ fontSize: 14, color: C.warnText, marginTop: 4 }}>{selectedClient.allergies}</div>
                </div>
              )}
              {selectedClient.notes && (
                <div style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: shadow }}>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: C.textLight, letterSpacing: 1 }}>📝 NOTES</div>
                  <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>{selectedClient.notes}</div>
                </div>
              )}
              <div style={{ background: C.card, borderRadius: 12, padding: 16, boxShadow: shadow }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: C.textLight, letterSpacing: 1, marginBottom: 12 }}>📋 HISTORIQUE DES PRESTATIONS</div>
                {histo.length === 0 && <div style={{ color: C.textLight, fontSize: 13 }}>Aucune prestation terminée</div>}
                {histo.map((r, i) => (
                  <div key={r.id} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < histo.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: C.text }}>{labelPrestation(r)}</div>
                        <div style={{ fontSize: 12, color: C.textLight }}>{r.date} à {r.heure}</div>
                      </div>
                      <div style={{ fontWeight: "bold", color: C.primary }}>{prixTotal(r)}€</div>
                    </div>
                    {r.nailArt && <div style={{ fontSize: 12, color: C.nudeDark, marginTop: 4 }}>💅 Nail art +{r.prixNailArt}€</div>}
                    {r.labelOffre && <div style={{ fontSize: 12, color: C.greenText, marginTop: 2 }}>🎁 {r.labelOffre} −{r.prixOffre}€</div>}
                    {r.produits && <div style={{ marginTop: 6, background: C.nudeLight, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: C.nudeDark }}>🧴 {r.produits}</div>}
                    {r.remarques && <div style={{ marginTop: 4, background: r.remarques.toLowerCase().includes("rougeur") || r.remarques.toLowerCase().includes("réaction") ? C.warn : C.primaryLight, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: C.warnText }}>📝 {r.remarques}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── FIDÉLITÉ ── */}
        {page === "fidelite" && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.nude})`, borderRadius: 18, padding: 22, color: "white", marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🌸</div>
              <div style={{ fontSize: 17, fontWeight: "bold" }}>Programme Fidélité</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>10 points = 1 récompense à définir avec ta cliente</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>1 prestation terminée = 1 point automatique</div>
            </div>

            <SectionTitle>Offres spéciales</SectionTitle>
            {offres.map(o => (
              <div key={o.id} style={{ background: C.card, borderRadius: 12, padding: "12px 16px", marginBottom: 8, boxShadow: shadow, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, color: C.text }}>{o.label}</div>
                <div style={{ fontSize: 14, fontWeight: "bold", color: C.greenText }}>−{o.remise}€</div>
              </div>
            ))}
            <button onClick={() => setShowAddOffre(true)} style={{ ...fullBtn, background: "white", color: C.primary, border: `1px solid ${C.primary}`, marginBottom: 20 }}>+ Ajouter une offre</button>

            <SectionTitle>Mes clientes</SectionTitle>
            {[...clients].sort((a, b) => b.fidelite - a.fidelite).map(c => (
              <div key={c.id} style={{ background: C.card, borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar prenom={c.prenom} nom={c.nom} small />
                    <div>
                      <div style={{ fontWeight: "bold", color: C.text }}>{c.nom} {c.prenom}</div>
                      <div style={{ fontSize: 12, color: C.textLight }}>{c.fidelite} / 10 points</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <RoundBtn onClick={() => updateFidelite(c.id, -1)} label="−" outlined />
                    <RoundBtn onClick={() => updateFidelite(c.id, +1)} label="+" />
                  </div>
                </div>
                <div style={{ height: 7, background: C.border, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (c.fidelite / 10) * 100)}%`, background: c.fidelite >= 10 ? C.green : `linear-gradient(90deg, ${C.primary}, ${C.nude})`, borderRadius: 10, transition: "width 0.4s" }} />
                </div>
                {c.fidelite >= 10 && <div style={{ fontSize: 12, color: C.greenText, marginTop: 8, fontWeight: "bold", background: C.greenBg, padding: "6px 10px", borderRadius: 8 }}>🎉 Récompense disponible ! À définir avec {c.prenom}</div>}
              </div>
            ))}

            {showAddOffre && (
              <Modal title="Nouvelle offre spéciale" onClose={() => setShowAddOffre(false)}>
                <Fld label="Nom de l'offre" value={newOffre.label} onChange={v => setNewOffre({ ...newOffre, label: v })} placeholder="Ex: Offre Noël ❄️" />
                <Fld label="Remise (€)" type="number" value={newOffre.remise} onChange={v => setNewOffre({ ...newOffre, remise: v })} placeholder="Ex: 10" />
                <button onClick={addOffre} style={fullBtn}>Enregistrer</button>
              </Modal>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      {page !== "fiche" && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "white", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 20, boxShadow: "0 -2px 12px rgba(180,80,100,0.07)" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setSelectedClient(null); }}
              style={{ flex: 1, padding: "10px 0 14px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <span style={{ fontSize: 10, color: page === n.id ? C.primary : C.textLight, fontWeight: page === n.id ? "bold" : "normal", fontFamily: "Georgia" }}>{n.label}</span>
              {page === n.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.primary }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ prenom, nom, small }) {
  const s = small ? 36 : 44;
  return <div style={{ width: s, height: s, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.nude})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: small ? 13 : 16, flexShrink: 0 }}>{prenom[0]}{nom[0]}</div>;
}
function StatCard({ label, value, icon, bg }) {
  return <div style={{ background: bg, borderRadius: 16, padding: "16px 14px" }}><div style={{ fontSize: 24 }}>{icon}</div><div style={{ fontSize: 22, fontWeight: "bold", color: C.text, marginTop: 4 }}>{value}</div><div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{label}</div></div>;
}
function MiniRdv({ rdv, nom, label }) {
  return <div style={{ background: C.card, borderRadius: 12, padding: "12px 16px", marginBottom: 8, boxShadow: shadow, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 14, fontWeight: "bold", color: C.text }}>{nom}</div><div style={{ fontSize: 12, color: C.textLight }}>{rdv.date} à {rdv.heure} · {label}</div></div><div style={{ fontSize: 13, color: C.primary }}>~{rdv.prixBase}€</div></div>;
}
function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: "bold", color: C.textLight, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, marginTop: 4 }}>{children}</div>;
}
function Empty({ children }) {
  return <div style={{ textAlign: "center", color: C.textLight, padding: 40, fontSize: 15 }}>{children}</div>;
}
function QuickBtn({ icon, label, onClick }) {
  return <button onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 10px", cursor: "pointer", textAlign: "center", boxShadow: shadow }}><div style={{ fontSize: 24 }}>{icon}</div><div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontFamily: "Georgia" }}>{label}</div></button>;
}
function Btn({ onClick, children }) {
  return <button onClick={onClick} style={{ background: C.primary, color: "white", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "Georgia" }}>{children}</button>;
}
function RoundBtn({ onClick, label, outlined }) {
  return <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: "50%", border: outlined ? `1px solid ${C.border}` : "none", background: outlined ? "white" : C.primary, color: outlined ? C.text : "white", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{label}</button>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(60,20,30,0.35)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: "bold", color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.textLight }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Fld({ label, value, onChange, type = "text", placeholder = "" }) {
  return <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, color: C.textLight, display: "block", marginBottom: 4, letterSpacing: 1 }}>{label.toUpperCase()}</label><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Georgia", color: C.text }} /></div>;
}
function Sel({ label, value, onChange, children }) {
  return <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, color: C.textLight, display: "block", marginBottom: 4, letterSpacing: 1 }}>{label.toUpperCase()}</label><select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Georgia", background: "white", color: C.text }}>{children}</select></div>;
}
