// audit.ts — §10 L'AUDIT (il guardiano della linea del tempo).
//
// auditContinuity assume il ruolo dell'audit di Scrivia, ESTESO al tempo: verifica che
// l'episodio non smentisca il canone fisso né lo snapshot a N, che i semi siano pagati,
// i debiti chiusi nella finestra, le soglie ben formate, e che non sfori le quote-saga.
// Verdetto in stile critic_verdict.json (lib/types.ts → CriticVerdict).
//
// Firma §9 invariata: (episodeId, graph, ctx) → SagaVerdict. Le quote rispecchiano i
// default di saga_config.yaml (recurring_creature_returns_max=4, window=4, max_same=2).

import type {
  EpisodeFlag,
  SagaCheck,
  SagaContext,
  SagaGraph,
  SagaVerdict,
} from "./types";

// quote di default (= saga_config.yaml § saga_quotas). Tarabili in futuro.
const Q_RETURNS_MAX = 4;
const Q_WINDOW = 4;
const Q_MAX_SAME = 2;

// regola anti-New-Age (= saga_config.yaml § world_rules / missione): lessico bandito.
// BOUNDARY-SAFE: ancorato a \b così "aura" NON scatta dentro "paura", e "anima" (l'anima)
// non scatta dentro "animale/animali" (leciti in una saga di animali).
const NEWAGE_BANNED: RegExp[] = [
  /\benergi[ae]\b/,
  /\bvibrazion\w*/,
  /\brisveglio\b/,
  /\baura\b/,
  /\bcosmic\w*/,
  /\banima\b/,
  /\bmagi[ae]\b/,
  /\bmagic\w*/,
];

