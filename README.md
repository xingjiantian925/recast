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

Something small and strange happens in between: the event stops being a wound you keep pressing, and becomes a story you can actually read. That shift has a name — **self-distancing** — and it has decades of evidence behind it. Recasting a personal memory into the third person reliably lowers the heat of a single emotional episode, and the effect is strongest in exactly the people who carry the most: clinically depressed adults do it just as well as anyone, and benefit more (Kross et al., 2012; Kross & Ayduk, 2009; Résibois et al., 2018).

But the evidence says something narrower — and stranger — than the pop-science version. **The active ingredient is not the pronoun; it is the reconstruction of meaning.** In the studies that work, the gain comes from *reconstruing* — drawing insight, meaning, and a sense of an ending out of the event — not from *recounting* it again in new grammar (Kross & Ayduk, 2009; Kross et al., 2012). Language alone is measurable and manipulable, but its effect is small and it does **not** mediate symptom change (Nook et al., 2022). Swap "I" for "he" and nothing has happened yet.

That distinction is the whole product. Recast works a chain, and it refuses to skip a link:

> **perspective shift → meaning reconstruction → lower emotional heat → rumination interrupted → the story you tell about yourself changes**

The first arrow is *not* automatic. If the text changes person but stays a complaint — "he screwed it up again, he's useless" — you get the language of distance with none of the cognition, plus a fresh layer of self-alienation. That is the documented failure mode, and Recast's gate is built to catch it: a rewrite only counts if reconstruction actually happened.

**The negative result that shaped the product.** The single study closest to what Recast does — two weeks of daily third-person writing, in people high in cognitive vulnerability — found depressive symptoms went *up*, higher than plain expressive writing or no writing at all (Giovanetti et al., 2019). The most persuasive explanation is the one above: forced, unguided, daily *pronoun* swapping is not self-distancing, and it can curdle into a cold, critical gaze at yourself. Everything Recast refuses to do — a daily streak, running unattended, no exit — comes straight from this paper.

So the design follows the boundaries the research draws:

- **Reconstruction over grammar.** The measure is never "was the pronoun changed?" — it is whether meaning got rebuilt: insight, cause, closure, a forward step.
- **Emotion decides the method.** High-intensity events benefit from distance; low-intensity ones do *better* with reappraisal, because distancing a small thing just strips its meaning (Lau & Tov, 2023). Recast routes on intensity rather than distancing everything.
- **Distance paired with warmth.** Distancing is cool and analytical, and alone it can become the critical gaze of the Giovanetti failure — so it is paired with self-compassion, to keep the observer's view humane (Neff, 2023).
- **Distance is not dissociation.** The goal is to see clearly, not to feel nothing — in the lab the gain came with *more* problem-solving, not avoidance (Ayduk & Kross, 2010). Flat, emotionless output is treated as a failure, not a success.
- **Dose, guidance, check-ins.** No daily streak; a reason on every step; a review at week two.
- **Honest about size.** The realistic effects here are public-health-scale, not a cure: psychological prevention cuts new depression by about 21% (van Zoonen et al., 2014), and expressive-writing effects are small (Frattaroli, 2006). Recast is a clarity tool, not a treatment.

Recast exists to make that shift happen on purpose — and only when it should.

## What makes it different

**It refuses to just swap pronouns.**
Third person alone changes nothing. Two studies found the benefit comes from *recasting* the story — its meaning, its cause, its ending — not from grammar. So Recast blocks the failure mode: hand back your own complaint in the third person, and it fails the rewrite.

**Intensity decides the method.**
High emotion gets distance. Low emotion gets meaning. Distance applied to a small feeling just strips the meaning out of it.

**Four viewpoints, one at a time.**
The observer. A friend. Your future self. You choose — never all at once, because stacked perspectives blur into dissociation.

**On demand, never a streak.**
Recast runs on real emotional events, not a daily checkbox. The only documented harm case in this literature came from *forced daily repetition over two weeks* — so Recast is built to avoid exactly that, with dose caps and a scheduled check-in at week two.

**Local-first.**
A journal is the most private thing a person owns. Nothing here talks to a server of ours — your writing stays in this browser, and your model key goes only to the provider you configure. The key can live in memory for the session, or — if you opt in — be encrypted by the page and kept in this browser so a refresh doesn't mean re-entering it. The desktop build (Phase 2) moves both to OS-level encrypted storage and the system keychain.

## What it is not

- Not therapy. Not a medical device. Not a diagnosis.
- Not an escape hatch — distancing works because you come back to the problem, not because you avoid it.
- Not endless. Success looks like needing it less.

## Grounded in

Ayduk & Kross (2010) · Kross & Ayduk (2009) · Kross et al. (2012) · Résibois et al. (2018) · Trope & Liberman (2010) · Nook et al. (2022) · Neff (2023) · Lau & Tov (2023) · van Zoonen et al. (2014) · Frattaroli (2006) · Giovanetti et al. (2019)

> The last one is a negative result, and it is the reason this product has dose limits, an intake screen, and a week-two check-in.

## Status

**Phase 1 — web, running.** The full Step 0–10 flow works in the browser: intake, first-person writing, intensity routing, viewpoint selection, a rewrite that must pass a five-criterion gate before it counts as a rewrite, the narrative archive, and the week 2 / 4 / 8 check-in.

The rewrite engine runs for real, with **your own model key** (Settings → base URL, model, key):

- Any OpenAI-compatible endpoint works; tested against DeepSeek. Requests go straight from this page to the provider you configured — no server of ours sits in between.
- **Your key stays yours.** By default it lives in memory for the session only. Optionally, the page can encrypt it with a key it generates and keep it in this browser, so a refresh doesn't mean re-entering it — never sent anywhere except the provider you configured.
- Without a key, the app falls back to a built-in demo: the first attempt is deliberately stopped by the check, so the gate can be seen working end to end.

A deterministic pre-check (pronoun residue, length drift) runs before the model check, and the context for each call is assembled from visible capsules you can inspect on the result screen.

```bash
cd app && npm install && npm run dev
```

## Roadmap

| Phase | Scope | State |
|---|---|---|
| 1 | Web app — full Step 0–10 flow, real rewrite engine (bring your own key) plus demo mode | Running locally |
| 2 | Desktop app (Tauri) — encrypted local storage; model calls move into the shell, key in the system keychain | Planned |
| 3 | Voice input — speak the entry instead of typing it (speech-to-text) | Planned |
| 4 | Voice output — hear the recast read back, not only read it (speech synthesis) | Planned |

Design notes live alongside the theory. The one-page version of this README is [`index.html`](index.html) — open it in a browser.

---

<div align="center">
  <sub>Built in the open. Start from the theory, not the hype.</sub>
</div>