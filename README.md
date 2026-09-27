<div align="center">
  <img src="assets/hero.svg" alt="Recast — Write it as yourself. Read it as someone else." width="100%" />
</div>

<div align="center">

### You can already talk yourself down.
### What if you could *read* yourself down — the way a stranger would?

**Recast** turns your first-person emotional writing into a third-person account.
Not to hide from what you feel, but to see it clearly enough to stop circling it.

</div>

---

## The idea

Write it as **I**. Read it back as **he / she**.

Something small and strange happens in between: the event stops being a wound you keep pressing, and becomes a story you can actually read. That shift has a name — **self-distancing** — and it has thirty years of evidence behind it.

Recast is built to make that shift happen on purpose, and only when it should.

## What makes it different

**It refuses to just swap pronouns.**
Third person alone changes nothing. Two studies found the benefit comes from *recasting* the story — its meaning, its cause, its ending — not from grammar. So Recast blocks the failure mode: hand back your own complaint in the third person, and it fails the rewrite.

**Intensity decides the method.**
High emotion gets distance. Low emotion gets meaning. Distance applied to a small feeling just strips the meaning out of it.

**Four viewpoints, one at a time.**
The observer. A friend. Your future self. You choose — never all at once, because stacked perspectives blur into dissociation.

**On demand, never a streak.**
Recast runs on real emotional events, not a daily checkbox. The only documented harm case in this literature came from *forced daily repetition over two weeks* — so Recast is built to avoid exactly that, with dose caps and a scheduled check-in at week two.

**Local-first and encrypted.**
A journal is the most private thing a person owns. It stays on your device.

## What it is not

- Not therapy. Not a medical device. Not a diagnosis.
- Not an escape hatch — distancing works because you come back to the problem, not because you avoid it.
- Not endless. Success looks like needing it less.

## Grounded in

Ayduk & Kross (2010) · Kross & Ayduk (2009) · Kross et al. (2012) · Trope & Liberman (2010) · Neff (2023) · Lau & Tov (2023) · Giovanetti et al. (2019)

> The last one is a negative result, and it is the reason this product has dose limits, an intake screen, and a week-two check-in.

## Status

**Phase 1 — web, running.** The full Step 0–10 flow works in the browser: intake, first-person writing, intensity routing, viewpoint selection, a rewrite that must pass a five-criterion gate before it counts as a rewrite, the narrative archive, and the week 2 / 4 / 8 check-in.

The rewrite engine is **stubbed** — it returns fixed sample output so the flow and the gate can be exercised end to end. Where the model runs is still open, and it is deliberately left open here.

```bash
cd app && npm install && npm run dev
```

## Roadmap

| Phase | Scope | State |
|---|---|---|
| 1 | Web app — full Step 0–10 flow, stubbed rewrite engine | Running locally |
| 2 | macOS desktop app (Tauri) — local encrypted storage | Planned |

Design notes live alongside the theory. The one-page version of this README is [`index.html`](index.html) — open it in a browser.

---

<div align="center">
  <sub>Built in the open. Start from the theory, not the hype.</sub>
</div>