export function auditContinuity(
  episodeId: string,
  graph: SagaGraph,
  ctx: SagaContext,
): SagaVerdict {
  const ep = graph.episodes?.[episodeId];
  const checks: SagaCheck[] = [];
  const flags: EpisodeFlag[] = [];
  const add = (key: string, label: string, pass: boolean, note: string) =>
    checks.push({ key, label, pass, note });
  const flag = (severity: EpisodeFlag["severity"], issue: string, episode = episodeId) =>
    flags.push({ episode, severity, issue });

  if (!ep) {
    add("exists", "episodio nel grafo", false, `'${episodeId}' assente`);
    return { verdict: "FAIL", checks, episode_flags: flags };
  }

  // 1) coerenza canone fisso (struttura del nodo ben formata)
  {
    const okSpine = Boolean(ep.premise && ep.problem && ep.threshold_moment && ep.resolution_mode);
    add("spine_complete", "spina completa", okSpine, okSpine ? "ok" : "campi-spina mancanti");
    if (!okSpine) flag("error", "spina incompleta (premise/problem/threshold/resolution)");

    const okEnum =
      ["distinguere", "connettere", "cambiare"].includes(ep.attribute_dominant) &&
      /^[A-F]$/.test(ep.entry_point_type) &&
      ep.closure_type >= 1 &&
      ep.closure_type <= 7 &&
      ["basso", "medio", "alto"].includes(ep.register);
    add("enums_valid", "enum spina validi", okEnum, okEnum ? "ok" : "enum fuori canone");
    if (!okEnum) flag("error", "enum spina non validi (attribute/entry/closure/register)");
  }

  // 2) coerenza con lo snapshot — niente doppio nodo sullo stesso regno
  {
    const already = ctx.snapshot.cordone.nodi_annodati.includes(ep.regno);
    const knotsHere = Boolean(ep.nodo_cordone?.annodato_qui);
    const ok = !(knotsHere && already);
    add("cordone_no_double_knot", "cordone: niente doppio nodo", ok,
      ok ? "ok" : `il nodo di ${ep.regno} risulta già annodato`);
    if (!ok) flag("error", `doppio nodo sul regno ${ep.regno} (già in nodi_annodati)`);
  }

  // 3) semi pagati: ogni seme piantato ha un bloom_target; gli aperti scaduti = flag
  {
    let allHaveTarget = true;
    for (const id of ep.seeds_planted || []) {
      const s = graph.seeds?.[id];
      if (!s || !s.bloom_target) {
        allHaveTarget = false;
        flag("warn", `seme ${id} senza bloom_target nel registro`);
      }
    }
    add("seeds_have_target", "semi piantati con bloom_target", allHaveTarget,
      allHaveTarget ? "ok" : "alcuni semi senza bersaglio di fioritura");

    let noOverdue = true;
    for (const s of ctx.openSeeds) {
      const targetOrder = s.bloom_target ? graph.episodes?.[s.bloom_target]?.order_in_journey : undefined;
      if (typeof targetOrder === "number" && targetOrder < ctx.n) {
        noOverdue = false;
        flag("warn", `seme ${s.id} scaduto (atteso a ${s.bloom_target}, non ancora fiorito)`);
      }
    }
    add("seeds_not_overdue", "nessun seme scaduto", noOverdue, noOverdue ? "ok" : "semi scaduti aperti");
  }

  // 4) debiti chiusi entro la finestra
  {
    let noOverdueDebt = true;
    for (const d of ctx.openDebts) {
      const openedOrder = graph.episodes?.[d.opened]?.order_in_journey;
      if (typeof openedOrder === "number" && typeof d.window === "number" && openedOrder + d.window < ctx.n) {
        noOverdueDebt = false;
        flag("warn", `debito ${d.id} oltre la finestra (aperto a ${d.opened}, finestra ${d.window})`);
      }
    }
    add("debts_in_window", "debiti entro la finestra", noOverdueDebt,
      noOverdueDebt ? "ok" : "debiti scaduti aperti");
  }

  // 5) soglie ben formate: ogni delta threshold_crossed ha un riferimento non vuoto
  {
    let wellFormed = true;
    const fx = ep.effects || {};
    for (const g of fx.growth || []) if (g.threshold_crossed && !(g.who && g.axis)) wellFormed = false;
    for (const r of fx.relation || []) if (r.threshold_crossed && !(r.between && r.between.length)) wellFormed = false;
    for (const w of fx.world || []) if (w.threshold_crossed && !(w.place && w.change)) wellFormed = false;
    add("thresholds_well_formed", "soglie ben formate", wellFormed,
      wellFormed ? "ok" : "delta-soglia senza riferimento");
    if (!wellFormed) flag("warn", "delta con threshold_crossed ma riferimento incompleto");
  }

  // 6) quote-saga
  {
    // 6a) ritorni-creatura ≤ max
    let returnsOk = true;
    for (const c of ctx.snapshot.recurring_creatures) {
      if (c.returns > Q_RETURNS_MAX) {
        returnsOk = false;
        flag("warn", `creatura ${c.id} torna ${c.returns}× (> ${Q_RETURNS_MAX})`);
      }
    }
    add("quota_creature_returns", `ritorni-creatura ≤ ${Q_RETURNS_MAX}`, returnsOk,
      returnsOk ? "ok" : "creatura troppo ricorrente");

    // 6b) varietà tipi in finestra
    const windowEps = Object.values(graph.episodes || {})
      .filter((e) => e.order_in_journey <= ctx.n && e.order_in_journey > ctx.n - Q_WINDOW)
      .sort((a, b) => a.order_in_journey - b.order_in_journey);
    const typeCounts: Record<string, number> = {};
    for (const e of windowEps) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    const overType = Object.entries(typeCounts).find(([, c]) => c > Q_MAX_SAME);
    const varietyOk = !overType;
    add("quota_type_variety", `varietà tipi (≤ ${Q_MAX_SAME}/${Q_WINDOW})`, varietyOk,
      varietyOk ? "ok" : `tipo '${overType?.[0]}' ripetuto ${overType?.[1]}× nella finestra`);
    if (!varietyOk) flag("warn", `monotonia di tipo-episodio nella finestra di ${Q_WINDOW}`);

    // 6c) anti-New-Age (lessico bandito nella spina dichiarata)
    const hay = `${ep.premise} ${ep.problem} ${ep.threshold_moment} ${ep.resolution_mode}`.toLowerCase();
    let hit: string | null = null;
    for (const re of NEWAGE_BANNED) {
      const m = re.exec(hay);
      if (m) {
        hit = m[0];
        break;
      }
    }
    const newageOk = !hit;
    add("rule_anti_newage", "regola anti-New-Age", newageOk,
      newageOk ? "ok" : `lessico bandito: '${hit}'`);
    if (!newageOk) flag("error", `New Age: la stranezza dev'essere fisica, non '${hit}'`);
  }

  const verdict: SagaVerdict["verdict"] = checks.every((c) => c.pass) ? "PASS" : "FAIL";
  return { verdict, checks, episode_flags: flags };
}
