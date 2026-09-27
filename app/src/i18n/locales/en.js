/**
 * en.js — English strings (default locale)
 *
 * Conventions (both locale files must follow):
 *  - User-visible strings only, including stub data. Code comments stay out of this file.
 *  - Never use `@` or `|` in a value: the vue-i18n message compiler treats them as
 *    linked / plural syntax and throws a SyntaxError (verified). Apostrophes are safe.
 *  - Interpolation uses single braces `{n}` (not Vue's `{{ }}`).
 *  - Plain data (arrays / objects) is read through tm() in mock/fixtures.js;
 *    interpolated strings go through t().
 *
 * Content that needs review before release is marked with [REVIEW].
 */

export default {
  app: {
    title: 'Recast · Self-distancing journal',
    description:
      'A structured self-distancing journal. Write it in first person; read it back in third.',
    brandSuffix: 'self-distancing journal',
    langLabel: 'Language',
    langZh: '中文',
    langEn: 'EN',
    nav: {
      home: 'Home',
      narrative: 'Narrative',
      checkin: 'Check-ins',
      safety: 'Safety & limits',
      support: 'Support & referral',
    },
    footer: {
      disclaimer:
        'Recast is a self-awareness tool, not a medical device. It does not provide diagnosis, treatment, or crisis intervention. It does one thing: when an emotional event happens, it helps you read back what you wrote.',
      // [REVIEW] Crisis numbers are region-specific. Review before release.
      crisis:
        'If you are in crisis, contact 988 (US Suicide & Crisis Lifeline), 116 123 (Samaritans, UK and Ireland), or your local emergency number.',
      localFirst: 'Local-first · data stays on this device · no daily prompts, no streak counts',
    },
  },

  common: {
    listSep: ', ',
    weekUnit: 'wk',
    notePrefix: 'Note · ',
    collapse: 'Collapse',
  },

  /* Step numbers match the design document and are kept in both locales. */
  step: {
    intake: 'Step 0 · Intake triage',
    write: 'Step 1 · First-person account',
    intensity: 'Step 2 · Intensity routing',
    lens: 'Step 3 · Perspective',
    recast: 'Step 4–6 · {lens}',
  },

  home: {
    crisisTitle: 'No recasting for now.',
    crisisBody:
      'The signal you left in the triage needs to be caught by a real person. This is not a failure, and it is not something you should handle on your own with a tool.',
    crisisLink: 'See support and referral →',
    eyebrow: 'On demand · you do not have to write every day',
    titleLine1: 'When something keeps turning',
    titleLine2: 'over in your mind',
    lede: 'Write it down fully in first person first, then read it back in third. It is not a change of pronoun, it is a change in how you understand it.',
    ctaContinue: 'Continue this entry',
    ctaStart: 'Start',
    ctaRecord: 'Record an emotional event',
    viewNarrative: 'View the narrative',
    triggersLead:
      'When is it worth using? Any one of these is enough — you are the one who judges:',
    triggers: [
      'Something feels like a 7 or higher in intensity to you',
      'You have already written about the same thing twice today',
      'Sleep, appetite, or social contact has clearly withdrawn, and you know why',
    ],
    triggersTail:
      'Recast does not analyze your mood in the background to decide when to prompt you.',
    doseTitle: 'Dose this week',
    doseUntriaged: 'Not triaged',
    doseUnit: '/ {cap}',
    doseNote:
      'Each session is guided to 15 minutes or more. The weekly cap is a conservative safety margin, not a target to reach.',
    doseAtCap: 'You have reached this week’s cap. This week, read back the narrative instead, or rest.',
    checkinTitle: 'Check-in',
    checkinDue: 'Week {week} due',
    checkinNone: 'Nothing due',
    checkinNoteLead: 'Check-ins compare how things move ',
    checkinNoteBold: 'across weeks',
    checkinNoteTail:
      '. How you feel right after a session is not used as evidence of effect — immediate mood often gets worse first, and benefits show up weeks later.',
    checkinWeeks: 'Check-in at weeks {weeks}',
    checkinMustWeek2: 'Week 2 is a required point',
    checkinScaleNote:
      'Scale scores are never shown to you as a trajectory; they are used only for self-report and for deciding whether to refer',
    checkinEnter: 'Start a check-in',
    recentTitle: 'Recent narrative',
    recentAll: 'All →',
    recentEmpty:
      'No archived entries yet. The first recast that passes the check will appear here.',
    noEventEyebrow: 'No event this week · doing nothing is also allowed',
    noEventNote:
      'If it has been a long time since you used this, that is not a state to be corrected. The goal of this tool is for you to need it less and less.',
  },

  intake: {
    crisisNumbersTitle: 'Numbers you can call now',
    crisisChannelNote:
      'This judgment comes from a separate channel, not from the recasting flow. Recast will not continue any writing guidance on this path.',
    crisisSupportLink: 'See support and referral',
    resultEyebrow: 'Triage result',
    doseCapLabel: 'Weekly recast cap',
    doseCapValue: '≤ {n} per week',
    checkinPointsLabel: 'Required check-ins',
    checkinPointsValue: 'Weeks {weeks}',
    scoreNote:
      'Your scale scores are never displayed and never plotted. The scales have only two uses here: setting the dose cap, and deciding whether a referral is needed. If things get worse, you will be told to find a person, not shown a curve.',
    seeSafety: 'Read the limits first',
    proceed: 'Understood, start',
    introTitle: 'Before you begin',
    introBody:
      'This step sets your dose cap and your check-in frequency. It is about {count} items in total; answer according to the last two weeks, without overthinking.',
    prevSection: 'Previous',
    nextSection: 'Next',
    seeResult: 'See result',
    quickDemo: 'Demo: skip through',
  },

  write: {
    title: 'Write it down as it was',
    lede: 'Write whatever you want to write. No editing, no wrapping up, no conclusions at this step.',
    timerLabel: 'Guide ≥ 15:00',
    placeholder: 'What happened today?',
    counter: '{n} characters',
    fillSample: 'Insert sample entry (demo)',
    underDose:
      'Under 15 minutes, you are below the dose range supported by evidence. You can continue, but the basis for an effect is weaker.',
    later: 'Write later',
    next: 'Done, next step',
  },

  intensity: {
    title: 'How strong is this right now?',
    lede: 'Rate it by how strong it feels when you recall it now, not by how serious it “should” be.',
    hint: 'The sample entry suits an 8.',
    legendLow: '0 · barely there',
    legendMid: '5 · moderate',
    legendHigh: '10 · extreme',
    routeEyebrow: 'Routing result',
    lowTitle: 'This time you will not be guided into third-person recasting.',
    lowBody:
      'At low intensity, distancing does not outperform positive reappraisal, and it can even make the event feel meaningless. You will go straight to the archive, with a short reappraisal guide.',
    goArchive: 'Go to archive',
    goLens: 'Choose a perspective',
  },

  lens: {
    title: 'Whose eyes read this',
    ledeLead: 'All four are usable, but ',
    ledeBold: 'use only one at a time',
    ledeTail: '. Mixing them blurs the pronouns, which is a known risk.',
    defaultTag: 'Default',
    riskPrefix: 'Uncertain: ',
    repeated:
      'You have used this perspective {n} times. If the last few times brought no new understanding, switching is a better move than continuing — repeating a single perspective can blunt it.',
    disclaimer:
      'Your choice is recorded (which one, at what intensity, and whether it is chosen again) so it can later be compared against an embedded study. But Recast will not conclude that one perspective works better for you — self-selection cannot support that claim.',
    cta: 'Start recasting',
  },

  recast: {
    workTitle: 'Recast, not just change the pronoun',
    workLedeLead: 'Recasting does two things: it changes the pronoun, and it forces one act of ',
    workLedeBold: 'reconstruction',
    workLedeTail: ' — why this happened and what it means. Doing only the first is useless, or worse.',
    yourText: 'What you wrote',
    guideEyebrow: 'Reconstruction prompt (pick one to work with)',
    generating: 'Recasting…',
    generate: 'Recast',
    stubNote:
      'Stub build: the first attempt deliberately returns a result that only changes pronouns, with no reconstruction, to demonstrate the check.',
    gateEyebrow: 'Step 5 · Reconstruction check',
    gatePassed: 'Passed: reconstruction happened this time',
    gateExhausted: 'Still failing: this material is not suited to distancing',
    gateFailed: 'Not passed: only the pronouns changed',
    gateTagPass: 'Pass',
    gateTagExhausted: 'To support',
    gateTagRetry: 'Retry',
    failNoteBold:
      'Read this: the output is in third person, but it retells details and criticizes the self throughout, with no change in understanding.',
    failNoteTail:
      'This is the form that most needs to be stopped — it turns self-distancing into self-alienation. Retrying will ',
    failNoteTailBold: 'switch the prompting question',
    failNoteTail2: ', not the pronoun.',
    exhaustedNote:
      'The prompt was changed and reconstruction still did not occur. This usually means the material is beyond what distancing can handle (it may involve something that needs stabilizing first). Forcing it further makes no sense; the flow moves to the support path.',
    trackCool: 'Track 1 · Distanced account',
    trackWarm: 'Track 2 · Warmth layer',
    warmthNote:
      'Distancing runs cold. This layer is not comfort — it prevents the observer perspective from turning into a cold, critical stare.',
    selfCheckEyebrow: 'After reading · self-check (optional)',
    selfCheckNote:
      'The goal of distancing is to see more clearly, not to feel nothing. If any of the following is true, it is worth stopping.',
    flagNote:
      'You marked {n} item(s). These are known failure-mode signals, not signs of writing badly. Do not archive this one; take the support path instead. If the feeling persists, talk to someone.',
    retry: 'Retry with another prompt',
    toSupport: 'Go to the support path',
    save: 'Archive to the narrative',
  },

  archive: {
    eyebrow: 'Step 9 · Archive',
    titleReappraisal: 'Archived · reappraisal path',
    titleRecast: 'Archived · added to the narrative',
    reappraisalNote:
      'The intensity was low, so no third-person distancing was used — at low intensity it strips the meaning out. Keep these questions for later, when they come to mind.',
    themesEyebrow: 'Narrative markers for this entry',
    themesNote:
      'The markers come from the criteria the check passed (not from the scales). They are for reading long-term movement, not for grading a single entry.',
    themeAgency: 'Agency',
    themeType: 'Narrative type',
    themeCoherence: 'Coherence',
    notScoreNote:
      'Success is not judged by whether you felt better after writing. Immediate mood often gets worse first and benefits take weeks to appear — so there is no “do you feel better?” here.',
    viewNarrative: 'View the narrative',
    finish: 'End this session',
  },

  support: {
    notRecastTitle: 'No recasting here',
    notRecastBody:
      'Some material is not suited to distancing — especially recent major stress, deep trauma, or when you have started to feel unreal or unable to feel your emotions. What helps then is to stabilize first and involve a real person, not to look at it from another angle.',
    notRecastAction:
      'This is not a failure, and you did not write the wrong thing. This material was simply not meant to be handled by this tool.',
    numbersTitle: 'Numbers you can contact',
    proTitle: 'If you are going to see a professional',
    proBody:
      'Bringing what you wrote is usually more accurate than retelling it. Recast does not upload or analyze anything; it only offers one local copy.',
    copy: 'Copy what I wrote',
    copied: 'Copied to clipboard',
    exportHeader: '[Exported from Recast to share with a professional]',
    exportEmpty: '(no writing in this session)',
    stateEyebrow: 'Current state',
    reasonLabel: 'Reason: ',
    reasonTriage: 'triage result',
    reasonExhausted: 'repeated check failures — this material is not suited to distancing',
    reasonSelf: 'you chose the support path',
    entriesLabel: 'Archived entries: {n} · the recasting flow is stopped for this session',
    backNote:
      'Returning to the home page will not restart the recasting flow. If you want a more conservative way of using this, you can step down on purpose under Safety & limits.',
    toSafety: 'Go to Safety & limits',
  },

  narrative: {
    title: 'Narrative',
    lede: 'Looking back does not mean writing something new. What you can see here is how your way of telling it is changing — not how many times you “completed” something.',
    empty: 'No archived entries yet. Once a recast passes the check, it will appear here.',
    home: 'Back to home',
    statRecasts: 'Times reconstruction happened',
    statRecastsNote: 'Counts only entries that passed the check, not attempts',
    statDose: 'Dose this week',
    statDoseNote: 'Cap {n} · a conservative margin, not a target',
    statLenses: 'Perspectives used',
    statLensesNote: 'perspectives tried · rotating helps against blunting',
    statAgency: 'Agency, last three',
    statAgencyNote: 'rising agency precedes symptom change',
    weeklyTitle: 'Recasts per week',
    weeklyNote: 'A process measure — it reflects your own rhythm of use',
    weeklyTag: 'Last 8 weeks',
    thisWeek: 'this wk',
    weeksAgo: '{n} wk ago',
    noScaleNote:
      'Recast does not plot RRS-brooding or PHQ-9 curves here. Those scales are used only for self-report and for deciding whether a referral is needed; they are not a score or a progress bar for you.',
    entriesTitle: 'Entries',
    reappraisalTag: 'reappraisal',
    intensityTag: 'intensity {n}',
    repeatTag: 'repeated',
    hitsLabel: 'criteria met:',
    footerNote:
      'If a perspective stops bringing new understanding, switching to another one is better than continuing with the same one.',
  },

  checkin: {
    title: 'Check-in',
    ledeLead: 'A check-in looks at movement ',
    ledeBold: 'across weeks',
    ledeTail:
      ', not at how this one session went. An in-session mood improvement is not evidence of success.',
    noTier: 'No triage yet, so your check-in schedule cannot be set.',
    goTriage: 'Do the triage',
    scheduleTitle: 'Check-in schedule',
    weekUnit: 'wk',
    mustTag: 'required',
    scheduleNote:
      'Week 2 is a hard checkpoint because the known harm cases fall exactly in the “daily repetition over two weeks” window. This is not a reminder to keep going; it is a reminder to stop and look.',
    lastCheckin: 'Last check-in: {date} · result {verdict} (only the result is kept, never the scores)',
    verdictStable: 'stable',
    verdictImproved: 'improved',
    verdictWorsened: 'worsened',
    start: 'Start check-in',
    demoStable: 'Demo · stable',
    demoWorsened: 'Demo · worsened',
    phq9Label: 'PHQ-9 · last 2 weeks',
    rrsSuffix: 'responses when feeling down',
    seeVerdict: 'See result',
    verdictEyebrow: 'Check-in result',
    needsAction: 'Action needed',
    noAction: 'No action needed',
    resultStableTitle: 'Stable',
    resultStableBody: 'Nothing needs to change compared with last time. Continue at the same dose.',
    resultImprovedTitle: 'Improved',
    resultImprovedBody:
      'Improved compared with last time. Note: this is not proof of cause, and it is still best to keep the same rhythm — do not increase the dose.',
    resultWorsenedTitle: 'Worsened',
    resultWorsenedBodyWatch:
      'This is the response condition for the watch tier: stop recasting, step down, and refer.',
    resultWorsenedBodyRoutine:
      'This is the step-down condition: stop recasting for a while, see whether the change tracks your use of it, and consider talking to someone.',
    disposeTitleWatch: 'Action: stop recasting + refer',
    disposeTitleRoutine: 'Action: stop recasting + step down',
    disposeBodyWatch:
      'For the watch tier this response is mandatory: no further third-person recasting, and a referral to human support. You can still use the meta-cognitive notes and self-report.',
    disposeBodyRoutine:
      'Stop for a while and watch whether the change tracks your use of it. If the feeling persists or grows, talk to someone.',
    toSafety: 'Go to Safety & limits (step down here)',
    noScoreNote:
      'Your actual scores were not shown and were not saved as a curve. Only a result is kept here.',
    done: 'Done',
  },

  safety: {
    title: 'Safety & limits',
    ledeLead: 'This page describes what this tool does ',
    ledeBold: 'not',
    ledeTail: ' do, and when it should be stopped.',
    positionEyebrow: 'Positioning',
    positionTitle: 'This is a self-awareness tool, not a medical device',
    rules: [
      'No diagnosis, treatment, or crisis intervention; no medical claims of any kind.',
      'No claim to lower incidence, relieve symptoms, or replace professional support.',
      'No scale score trajectories are shown; the scales are used only for self-report and for deciding whether to refer.',
      'No uploading, no background mood analysis, no silent decisions about your dose.',
      'No daily check-in, no streak counts, no form of forced use.',
    ],
    doseEyebrow: 'Dose spec',
    doseTitle: 'The numeric contract',
    doseCaption:
      'The frequency caps in this table are conservative safety margins without direct trial evidence, and need adjustment during validation.',
    doseColParam: 'Parameter',
    doseColRoutine: 'Routine',
    doseColWatch: 'Watch',
    doseColBasis: 'Basis',
    doseTable: [
      ['Session length', 'Guided to ≥ 15 min', 'Same', 'Frattaroli 2006'],
      ['Trigger', 'On demand (emotional event) + weekly review', 'Same', 'Daily prompting is disallowed for every tier'],
      ['Weekly recast cap', '≤ 3', '≤ 2', 'Conservative margin, to be validated'],
      ['Required check-ins', 'Weeks 2 / 4 / 8', 'Week 2 required, plus weeks 4 / 6 / 8', 'Giovanetti 2019: the 2-week window'],
      ['Response to worsening', 'Step down + notice', 'Stop recasting + refer', 'As above'],
      ['Success criterion', 'Movement across weeks', 'Same', 'In-session mood must not be used'],
    ],
    capLead: 'Your current cap: ',
    capValue: '{n} per week',
    monitorEyebrow: 'Monitoring',
    monitorTitle: 'Stop when these signals appear',
    monitorNote:
      'The goal of distancing is to see more clearly, not to feel nothing. If any of the following persists, this method does not suit you right now.',
    monitorDanger:
      'When these signals appear, the right move is not to try once more — it is to stop recasting and find a person. Recast does not judge and does not intervene.',
    offRampEyebrow: 'Exit design',
    offRampTitle: 'Step down on purpose',
    offRampBodyLead: 'The success criterion for this tool is ',
    offRampBodyBold: 'that you need it less and less',
    offRampBodyTail:
      '. Training effects generalize to situations where you are not guided, so using it less once the skill is internalized is the goal, not churn.',
    offRampEffect:
      'After stepping down: the recasting flow is disabled, and only the meta-cognitive notes and self-report remain — the most conservative part, for prevention.',
    offRampOff: 'Step down: disable recasting',
    offRampOn: 'Re-enable recasting',
    offRampTag: 'stepped down',
    dataEyebrow: 'Data',
    dataTitle: 'Local-first',
    dataBody:
      'This is the front-end prototype stage: everything is stored in browser local storage. Nothing leaves the device, nothing is uploaded, nothing goes online. The production version is planned on local (encrypted) SQLite, with no cross-device sync in the first release.',
    clearData: 'Erase all data on this device',
    storedCount: '{n} stored',
    crisisEyebrow: 'Crisis',
    crisisTitle: 'When a real person needs to catch you',
    refsNote:
      'Theory and flow spec live in the project documents (理论基础.md, 产品设计纲要.md). Key references: Kross & Ayduk (2009), Ayduk & Kross (2010), Kross et al. (2012), Lau & Tov (2023), Neff (2023), Adler (2012), Frattaroli (2006), Giovanetti et al. (2019).',
  },

  /* Tiers, bands, and narrative markers (copy moved out of engine.js / journal.js) */
  tier: {
    routine: {
      label: 'Routine',
      desc: 'No current symptoms, low susceptibility. Use at the standard dose.',
    },
    watch: {
      label: 'Watch',
      desc: 'No current symptoms, but higher cognitive susceptibility. The strictest cap and the densest check-ins — this is a conservative setting, not a judgment.',
    },
    distress: {
      label: 'Distress pathway',
      desc: 'Current symptoms are present. For this route the evidence points the right way and the safety margin is wider, so the dose follows the routine tier.',
    },
    crisis: {
      label: 'No recasting',
      desc: 'A signal was detected that requires a real person to intervene.',
    },
  },

  band: {
    high: {
      label: 'High (≥7)',
      method: 'Self-distancing',
      why: 'At high intensity, distancing outperforms positive reappraisal on coherence and meaning.',
    },
    mid: {
      label: 'Mid (4–6)',
      method: 'Distancing + self-compassion, two tracks',
      why: 'It needs distance, and it also needs warmth.',
    },
    low: {
      label: 'Low (≤3)',
      method: 'No distancing — positive reappraisal, or straight to archive',
      why: 'At low intensity distancing is worse than reappraisal; it strips the meaning out.',
    },
  },

  themes: {
    agency: { rising: 'Agency rising', flat: 'Agency flat' },
    redemption: { redemption: 'Redemption', contamination: 'Contamination', neutral: 'Neutral' },
    coherence: { high: 'High coherence', low: 'Low coherence' },
  },

  /* ── Stub data (read through tm() in mock/fixtures.js) ── */

  scales: {
    // PHQ-9 and GAD-7 wording follows the official English versions
    // (both are free to reproduce, translate, and distribute).
    phq9: {
      id: 'phq9',
      name: 'PHQ-9',
      intro:
        'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      options: [
        { v: 0, label: 'Not at all' },
        { v: 1, label: 'Several days' },
        { v: 2, label: 'More than half the days' },
        { v: 3, label: 'Nearly every day' },
      ],
      items: [
        'Little interest or pleasure in doing things',
        'Feeling down, depressed, or hopeless',
        'Trouble falling or staying asleep, or sleeping too much',
        'Feeling tired or having little energy',
        'Poor appetite or overeating',
        'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
        'Trouble concentrating on things, such as reading the newspaper or watching television',
        'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
        'Thoughts that you would be better off dead, or of hurting yourself in some way',
      ],
    },
    gad7: {
      id: 'gad7',
      name: 'GAD-7',
      intro: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
      options: [
        { v: 0, label: 'Not at all' },
        { v: 1, label: 'Several days' },
        { v: 2, label: 'More than half the days' },
        { v: 3, label: 'Nearly every day' },
      ],
      items: [
        'Feeling nervous, anxious, or on edge',
        'Not being able to stop or control worrying',
        'Worrying too much about different things',
        'Trouble relaxing',
        'Being so restless that it is hard to sit still',
        'Becoming easily annoyed or irritable',
        'Feeling afraid as if something awful might happen',
      ],
    },
    // [REVIEW] RRS-brooding wording follows the 5 brooding items attributed to
    // Treynor, Gonzalez & Nolen-Hoeksema (2003). Verify against the original
    // publication before release; the RRS itself is not in the public domain.
    rrs: {
      id: 'rrs',
      name: 'RRS · Brooding subscale',
      intro:
        'People react differently when they feel down. How often do you think the following when you feel down?',
      options: [
        { v: 1, label: 'Almost never' },
        { v: 2, label: 'Sometimes' },
        { v: 3, label: 'Often' },
        { v: 4, label: 'Almost always' },
      ],
      items: [
        'Think “What am I doing to deserve this?”',
        'Think “Why do I have problems other people don’t have?”',
        'Think “Why can’t I handle things better?”',
        'Think about a recent situation, wishing it had gone better',
        'Think “Why do I always react this way?”',
      ],
      note: 'Item wording is provisional, pending verification against the original publication.',
    },
  },

  prompts: {
    writing: [
      'What happened? Write down the time, the place, and who was there.',
      'What did your body feel? Chest, shoulders, stomach, breathing.',
      'What went through your mind? Write it down even if it is not flattering.',
      'No need to wrap it up. You do not have to reach a conclusion at this step.',
    ],
    writingBlocked: [
      'Write in first person here only. Changing the pronouns is the next step.',
      'Do not try to make sense of it yet. Put it down as it was first.',
    ],
    reconsture: [
      { id: 'why', text: 'Why did this happen?', note: 'distanced-why — the core operation in Kross et al. 2012' },
      { id: 'mean', text: 'What does this say?', note: 'meaning extraction' },
      { id: 'friend', text: 'If this had happened to a friend, how would you understand it?', note: 'shift position to lower self-criticism' },
      { id: 'chain', text: 'What pushed what toward what?', note: 'causal chain, leaning toward redemption' },
    ],
    reappraise: [
      'In this event, which parts can you change and which can you not?',
      'If you could do one thing to move it forward, what would it be?',
      'Looking back at this in a month, what would you hope you had done?',
    ],
  },

  criteria: [
    { id: 'insight', label: 'Insight statement', hint: 'A pattern about the self is seen, not just the event described' },
    { id: 'meaning', label: 'Meaning made', hint: 'States what this event means' },
    { id: 'causal', label: 'Causal understanding', hint: 'Answers “why this happened”' },
    { id: 'closure', label: 'Closure', hint: 'The loop closes instead of repeating without end' },
    { id: 'action', label: 'Forward action', hint: 'Points to something that can be done next' },
  ],

  lenses: [
    {
      id: 'future',
      name: 'Your future self',
      meta: 'Temporal distance · CLT (Trope & Liberman 2010)',
      desc: 'Let the you of ten years from now look at this. Temporal distance naturally loosens the grip of the present.',
      sample: 'Looking back at this ten years later, he would probably notice…',
      risk: '',
      isDefault: true,
    },
    {
      id: 'observer',
      name: 'Observer perspective',
      meta: 'Social distance · the original Ayduk & Kross paradigm',
      desc: 'Watch it happen from the corner of the room, like a bystander who knows no one.',
      sample: 'In the room there is a person who knows no one, and what he sees is…',
      risk: 'In Chinese samples the “bystanders are wiser” pattern does not hold; of the four perspectives this one has the least certain effect.',
      isDefault: false,
    },
    {
      id: 'friend',
      name: 'A friend / someone close',
      meta: 'Social distance + empathy',
      desc: 'See it through the eyes of someone you trust. The warmth fits naturally and pairs well with self-compassion (mid intensity).',
      sample: 'If a close friend went through the same thing, what I would see is…',
      risk: 'In Chinese samples, wisdom about a close other is lower, which may weaken the cognitive gain from distancing.',
      isDefault: false,
    },
    {
      id: 'custom',
      name: 'Name your own referent',
      meta: 'No preset',
      desc: 'Write with whatever name you use for yourself — a given name, a nickname, or any referent you would naturally say out loud.',
      sample: '(fill in your own) At the review meeting today…',
      risk: 'With no guidance the perspective tends to drift: the pronouns slide back to “I” as you write.',
      isDefault: false,
    },
  ],

  metaNotes: [
    {
      id: 'mn-analysis',
      title: 'Analysis, or rumination?',
      body: 'Analysis has an end, and the end is an action. Rumination has no end; it circles back to yourself. If you keep returning to the same memory for the hundredth time, and each time you land on “is something wrong with me” — that is probably not analysis.',
      source: 'Wells — MCT / CAS model',
    },
    {
      id: 'mn-why',
      title: '“Why” in two directions',
      body: 'Both ask why. Asking “why did this happen” leads out into causes. Asking “why am I so worthless” leads back into yourself. The first is understanding; the second is interrogation.',
      source: 'Kross et al. 2012 — distanced-why',
    },
    {
      id: 'mn-skill',
      title: 'Needing it less is a good sign',
      body: 'This skill can be internalized. The goal is not to keep you dependent on it, but for you to be able to do it when it is not open.',
      source: 'Travers-Hill 2017: effects generalize to unguided situations',
    },
  ],

  crisis: {
    copy: {
      title: 'Stop here for now',
      body: 'What you wrote contains signals that need to be caught by a real person. This is not something to handle on your own with a tool, and it is not a failure.',
      action:
        'Please contact one of the numbers below, or someone you trust, or your doctor. If you are willing, you can also bring what you wrote to a professional when it is convenient.',
    },
    // [REVIEW] Region-specific. 988 covers the US, 116 123 covers the UK and Ireland,
    // findahelpline.com covers the rest. Review before release.
    resources: [
      { name: 'US · 988 Suicide & Crisis Lifeline', value: '988', note: 'Call or text, 24/7' },
      { name: 'UK and Ireland · Samaritans', value: '116 123', note: 'Free to call, 24/7' },
      { name: 'Local emergency services', value: '911 / 999 / 112', note: 'Police, ambulance, or fire — if there is immediate physical danger' },
      { name: 'Helplines in other countries', value: 'findahelpline.com', note: 'Directory of verified crisis lines by country' },
    ],
  },

  indicators: [
    { id: 'flat', label: 'The feeling is erased', hint: 'After recasting it reads like another person’s life; the emotion is gone' },
    { id: 'contempt', label: 'A cold, self-critical tone', hint: 'Third person has turned into a stance for judging yourself' },
    { id: 'blur', label: 'Pronouns blur', hint: 'While reading you cannot tell whether it is “he” or “I”' },
    { id: 'numb', label: 'Feeling nothing', hint: 'After writing you are not clearer, only emptier' },
  ],

  /* ── Stub engine output (read by mock/engine.js) ── */

  stub: {
    sample: `The project review was this afternoon. I had prepared for two weeks. When I finished presenting, he pushed my proposal straight back at me and said, "This is what you did with two weeks?" Four other people were sitting in the room. I could hear my own heartbeat.

I said nothing. I smiled and said, "Okay, I will rework it." On the way back to my desk I kept thinking: why am I always like this, why can I never say it clearly in the moment. I felt completely useless, two weeks thrown away. My hands were still shaking at dinner.

I know the proposal can be fixed. But what I keep thinking about is not the proposal. It is his tone, and the faces of those four people.`,
    fail: `He was turned down in front of everyone at the review. Those four people were looking at him. He heard his own heartbeat, but he said nothing, only smiled and said "Okay, I will rework it." He had prepared for two weeks. Two weeks thrown away. Once again he proved he is not good enough. That is the kind of person he is — useless at everything. He cannot even speak up for himself in the moment.`,
    pass: `He lost the foothold of two weeks of work in that review. He had assumed that being well prepared meant being safe, but the feedback pointed to a direction he had not considered, and the tone turned "the proposal needs changes" into "this person is not good enough". What this shows is that tying a rejected proposal to being an inadequate person was a bond he added himself — it did not happen in that room. What he can do next is break the feedback into items he can revise, instead of trying to prove himself.`,
    warmth: `What he felt today was humiliation, and the humiliation is real. It does not need to be erased, and it does not need to be judged. Being questioned in front of others hurts; anyone in that position would hurt — this is not his personal weakness. He did prepare as well as he could, and the effort itself was not rejected. He can be gentler with himself, and then do what needs to be done, one item at a time.`,
  },

  evidence: {
    fail: {
      insight: 'No statement about a pattern of the self; only a list of event details.',
      meaning: 'Does not say what this event means.',
      causal: 'Does not answer why this happened; it only repeats "that is the kind of person he is".',
      closure: 'No closure; the last sentence returns to self-condemnation.',
      action: 'No forward step; "useless at everything" is a conclusion, not an action.',
    },
    pass: {
      insight: '"Tying a rejected proposal to being an inadequate person was a bond he added himself" — his own attribution pattern becomes visible.',
      meaning: '"It did not happen in that room" — the event is separated from the interpretation.',
      causal: '"He had assumed that being well prepared meant being safe" — a causal explanation is given.',
      closure: 'It closes on "instead of trying to prove himself"; the loop is interrupted.',
      action: '"Break the feedback into items he can revise" — points to a concrete next step.',
    },
  },
}