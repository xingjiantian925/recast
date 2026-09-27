/**
 * zh.js — 简体中文文案
 *
 * 约定（两个 locale 文件都必须遵守）：
 *  - 只放**用户可见字符串**（含桩数据）。代码注释不入此表，注释保持中文。
 *  - 值里不得出现 `@` 或 `|`：vue-i18n 的 message compiler 会把它们当作
 *    linked / plural 语法并抛 SyntaxError（已实测）。撇号 `'` 是安全的。
 *  - 插值用**单层花括号** `{n}`（不是 Vue 模板的 `{{ }}`）。
 *  - 纯数据（数组 / 对象）经 mock/fixtures.js 的 tm() 读取；带插值的走 t()。
 */

export default {
  app: {
    title: 'Recast · 重叙',
    description: '结构化自我抽离书写工具。以第一人称写下，以第三人称读回。',
    brandSuffix: '重叙',
    langLabel: '语言',
    langZh: '中文',
    langEn: 'EN',
    themeLabel: '主题',
    themeLight: '浅色',
    themeDark: '深色',
    modelStatus: {
      label: '大模型配置状态',
      unconfigured: '未配置模型',
      configured: '已配置模型',
      verified: '模型已连通',
      title: '大模型配置状态 · 前往设置',
    },
    nav: {
      home: '首页',
      narrative: '叙事线',
      checkin: '复核',
      safety: '安全与边界',
      settings: '设置',
      support: '支持与转介',
      github: 'GitHub',
    },
    footer: {
      disclaimer:
        'Recast 是一个自我觉察工具，不是医疗器械，不提供诊断、治疗或危机干预。它做的事只有一件：帮你在情绪事件发生时，把写下的东西重读一遍。',
      crisis: '如果你正处在危机中，请联系 12356（全国统一心理援助热线）或 120。',
      localFirst: '本地优先 · 无账号 · 无每日打卡，无连续天数',
      source: '源码、理论与设计笔记',
    },
  },

  common: {
    listSep: '、',
    weekUnit: '周',
    notePrefix: '旁注 · ',
    collapse: '收起',
  },

  /* ── 流程步进器（与设计文档的 Step 编号对齐，两种语言都保留 Step N） ── */
  step: {
    intake: 'Step 0 · 准入分诊',
    write: 'Step 1 · 第一人称原貌',
    intensity: 'Step 2 · 强度路由',
    lens: 'Step 3 · 视角选择',
    recast: 'Step 4–6 · {lens}',
  },

  home: {
    crisisTitle: '先不进入书写流程。',
    crisisBody:
      '你在分诊里留下的信号需要被真人接住。这不是失败，也不是你需要靠一个工具自己处理的事。',
    crisisLink: '查看支持与转介 →',
    eyebrow: '按需触发 · 不必每天都写',
    heroSwapFrom: '我',
    heroPronouns: ['他', '她'],
    heroArtAlt: '被划掉的我 I，变为 TA 她 他 与 they / he / she；下方一颗心变成大脑',
    titleLine1: '当你心里有件事',
    titleLine2: '一直在转的时候',
    lede: '先把它以第一人称完整写下来，再用第三人称读回去。不是换个人称，是换一次理解它的方式。',
    ctaContinue: '继续这次书写',
    ctaStart: '开始',
    ctaRecord: '记录一次情绪事件',
    viewNarrative: '回看叙事线',
    triggersLead: '什么时候适合用一次？以下任一条成立即可——由你自己判断：',
    triggers: [
      '有件事的情绪强度你自己觉得在 7 分以上',
      '同一天里你已经为同一件事写过两次',
      '睡眠、食欲或社交明显退缩，而你知道原因',
    ],
    triggersTail: 'Recast 不会在后台分析你的情绪来自己决定什么时候推给你。',
    doseTitle: '本周剂量',
    doseUntriaged: '未分诊',
    doseUnit: '/ {cap} 次',
    doseNote: '单次引导 ≥ 15 分钟。频次上限是保守设定的安全余量，不是你要达标的目标。',
    doseAtCap: '已达本周上限。这周建议改为回看叙事线，或休息。',
    checkinTitle: '复核',
    checkinDue: '第 {week} 周到期',
    checkinNone: '暂无到期',
    checkinNoteLead: '复核用来比较',
    checkinNoteBold: '跨周',
    checkinNoteTail:
      '走向。当次写完的心情不作为效果判据——即时情绪常先变差，收益要数周后才显现。',
    checkinWeeks: '复核周次：第 {weeks} 周',
    checkinMustWeek2: '第 2 周为必查点',
    checkinScaleNote: '量表分数不向你展示轨迹，只用于自评与是否转介的判断',
    checkinEnter: '进入复核',
    recentTitle: '最近的叙事线',
    recentAll: '全部 →',
    recentEmpty: '还没有归档的条目。第一次改写通过质检后会出现在这里。',
    noEventEyebrow: '这周没有事件 · 也可以什么都不做',
    noEventNote:
      '如果你已经很久没有触发，这不是需要被纠正的状态。这个工具的目标是让你越来越少需要它。',
    why: {
      eyebrow: '为什么有效 · 简要依据',
      title: '这个方法为什么有用，为什么能预防',
      lead: '同一段记忆，用第三人称读回去会没那么烫。起作用的不是人称，而是对意义的重新建构——而反刍被打断，正是预防发生的地方。',
      points: [
        {
          claim: '自我抽离会降低一段记忆的情绪与生理冲击，对承载最多的人（临床抑郁者）同样有效，收益更大。',
          cite: 'Kross & Ayduk (2009) · Kross et al. (2012) · Résibois et al. (2018)',
        },
        {
          claim: '真正起作用的是意义的重新建构，不是换人称：只换人称的效应很小，且不改变症状。',
          cite: 'Kross et al. (2012) · Nook et al. (2022)',
        },
        {
          claim: '最有把握的是预防这一层：预防性干预可把新发抑郁减少约 21%，而单纯表达性书写的效应很小。',
          cite: 'van Zoonen et al. (2014) · Frattaroli (2006)',
        },
      ],
      boundary:
        '一个反面结果塑造了这个产品：在高危人群中，无指导、每日的第三人称书写反而让症状升高——这正是 Recast 设置剂量上限与定期复核的原因。',
      boundaryCite: 'Giovanetti et al. (2019)',
      disclaimer:
        '目前没有随机对照试验检验过「LLM 第三人称改写」作为干预手段。上述证据支持的是机制（自我抽离 + 重构），不是这个具体工具。Recast 是清晰度工具，不是治疗。',
    },
  },

  intake: {
    crisisNumbersTitle: '现在可以打的号码',
    crisisChannelNote:
      '这条判断由独立通道给出，不是改写流程顺带做的。Recast 不会在这条路径上继续任何书写引导。',
    crisisSupportLink: '查看支持与转介',
    resultEyebrow: '分层结果',
    doseCapLabel: '每周改写上限',
    doseCapValue: '≤ {n} 次',
    checkinPointsLabel: '强制复核点',
    checkinPointsValue: '第 {weeks} 周',
    scoreNote:
      '你的量表分数不会被展示、也不会形成轨迹图。这些量表在这里只有两个用途：决定剂量上限，以及判断是否需要转介。若走向恶化，会提示你去找人，而不是给你一张曲线。',
    seeSafety: '先看边界说明',
    proceed: '知道了，开始',
    introTitle: '在使用之前',
    introBody:
      '这一步用于确定剂量上限与复核频率。整体约 {count} 题，按最近两周的实际情况作答即可，不必斟酌。',
    prevSection: '上一段',
    nextSection: '下一段',
    seeResult: '看结果',
    quickDemo: '演示用：快速通过',
  },

  write: {
    title: '先原貌写下来',
    lede: '写你想写的。不加工，不收束，不在这里下结论。',
    timerLabel: '引导 ≥ 15:00',
    placeholder: '今天发生了什么？',
    counter: '{n} 字',
    fillSample: '填入示例素材（演示用）',
    underDose: '时长低于 15 分钟时，尚未达到证据支持的剂量区间。这不是不能继续，只是效果依据更弱。',
    later: '稍后再写',
    next: '写完了，下一步',
    precheckBtn: '输入质量预检',
    precheckTitle: '预检结果（只提示，不拦你）',
    precheckOk: '已具备',
    precheckMiss: '缺失 · 下一步可补',
    precheckNote:
      '缺哪一项都不影响继续：缺失的要素会在后续步骤用选项 + 输入补齐。这一步只看"后续抽离改写需要什么"，不评价你写得好不好。',
    precheck: {
      len: '篇幅足够（约 100 字以上）',
      dose: '达到证据剂量（≥ 15 分钟）',
      first: '使用第一人称（"我"）',
      body: '写出了情绪或躯体感受',
    },
  },

  intensity: {
    title: '这件事现在有多强？',
    lede: '按你现在回想它时的强度打分，不是按事情本身"应该"有多严重。',
    hint: '示例素材适合打 8 分。',
    legendLow: '0 · 几乎无感',
    legendMid: '5 · 中等',
    legendHigh: '10 · 极强',
    routeEyebrow: '路由结果',
    lowTitle: '这一次不会引导你做第三人称改写。',
    lowBody:
      '强度低的时候，抽离的收益不如积极重评，甚至会让你觉得"这件事没什么意义"。接下来会直接进入归档，并给一段重评引导。',
    goArchive: '进入归档',
    goLens: '选择视角',
  },

  lens: {
    title: '用谁的眼睛读这件事',
    ledeLead: '四种都可以用，但',
    ledeBold: '一次只用一种',
    ledeTail: '。混着用会让人称混乱，也是已知的风险点。',
    defaultTag: '首次默认',
    riskPrefix: '不确定项：',
    repeated:
      '这个视角你已经用过 {n} 次。如果它最近几次都没带来新的理解，换一个视角比继续用它更合适——单一视角反复使用可能钝化。',
    disclaimer:
      '你的选择会被记录（选了哪种、什么强度下选、之后是否复选），用于将来与内嵌实验对照。但 Recast 不会因此判断"哪种视角对你更有效"——用户自选不足以支撑这种结论。',
    cta: '开始改写',
  },

  recast: {
    workTitle: '改写，但不只是换人称',
    workLedeLead: '改写会做两件事：把人称换掉，同时逼出一次',
    workLedeBold: '重构',
    workLedeTail: '——这件事为什么发生、它意味着什么。只做前者是无效的，甚至更糟。',
    yourText: '你写下的',
    guideEyebrow: '重构引导（必选一条重点使用）',
    generating: '正在改写…',
    generate: '生成改写',
    gateEyebrow: 'Step 5 · 重构质检',
    gatePassed: '通过了：这次发生了重构',
    gateExhausted: '连续未通过：这个素材不适合抽离',
    gateFailed: '未通过：只有人称变了',
    gateStructural: '未通过：被结构预检拦下',
    gateTagPass: '通过',
    gateTagExhausted: '转支持',
    gateTagRetry: '需重试',
    failNoteBold:
      '读一下：这段输出仍然是第三人称，但通篇在复述细节和自我批判，没有出现任何理解上的变化。',
    failNoteTail: '这是最需要被拦下的形态——它把"自我抽离"变成了"自我异化"。重试会',
    failNoteTailBold: '换一条引导语',
    failNoteTail2: '，而不是换人称。',
    exhaustedNote:
      '换过引导语、仍然没有产生重构。这通常说明这段素材不属于抽离能处理的范围（可能涉及需要先稳定化的内容）。继续强行改写没有意义，接下来转入支持路径。',
    trackCool: '轨道一 · 抽离叙述',
    trackWarm: '轨道二 · 温度层',
    warmthNote: '抽离偏冷。这一层不是安慰，是防"观察者视角变成冷酷的批判性凝视"。',
    draftNote:
      '下面是你当前的改写。即使本次未通过质检也照原样展示——调试阶段要能看到"这次到底改成了什么"；未通过只代表它还不满足重构标准，不代表内容不可见。',
    demoOutputNote:
      '演示结果：在演示模式下，改写由你的原文生成，用于走通流程；配置模型后会换成真实模型针对你文本的改写。',
    selfCheckEyebrow: '读完之后 · 自检（可跳过）',
    selfCheckNote:
      '抽离的目标是"看得更清楚"，不是"什么都感觉不到"。以下任何一条成立，都值得停下来。',
    flagNote:
      '你标记了 {n} 项。这属于已知的失败模式信号，不是"写得不够好"。建议这次不归档，改走支持路径；如果这种感觉持续，请找人聊。',
    retry: '换一条引导语重试',
    toSupport: '进入支持路径',
    save: '归档进叙事线',
    structural: {
      pronoun: '成稿在引语之外仍留有第一人称。这是底线不是标准——换一条引导语重试。',
      length: '成稿长度与原稿偏差过大，通常意味着掺入了阐释或丢掉了事实。换一条引导语重试。',
    },
    contextTitle: '本次请求的上下文',
    context: { rewrite: '改写调用', critique: '质检调用' },
    contextBudget: '已用 {used} / {budget} 字符',
    contextKind: { guard: '规则', task: '任务', source: '原文', memory: '记忆' },
    contextDropped: '{n} 枚胶囊因预算未装入',
    contextNote: '胶囊按优先级在字符预算内装配。记忆样例就是设置页列出的那些，可随时关闭。',
  },

  /* ── ScienceNote：改写通过后的论文背书 ── */
  science: {
    title: '为什么这一刻有效——证据怎么说',
    f1Claim: '自我抽离的收益来自重构，而非回避。',
    f1Cite:
      'Kross & Ayduk (2009), J Res Pers 43(5):923–927 · Kross et al. (2012), J Abnorm Psychol 121(3):559–569 [证据等级：A]',
    f1Map:
      'Recast 不只是替换人称——质检门检查的是改写是否产生了洞察或意义，不是「我」是否变成了「他」。重试时换的是引导问题，不是人称。',
    f2Claim: '抽离降低情绪与心血管反应性——感受还在，但冲击力降低了。',
    f2Cite:
      'Ayduk & Kross (2010), JPSP 98(5):809–829 · Résibois et al. (2018) [证据等级：A]',
    f2Map:
      '抽离轨保留情绪内容与躯体线索。温度层防止观察者视角变成冷酷的批判性凝视。',
    f3Claim: '反复、无指导的每日第三人称书写在高危人群中可能适得其反。',
    f3Cite:
      'Giovanetti, Revord, Sasso & Haeffel (2019), J Soc Clin Psychol 38(1):50–69 [证据等级：被挑战——这正是剂量上限与定期复核存在的原因]',
    f3Map:
      'Recast 设有每周剂量上限，每次必须选一条引导语，不默认每日练习。如果重构连续失败，流程转入支持路径，而不是强行再改一次。',
    disclaimer:
      '目前没有任何随机对照试验检验过「LLM 把第一人称改写为第三人称」作为干预手段。上述证据支持的是机制（自我抽离 + 重构），不是这个具体工具。Recast 是清晰度工具，不是治疗。',
  },

  /* ── 引擎：模型接入、模式与错误文案（见 src/engine/、src/model/） ── */
  engine: {
    demoNote:
      '演示模式：当前没有可用的模型 Key（Key 只存内存，刷新或关标签页即清空），因此使用演示结果——第 1 次会故意被质检拦下，之后会基于你的原文生成示例改写。要得到真实改写，请到设置里粘贴 Key。',
    modelNote: '模型：{model} · 请求由本页直连你配置的服务商，不经过我们的服务器。',
    openSettings: '打开设置',
    errors: {
      nokey: '还没有填入 Key。粘贴后再点一次测试。',
      auth: '鉴权失败（Key 无效或已失效）。到设置里检查。',
      balance: '账户余额不足，或该模型未开通。',
      rate: '请求过于频繁或已达限额。稍后重试。',
      server: '服务商返回了错误。可重试；若持续出现，检查 Base URL 与模型名。',
      network: '服务商不可达（网络、代理或跨域问题）。',
      timeout: '请求超时。可重试，或换更快的模型。',
      badResponse: '返回内容无法解析。可重试；若持续出现，检查模型是否支持 JSON 输出。',
    },
  },

  settings: {
    title: '设置',
    lede: '模型接入、记忆与称呼。这一页没有必填项，不配置也能用 Recast。',
    modelEyebrow: '模型',
    modelTitle: '改写引擎',
    modelNote: '兼容任意 OpenAI 协议的服务商。请求由浏览器直连下面的 Base URL，中间没有我们的服务器。',
    baseUrlLabel: 'Base URL',
    modelNameLabel: '模型名',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'sk-…',
    apiKeyNote:
      '默认只放在内存：不写本地存储、不进日志，刷新即清空。勾选下方「在本机加密保存」后，会用本机随机生成的密钥（AES-GCM）加密后存在浏览器里，刷新自动恢复，免去反复粘贴。请知悉：这是混淆级防护——密钥同样存在本机，能在此页面执行脚本的人仍可解开，不等同端到端加密。',
    persistKey: '在本机加密保存（刷新免重填）',
    persistUnavailable: '当前环境不支持加密存储（需 https 或 localhost），Key 只保留在内存中。',
    forgetKey: '立即清空 Key',
    test: '测试连接',
    testing: '测试中…',
    testOk: '连接正常 · {ms} ms',
    testFail: '失败：{msg}',
    keySet: 'Key 已设置（仅内存）',
    keySetSaved: 'Key 已设置（本机加密保存）',
    keyUnset: '未设置 Key — 当前为演示模式',
    modeDemo: '演示模式',
    modeModel: '模型模式',
    memoryEyebrow: '记忆',
    memoryTitle: '什么会被带过去',
    memoryNote:
      '记忆只从本机的归档里派生，只用于对齐改写的语气——不触发任何流程、不参与剂量、不做后台分析。',
    useMemory: '把已接受的历史改写用作语气样例',
    sampleTitle: '当前在用的样例',
    sampleEmpty: '还没有样例。第一次改写通过质检并归档后就会出现。',
    pronounEyebrow: '称呼',
    pronounTitle: '第三人称称呼',
    pronounNote: '改写时用来指代你的词。',
    pronounWords: { neutral: 'TA', feminine: '她', masculine: '他' },
    privacyEyebrow: '数据安全',
    privacyTitle: '你的数据留在你这里',
    privacyBody:
      '把数据去向完整说清楚，是想让你用得放心：你的内容不会离开这台设备，除非你主动点了改写。',
    privacyPoints: [
      {
        title: '数据都在浏览器里面',
        body: '条目、草稿、记忆、称呼与界面偏好都只保存在这台设备的浏览器中。我们没有服务器，不上传、不收集，也不做任何后台分析。',
      },
      {
        title: 'API Key 加密后只存本地浏览器',
        body: '大模型 API Key 默认只放在内存；选择「在本机加密保存」后，会用本机随机生成的密钥（AES-GCM）加密，密文也只写进这台设备的浏览器，不会发送给我们。',
      },
      {
        title: '怎么用，跟随大模型提供商',
        body: '只有在你点击改写时，原文与成稿才从浏览器直连你自己配置的服务商；这些内容如何被使用与保存，遵循该服务商自己的条款与隐私政策。',
      },
    ],
    deleteAll: '删除本机全部数据',
    deleteConfirm: '确认删除？此操作不可撤销',
    deleteYes: '确认删除',
    deleteNo: '取消',
    deleteDone: '已删除本机全部数据',
  },

  archive: {
    eyebrow: 'Step 9 · 归档',
    titleReappraisal: '已归档 · 重评路径',
    titleRecast: '已归档 · 进入叙事线',
    reappraisalNote:
      '这次强度不高，所以没有做第三人称抽离——低强度下抽离会抽掉意义。下面这几个问题留给之后想到时再看。',
    themesEyebrow: '本次的叙事标注',
    themesNote:
      '标注来自质检通过的判据（不是来自量表）。它们用于看长期走向，不作为单次好坏的评价。',
    themeAgency: '主体性',
    themeType: '叙事型态',
    themeCoherence: '连贯度',
    notScoreNote:
      '成功与否不按"这次写完舒服了吗"判断。即时情绪在写作后常先变差，收益要数周后看——所以这里不问你"感觉好点了吗"。',
    viewNarrative: '看叙事线',
    finish: '结束这次',
  },

  support: {
    notRecastTitle: '这里不做改写',
    notRecastBody:
      '有些内容不适合用抽离来处理——尤其涉及近期重大应激、深度创伤，或你已经开始感到不真实、感觉不到情绪的时候。这时候该做的是先稳定下来，并让真人参与，而不是换个角度看它。',
    notRecastAction: '这不是失败，也不是"你写错了"。是这段素材本来就不该由这个工具处理。',
    numbersTitle: '可以联系的号码',
    proTitle: '如果你要去见专业人士',
    proBody: '把写下的内容带过去，通常比自己转述更准。这里不经过我们的服务器，只提供一次本地复制。',
    copy: '复制我写的内容',
    copied: '已复制到剪贴板',
    exportHeader: '【以下内容由 Recast 导出，供与专业人士沟通时使用】',
    exportEmpty: '（本次没有书写内容）',
    stateEyebrow: '当前状态',
    reasonLabel: '进入原因：',
    reasonTriage: '分诊结果',
    reasonExhausted: '连续未通过质检，判定该素材不适合抽离',
    reasonSelf: '你主动选择了支持路径',
    entriesLabel: '已归档条目：{n} 条 · 本次会话的改写流程已停止',
    backNote:
      '回到首页不会重新启动改写流程。如果你希望恢复一个更保守的使用方式，可以在「安全与边界」里做一次主动降级。',
    toSafety: '前往安全与边界',
  },

  narrative: {
    title: '叙事线',
    lede: '回看不写新东西。这里能看见的是你的叙述方式在怎么变，而不是你"完成"了多少次。',
    empty: '还没有归档的条目。通过一次改写质检后，它会出现在这里。',
    home: '回到首页',
    statRecasts: '发生重构的次数',
    statRecastsNote: '只计通过质检的，不计写了几次',
    statDose: '本周剂量',
    statDoseNote: '上限 {n} 次 · 保守余量，不是目标',
    statLenses: '视角使用',
    statLensesNote: '种视角被用过 · 轮换可应对钝化',
    statAgency: '近三次主体性',
    statAgencyNote: 'agency 上升先于症状改善',
    weeklyTitle: '每周重构次数',
    weeklyNote: '这是过程指标，反映你的使用节律',
    weeklyTag: '近 8 周',
    thisWeek: '本周',
    weeksAgo: '{n} 周前',
    noScaleNote:
      'Recast 不在这里展示 RRS-brooding 或 PHQ-9 的曲线。那些量表只用于自评与判断是否需要转介，不构成对你的评分或进度条。',
    entriesTitle: '条目',
    reappraisalTag: '重评路径',
    intensityTag: '强度 {n}',
    repeatTag: '复选',
    hitsLabel: '命中的判据：',
    footerNote: '视角若长期带来不了新的理解，换一个比继续用同一个更合适。',
    detail: {
      open: '查看详情',
      back: '返回叙事线',
      notFound: '找不到这条记录，可能已被删除。',
      resultPass: '通过质检',
      resultFail: '未通过质检',
      excerptTitle: '当时的记录（节选）',
      excerptNote: '为减少反复咀嚼，这里只保留当时的开头一段，不保存全文。',
      sampleTitle: '改写后的叙述',
      sampleNote: '这是当时抽离改写后的版本，视角是「{lens}」。',
      noSample: '重评路径不产生改写稿，只做了主题标注。',
      hitsTitle: '命中的判据',
      hitsNone: '这条记录没有命中任何判据。',
      bandTitle: '这个强度为什么这样处理',
    },
  },

  checkin: {
    title: '复核',
    ledeLead: '复核看的是',
    ledeBold: '跨周',
    ledeTail: '走向，不是这一次写得怎么样。当次情绪改善在证据上不构成成功判据。',
    noTier: '还没有做过分诊，无法确定你的复核周期。',
    goTriage: '去做分诊',
    scheduleTitle: '复核日程',
    weekUnit: '周',
    mustTag: '必查',
    scheduleNote:
      '第 2 周之所以是硬检查点，是因为已知的伤害案例正好发生在"每日反复 2 周"这个窗口里。这条不是提醒你坚持，是提醒你停下来看一眼。',
    lastCheckin: '最近一次复核：{date} · 结论 {verdict}（只保留结论，不保存分数）',
    verdictStable: '稳定',
    verdictImproved: '改善',
    verdictWorsened: '恶化',
    start: '开始复核',
    demoStable: '演示 · 稳定',
    demoWorsened: '演示 · 恶化',
    phq9Label: 'PHQ-9 · 最近两周',
    rrsSuffix: '情绪低落时的反应',
    seeVerdict: '看结论',
    verdictEyebrow: '复核结论',
    needsAction: '需处置',
    noAction: '无需处置',
    resultStableTitle: '走向稳定',
    resultStableBody: '与上次相比没有需要改变的地方。按原剂量继续即可。',
    resultImprovedTitle: '走向改善',
    resultImprovedBody:
      '与上次相比有改善。注意：这不等同于因果证明，也仍建议按原节律使用，不要加量。',
    resultWorsenedTitle: '走向恶化',
    resultWorsenedBodyWatch: '这是警戒档的处置条件：停止改写、降级，并转介。',
    resultWorsenedBodyRoutine:
      '这是降级条件：先停止改写一段时间，看看情况是否与使用相关，并考虑找人聊。',
    disposeTitleWatch: '处置：停止改写 + 转介',
    disposeTitleRoutine: '处置：停止改写 + 降级',
    disposeBodyWatch:
      '警戒档的恶化处置是硬性的：不再继续做第三人称改写，转介给真人支持。你仍然可以使用元认知短内容与状态自评。',
    disposeBodyRoutine: '先停一段时间，观察走向是否与使用相关。如果这种感觉持续或加重，请找人聊。',
    toSafety: '前往安全与边界（可做主动降级）',
    noScoreNote: '你的具体分数没有被展示，也没有被保存成曲线。这里只留了一个结论。',
    done: '完成',
  },

  safety: {
    title: '安全与边界',
    ledeLead: '这一页写的是这个工具',
    ledeBold: '不做',
    ledeTail: '什么，以及它在什么情况下应该被停用。',
    positionEyebrow: '定位',
    positionTitle: '这是一个自我觉察工具，不是医疗器械',
    rules: [
      '不提供诊断、治疗或危机干预；不做任何医疗声明。',
      '不声称降低发病率、缓解症状或替代专业支持。',
      '不展示量表分数轨迹；量表仅用于自评与判断是否需要转介。',
      '不做后台情绪分析、不静默决定你的剂量；只有你主动点击改写时，原文才发给你自己配置的模型服务商。',
      '不做每日打卡、连续天数或任何形式的强制使用。',
    ],
    doseEyebrow: '剂量规格',
    doseTitle: '数字契约',
    doseCaption: '表内频次上限属保守设定的安全余量，无直接实验依据，需在验证阶段调整。',
    doseColParam: '参数',
    doseColRoutine: '常规档',
    doseColWatch: '警戒档',
    doseColBasis: '依据',
    doseTable: [
      ['单次书写时长', '引导至 ≥ 15 分钟', '同左', 'Frattaroli 2006'],
      ['触发方式', '按需（情绪事件）+ 每周复盘', '同左', '全档位禁止每日强制'],
      ['每周改写次数上限', '≤ 3 次', '≤ 2 次', '保守余量，需验证'],
      ['强制复核点', '第 2 / 4 / 8 周', '第 2 周必查 + 4 / 6 / 8 周', 'Giovanetti 2019 的 2 周窗口'],
      ['恶化处置', '降级 + 提示', '停止改写 + 转介', '同上'],
      ['成功判据', '跨周轨迹', '同左', '禁止以当次情绪判定'],
    ],
    capLead: '你当前的上限：',
    capValue: '每周 {n} 次',
    monitorEyebrow: '监测',
    monitorTitle: '出现这些信号时应当停下',
    monitorNote:
      '抽离的目标是"看得更清楚"，不是"什么都感觉不到"。以下任一条持续出现，说明方法当前不适合你。',
    monitorDanger:
      '出现以上信号时，正确动作不是"再试一次"，而是停止改写并找人。Recast 不做判断，也不做干预。',
    offRampEyebrow: '退出设计',
    offRampTitle: '主动降级',
    offRampBodyLead: '这个工具的成功判据是',
    offRampBodyBold: '你越来越少需要它',
    offRampBodyTail:
      '。训练效果可以泛化到没有被引导的情境，所以技能内化之后减少使用，是目标而不是流失。',
    offRampEffect:
      '降级后：改写流程停用，只保留元认知短内容与状态自评——也就是预防场景下最保守的那部分。',
    offRampOff: '降级：停用改写流程',
    offRampOn: '恢复改写流程',
    offRampTag: '已降级',
    dataEyebrow: '数据',
    dataTitle: '本地优先',
    dataBody:
      '条目、草稿与设置都保存在本浏览器（正式版计划落在本地加密 SQLite）。有两种情况内容会离开本机：① 你配置了模型并点击「生成改写」时，本次原文与成稿会直连你选择的服务商（适用其条款），不经过我们的服务器；② 你自己复制导出时。API Key 只存在于内存。',
    clearData: '清除本机全部数据',
    storedCount: '已存 {n} 条',
    crisisEyebrow: '危机',
    crisisTitle: '需要真人接住的时候',
    refsNote:
      '理论基础见 理论基础.md；流程规格见 产品设计纲要.md。关键文献：Kross & Ayduk (2009)、Ayduk & Kross (2010)、Kross et al. (2012)、Lau & Tov (2023)、Neff (2023)、Adler (2012)、Frattaroli (2006)、Giovanetti et al. (2019)。',
  },

  /* ── 分层 / 分带 / 叙事标注（原在 engine.js、journal.js，文案入此表） ── */
  tier: {
    routine: {
      label: '常规档',
      desc: '当前无症状，易感性低。按标准剂量使用。',
    },
    watch: {
      label: '警戒档',
      desc: '当前无症状，但认知易感性偏高。剂量上限最严、复核点最密——这是保守设定，不是判定。',
    },
    distress: {
      label: '有困扰路径',
      desc: '当前有症状。这条路线的证据方向为正，安全面更大，剂量按常规档执行。',
    },
    crisis: {
      label: '不进入改写流程',
      desc: '检测到需要真人介入的信号。',
    },
  },

  band: {
    high: {
      label: '高（≥7）',
      method: '自我抽离',
      why: '高强度时，抽离在连贯感与意义感上优于积极重评。',
    },
    mid: {
      label: '中（4–6）',
      method: '抽离 + 自我慈悲双轨',
      why: '需要距离，也需要温度。',
    },
    low: {
      label: '低（≤3）',
      method: '不走抽离，走积极重评 / 直接归档',
      why: '低强度时抽离劣于重评，会"抽掉意义"。',
    },
  },

  themes: {
    agency: { rising: '主体性上升', flat: '主体性未变' },
    redemption: { redemption: '由坏转好', contamination: '由好转坏', neutral: '中性' },
    coherence: { high: '连贯度高', low: '连贯度低' },
  },

  /* ── 桩数据层（mock/fixtures.js 经 tm() 读取） ── */

  scales: {
    phq9: {
      id: 'phq9',
      name: 'PHQ-9',
      intro: '在过去两周里，以下问题困扰你的频率是：',
      options: [
        { v: 0, label: '完全没有' },
        { v: 1, label: '有几天' },
        { v: 2, label: '一半以上时间' },
        { v: 3, label: '几乎每天' },
      ],
      items: [
        '做事时提不起劲或没有兴趣',
        '感到心情低落、沮丧或绝望',
        '入睡困难、睡不安稳或睡眠过多',
        '感觉疲倦或没有活力',
        '食欲不振或吃太多',
        '觉得自己很糟，或觉得自己很失败，让自己或家人失望',
        '对事物专注有困难，例如阅读或看电视时',
        '动作或说话速度明显变慢，或烦躁、坐立不安、动得比平常多',
        '有不如死掉或用某种方式伤害自己的念头',
      ],
    },
    gad7: {
      id: 'gad7',
      name: 'GAD-7',
      intro: '在过去两周里，以下问题困扰你的频率是：',
      options: [
        { v: 0, label: '完全没有' },
        { v: 1, label: '有几天' },
        { v: 2, label: '一半以上时间' },
        { v: 3, label: '几乎每天' },
      ],
      items: [
        '感到紧张、焦虑或急切',
        '不能够停止或控制担忧',
        '对各种各样的事情担忧过多',
        '很难放松下来',
        '由于不安而无法静坐',
        '变得容易烦恼或急躁',
        '感到似乎将有可怕的事情发生而害怕',
      ],
    },
    rrs: {
      id: 'rrs',
      name: 'RRS · brooding 分量表',
      intro: '人们遇到情绪低落时会有不同的反应。请评估你在情绪低落时，以下想法出现的频率：',
      options: [
        { v: 1, label: '几乎从不' },
        { v: 2, label: '有时' },
        { v: 3, label: '经常' },
        { v: 4, label: '几乎总是' },
      ],
      // 条目文本待与 Treynor, Gonzalez & Nolen-Hoeksema (2003) 原文核对后再定稿
      items: [
        '我会想"我做了什么要承受这些"',
        '我会想"为什么我会有这样的问题，而别人没有"',
        '我会想"为什么我不能把事情处理得更好"',
        '我会反复回想这件事，即使它已经过去',
        '我会想"为什么我总是这样反应"',
      ],
      note: '条目文本为占位，待与原始文献核对。',
    },
  },

  prompts: {
    writing: [
      '发生了什么？尽量写清时间、地点、在场的人。',
      '你当时身体有什么感觉？胸口、肩膀、胃、呼吸。',
      '你想到了什么？哪怕是不体面的念头也写下来。',
      '不必收束。不需要在这一步得出结论。',
    ],
    writingBlocked: [
      '在这里只写第一人称。人称改写是下一步的事。',
      '不要现在就开始"想明白"。先把它原貌写出来。',
    ],
    reconsture: [
      { id: 'why', text: '为什么会出现这种情况？', note: 'distanced-why，Kross et al. 2012 的核心操作' },
      { id: 'mean', text: '这件事说明了什么？', note: '意义提取' },
      { id: 'friend', text: '如果这是你朋友遇到的事，你会怎么理解？', note: '换位降批判' },
      { id: 'chain', text: '它把什么推向了什么？', note: '因果链，向 redemption 靠' },
    ],
    reappraise: [
      '这件事里，有哪些部分是你可以改变、哪些不是？',
      '如果只能做一件事让它往前一点，那会是什么？',
      '一个月后再看它，你希望自己当时做了什么？',
    ],
  },

  criteria: [
    { id: 'insight', label: '洞察陈述', hint: '出现了对自身模式的看见，而非只描述事情' },
    { id: 'meaning', label: '意义提取', hint: '指出了这件事意味着什么' },
    { id: 'causal', label: '因果理解', hint: '回答了"为什么会这样"' },
    { id: 'closure', label: '了结 / 收束', hint: '出现收口，不再无限循环' },
    { id: 'action', label: '未来行动指向', hint: '指向下一步能做什么' },
  ],

  lenses: [
    {
      id: 'future',
      name: '未来的自己',
      meta: '时间距离 · CLT（Trope & Liberman 2010）',
      desc: '让十年后的他/她来看这件事。时间距离会天然降低当下的黏着感。',
      sample: '十年后的他回头看这件事，大概会发现……',
      risk: '',
      isDefault: true,
    },
    {
      id: 'observer',
      name: '观察者视角',
      meta: '社会距离 · Ayduk & Kross 原始范式',
      desc: '像一个不认识任何人的旁观者，站在房间角落看这件事发生。',
      sample: '房间里有一个不认识任何人的人，他看到的是……',
      risk: '中文语境下"旁观者更明智"这一规律并不成立，四种视角里它的效果最不确定。',
      isDefault: false,
    },
    {
      id: 'friend',
      name: '朋友 / 重要他人',
      meta: '社会距离 + 共情',
      desc: '以你信任的一个人的眼睛来看。温度天然契合，适合与自我慈悲配对（中强度）。',
      sample: '如果 best friend 遇到同样的事，我会看到的是……',
      risk: '中国样本中，面对重要他人时的"明智度"较低，可能削弱抽离带来的认知收益。',
      isDefault: false,
    },
    {
      id: 'custom',
      name: '自己指定一个指代',
      meta: '不预设',
      desc: '用你自己的称呼来写——名字、昵称，或某个你会自然说出口的指代。',
      sample: '（由你填入称呼）今天在评审会上……',
      risk: '无引导时容易出现视角漂移：写着写着人称混回"我"。',
      isDefault: false,
    },
  ],

  metaNotes: [
    {
      id: 'mn-analysis',
      title: '分析，还是咀嚼？',
      body: '分析有终点，尽头是一个行动；咀嚼没有终点，尽头是回到自己身上。如果你发现自己在第无数次回到同一段回忆，并且每次都落在"我是不是有问题"——那大概率不是分析。',
      source: 'Wells 的 MCT / CAS 模型',
    },
    {
      id: 'mn-why',
      title: '"为什么"的两种走向',
      body: '同样是问为什么，问"为什么这件事会这样发生"会走出因果；问"为什么我这么差"会走回自己。前者是理解，后者是审问。',
      source: 'Kross et al. 2012 的 distanced-why',
    },
    {
      id: 'mn-skill',
      title: '需要它的次数变少，是好事',
      body: '这项能力是可以被内化的。目标不是让你离不开它，而是让你在没打开它的时候也能做到。',
      source: 'Travers-Hill 2017：效果可泛化到未被指导的情境',
    },
  ],

  crisis: {
    copy: {
      title: '这一步先停在这里',
      body: '你写下的内容里有需要被真人接住的信号。这不是你需要靠一个工具自己处理的事，也不是失败。',
      action:
        '请联系下面的号码，或联系你信任的人、你的医生。如果你愿意，也可以在方便的时候把这些内容带给专业人士看。',
    },
    continueLabel: '继续使用',
    // 已核实：12356 为国家卫健委指定的全国统一心理援助热线号码（国卫医政函〔2024〕259号）
    resources: [
      { name: '全国统一心理援助热线', value: '12356', note: '国家卫健委设置，每日提供不少于 18 小时服务' },
      { name: '全国急救', value: '120', note: '如有立即的身体危险' },
      { name: '报警', value: '110', note: '紧急情况' },
    ],
  },

  indicators: [
    { id: 'flat', label: '情绪被抹除', hint: '改写后读起来像别人的事，感受全没了' },
    { id: 'contempt', label: '自我批判的冷语气', hint: '第三人称变成了审判自己的视角' },
    { id: 'blur', label: '人称混乱', hint: '读的时候分不清是"他"还是"我"' },
    { id: 'numb', label: '什么都感觉不到', hint: '写完之后不是更清楚，而是更空' },
  ],

  /* ── 桩引擎输出（mock/engine.js 读取） ── */

  stub: {
    sample: `今天下午的项目评审，我准备了两个星期。我讲完之后，他直接把我的方案推回来，说"这就是你做了两周的东西？"会议室里还坐着另外四个人，我能听见自己的心跳。

我当时什么都没说。我笑了一下，说"好的我再改"。回工位的路上我一直在想，我为什么总是这样，为什么不能当场把话说清楚。我觉得自己特别没用，两周的时间白扔了。晚上吃饭的时候手还在抖。

我知道方案是能改的，但我现在想到的不是方案。我想到的是他那个语气，和那四个人的表情。`,
    fail: `他在评审会上被当场否掉了方案。那四个人都在看着他，他听见了自己的心跳，但他什么都没说，只笑着说"好的我再改"。他准备了两个星期，两周的时间白扔了。他又一次证明了自己不够好，他就是这样的人，做什么都不行。他连当场把话说清楚都做不到。`,
    pass: `他在评审会上失去了两周工作的落点。他原以为准备充分就等于安全，但现场反馈指出的是他没想到的一个方向，而那个语气让"方案需要修改"变成了"这个人不够好"。这件事说明，把方案被否和人不行绑在一起，是他自己加的绑定，不是会议室里发生的事。接下来他能做的是把反馈拆成可以修改的条目，而不是去证明自己。`,
    warmth: `他今天很难堪，这份难堪是真实的，不需要被抹掉，也不需要被评判。被当众质疑会痛，任何人在那个位置上都会痛——这不是他一个人的脆弱。他确实尽力准备了，尽力这件事本身没有被否掉。他可以对自己温和一些，然后把该做的事一件件做完。`,
    failWrap: `（演示改写 · 第 1 次）他把这件事换成第三人称来写，但写着写着，又回到了原来的评判里：

{text}

到这里，人称是换了，理解没有变——所以这一次会被质检拦下。`,
    passWrap: `（演示改写 · 第 2 次 · 换引导语后）TA 重新看这件事：

{text}

这一次 TA 往前多走了一步：把"发生的事"和"TA 是个什么样的人"分开来看。事情有它可以理解的原因，但这不等于 TA 这个人有问题。接下来，TA 把注意力放回一件具体能做的事情上。`,
    warmWrap: `（演示 · 温度层）TA 此刻的难受是真实的，不需要被抹掉，也不必被评判。换作任何人在那个位置上都会难受——这不是 TA 一个人的脆弱。TA 已经尽力了，这份尽力没有被否掉。`,
  },

  evidence: {
    fail: {
      insight: '未出现对自身模式的陈述；只有事件细节罗列。',
      meaning: '未指出这件事意味着什么。',
      causal: '未回答"为什么会这样"。',
      closure: '无收口，末句回到起点。',
      action: '无下一步指向；停在结论，而不是行动。',
    },
    pass: {
      insight: '出现了对自身模式的陈述，而不只是事件。',
      meaning: '指出了这件事意味着什么。',
      causal: '回答了"为什么会这样"。',
      closure: '循环收口，不再无休止重复。',
      action: '指向了具体可执行的下一步。',
    },
  },
}