/**
 * 个人信息替换接口 / Personal content configuration
 *
 * 日常更新只需要编辑这个文件，详细说明见项目根目录「个人信息替换说明.md」。
 * 双语字段使用 { en: "English", zh: "中文" }；也可以直接写字符串供两种语言共用。
 * 所有示例均为占位内容，请替换为你的真实信息，不代表任何实际成果或经历。
 * 留空的可选字段、链接和图片会自动隐藏；列表可以清空为 []。
 */
window.SITE_DATA = {
  settings: {
    defaultLanguage: "en", // 首次访问默认英文；手动选择的语言会在本浏览器记住。
    storageKey: "personal-academic-homepage", // 多个主页在同一域名下时可改成不同名称。
    title: { en: "Zhenglin Hua", zh: "花政林" },
    description: {
      en: "Personal academic homepage: research, publications, honors, awards, and academic service.",
      zh: "个人学术主页：研究介绍、最新动态、学术论文、荣誉、奖项与学术服务。"
    },
    lastUpdated: "2026-11", // YYYY-MM；不显示请设为 ""。
    deskPet: {
      enabled: true, // Big Fat Fish 大肥鱼网页桌宠开关。
      idleAfter: 3000, // 3 秒没有交互后开始吃米饭并提醒一次；恢复操作后重新计时。
      speechDuration: 6500, // 提示气泡显示时长（毫秒）。
      messages: {} // 可覆盖 photo / paper / code / poke / idle 等文案，支持 { en, zh }。
    },
    appearance: {
      crestWatermark: true, // 勇气徽章背景水印开关。
      crestOpacity: 0.075, // 水印不透明度，0 为完全透明，建议 0.04–0.12，最大 0.2。
      customCursor: true, // 保留原生鼠标，在右下方显示滚球兽跟随挂件；false 关闭。
      cursorTrail: true, // 拖尾开关；减少动画设置下会自动关闭拖尾、跳跃和甩耳。
      cursorSize: 52, // 滚球兽挂件尺寸（像素），支持 36–72。
      cursorSleepAfter: 3000 // 连续静止多久后趴下睡觉（毫秒），默认 3 秒。
    },
    publicationNote: {
      en: "† Equal contribution; * Corresponding author.",
      zh: "† 表示共同贡献，* 表示通讯作者。"
    }
  },

  // 1. 姓名、身份、联系信息、照片、简介、导师与研究方向
  profile: {
    name: { en: "Zhenglin Hua", zh: "花政林" },
    initials: "ZH", // 未设置照片时显示的缩写；留空则从英文姓名自动生成。
    role: { en: "Master · School of Computer Science and Engineering", zh: "硕士 · 计算机科学与工程学院" },
    affiliation: { en: "Southeast University", zh: "东南大学" },
    affiliationUrl: "https://www.seu.edu.cn/", // 学校主页：https://...
    location: { en: "Nanjing, China", zh: "南京，中国" },
    email: "zlhua2003@163.com", // 例如 name@university.edu；留空则隐藏。
    image: "assets/myphoto.jpeg", // 将照片放入 dist/assets/，这里填写 "assets/profile.jpg"。
    imageAlt: { en: "Profile photo", zh: "个人照片" },
    bio: {
      en: "I am currently an M.S. student in Artificial Intelligence at Southeast University, under the supervision of Prof. Yuheng Jia. Before that, I obtained my B.Eng. degree from Jiangnan University in 2025. My research focuses on Multimodal Large Language Models (MLLMs) and Trustworthy Machine Learning, including hallucination mitigation and model interpretability. Welcome researchers from all fields to exchange ideas and engage in discussions with me, so that we can learn and grow together.",
      zh: "我目前是东南大学人工智能专业的硕士研究生，师从贾育衡教授。在此之前，我于 2025 年毕业于江南大学，获得工学学士学位。我的研究方向主要包括多模态大语言模型（MLLMs）和可信机器学习，涵盖幻觉缓解和模型可解释性等方面。欢迎来自各个领域的研究者与我交流思想、探讨问题，共同学习与成长。"
    },
    advisor: {
      name: { en: "Prof. Yuheng Jia", zh: "贾育衡教授" }, // 与 bio 中的称呼一致，自动将简介中的姓名变成链接。
      url: "https://jyh-learning.github.io/"
    },
    interests: [
      { en: "Multimodal Large Language Models", zh: "多模态大语言模型" },
      { en: "Hallucination Mitigation", zh: "幻觉缓解" },
      { en: "Model Interpretability", zh: "模型可解释性" }
    ],
    // 空链接会隐藏；可添加更多条目。icon 支持 github / scholar / file / link。
    links: [
      { label: "Google Scholar", url: "https://scholar.google.com/citations?user=SN9il10AAAAJ&hl=zh-CN", icon: "Google Scholar" },
      { label: "GitHub", url: "https://github.com/huazhenglin2003", icon: "Github" },
      // { label: { en: "CV", zh: "个人简历" }, url: "", icon: "file" } // 简历路径如 assets/cv.pdf
    ]
  },

  // 2. 最新动态：按你填写的顺序显示，建议新消息放最前；kind 可为 paper / award / update。
  news: [
    {
      date: "2026.10",
      text: {
        en: "🏅 Honored to receive the National Scholarship for M.S. Students.",
        zh: "🏅 荣获研究生国家奖学金。"
      },
      kind: "award",
      link: ""
    },
    {
      date: "2026.10",
      text: {
        en: '🎉 Our paper "Do Not Train Away Uncertainty: Early Uncertainty Anchored Calibration" is now available on arXiv!',
        zh: "🎉 我们的论文《Do Not Train Away Uncertainty: Early Uncertainty Anchored Calibration》已在 arXiv 公开！"
      },
      kind: "paper",
      link: "https://arxiv.org/abs/2610.12048"
    },
    {
      date: "2026.09",
      text: {
        en: '🎉 Our paper "Attention Heads are Complementary Visual Units: Mitigating Hallucinations in LVLMs via Adaptive Visual Cues Focusing" has been accepted to NeurIPS 2026!',
        zh: "🎉 我们的论文《Attention Heads are Complementary Visual Units: Mitigating Hallucinations in LVLMs via Adaptive Visual Cues Focusing》被 NeurIPS 2026 正式录用！"
      },
      kind: "paper",
      link: "https://neurips.cc/virtual/2026/loc/sydney/poster/149428"
    },
    {
      date: "2026.04",
      text: {
        en: '🎉 Our paper "Finding the Correct Visual Evidence Without Forgetting: Mitigating Hallucination in LVLMs via Inter-Layer Visual Attention Discrepancy" has been accepted to ICML 2026!',
        zh: "🎉 我们的论文《Finding the Correct Visual Evidence Without Forgetting: Mitigating Hallucination in LVLMs via Inter-Layer Visual Attention Discrepancy》被 ICML 2026 正式录用！"
      },
      kind: "paper",
      link: "https://proceedings.mlr.press/v306/xie26m.html"
    },
    {
      date: "2026.03",
      text: {
        en: '🎉 Our paper "Rethinking Representativeness and Diversity in Dynamic Data Selection" is now available on arXiv!',
        zh: "🎉 我们的论文《Rethinking Representativeness and Diversity in Dynamic Data Selection》已在 arXiv 公开！"
      },
      kind: "paper",
      link: "https://arxiv.org/abs/2603.04981"
    },
    {
      date: "2025.08",
      text: {
        en: '🎉 Our paper "Steering LVLMs via Sparse Autoencoder for Hallucination Mitigation" has been accepted to Findings of EMNLP 2025! ',
        zh: "🎉 我们的论文《Steering LVLMs via Sparse Autoencoder for Hallucination Mitigation》被 EMNLP 2025 Findings 正式录用！"
      },
      kind: "paper",
      link: "https://aclanthology.org/2025.findings-emnlp.572/"
    },
    {
      date: "2025.05",
      text: {
        en: '🎉 Our paper "Cracking the Code of Hallucination in LVLMs with Vision-aware Head Divergence" has been accepted to ACL 2025! ',
        zh: "🎉 我们的论文《Cracking the Code of Hallucination in LVLMs with Vision-aware Head Divergence》被 ACL 2025 正式录用！"
      },
      kind: "paper",
      link: "https://aclanthology.org/2025.acl-long.175/"
    }
  ],

  // 3. 论文：按 PDF 原文顺序署名；† 共同贡献，* 通讯作者（含首页 Correspondence to 脚注）。
  // type 决定筛选；authorNames 用于精确高亮你的姓名。核对记录见「论文作者核对记录.md」。
  authorNames: ["Zhenglin Hua", "花政林"],
  publications: [
    // {
    //   title: { en: "Example publication title — replace with your paper", zh: "论文标题示例：请替换为你的论文" },
    //   authors: ["Zhenglin Hua", "Coauthor A", "Coauthor B"], // 可在姓名后写 * 或 †。
    //   venue: { en: "Your conference or journal (example)", zh: "你的会议或期刊名称（示例）" },
    //   venueShort: "VENUE 2026", // 会议缩写及年份，会显示为徽标。
    //   year: "2026",
    //   type: "accepted", // accepted / preprint
    //   ccfRank: "", // 可选：A / B / C；留空不显示。
    //   image: "assets/publications/figure-placeholder.svg", // 换成你的论文图片，留空隐藏。
    //   imageAlt: { en: "Placeholder for your paper's method figure", zh: "论文方法图占位示意" },
    //   summary: {
    //     en: "Summarize the research problem, your main contribution, and a key finding in one or two sentences.",
    //     zh: "用一到两句话介绍研究问题、核心方法和主要结论。"
    //   },
    //   links: [
    //     { label: { en: "Paper", zh: "论文" }, url: "", icon: "file" },
    //     { label: { en: "Code", zh: "代码" }, url: "", icon: "github" },
    //     { label: { en: "Project", zh: "项目主页" }, url: "", icon: "link" }
    //   ]
    // },
    {
      title: {
        en: "Attention Heads are Complementary Visual Units: Mitigating Hallucinations in LVLMs via Adaptive Visual Cues Focusing",
        zh: "Attention Heads are Complementary Visual Units: Mitigating Hallucinations in LVLMs via Adaptive Visual Cues Focusing"
      },
      authors: [
        "Zhenglin Hua",
        "Yutong Xie",
        "Yaxin Hou",
        "Jiawei Tang",
        "Jinghan He",
        "Haiyun Guo*",
        "Junfeng Fang",
        "Yuheng Jia*"
      ],
      venue: {
        en: "The 40th Annual Conference on Neural Information Processing Systems",
        zh: "第40届神经信息处理系统大会"
      },
      venueShort: "NeurIPS 2026",
      year: "2026",
      type: "accepted",
      ccfRank: "A",
      image: "assets/publications/2026_NeurIPS_VerDA_ZhenglinHua_CameraReady_1.pdf",
      imageAlt: { en: "First page of the paper", zh: "论文首页" },
      summary: {
        en: "We reveal that attention heads capture complementary visual cues whose contributions diminish during generation, leading to visual information loss and hallucinations. Building on this insight, we propose VerDA, a training-free method that adaptively reinforces head-specific visual cues while suppressing local textual bias to improve visual grounding.",
        zh: "揭示了不同注意力头之间视觉线索的互补性，以及生成过程中视觉线索逐渐弱化所引发的幻觉问题。在此基础上，提出无需额外训练的 VerDA 方法，通过自适应强化注意力头的视觉线索并抑制局部文本偏置，增强模型的视觉感知能力并缓解幻觉。"
      },
      links: [
        {
          label: {
            en: "Paper",
            zh: "论文"
          },
          url: "https://neurips.cc/virtual/2026/loc/sydney/poster/149428",
          icon: "link"
        },
        {
          label: {
            en: "Code",
            zh: "代码"
          },
          url: "https://github.com/huazhenglin2003/VerDA",
          icon: "github"
        }
      ]
    },
    {
      title: {
        en: "Steering LVLMs via Sparse Autoencoder for Hallucination Mitigation",
        zh: "Steering LVLMs via Sparse Autoencoder for Hallucination Mitigation"
      },
      authors: [
        "Zhenglin Hua†",
        "Jinghan He†",
        "Zijun Yao",
        "Tianxu Han",
        "Haiyun Guo*",
        "Yuheng Jia*",
        "Junfeng Fang*"
      ],
      venue: {
        en: "Findings of the Association for Computational Linguistics: EMNLP 2025",
        zh: "自然语言处理实证方法会议论文集（EMNLP 2025 Findings）"
      },
      venueShort: "EMNLP 2025 Findings",
      year: "2025",
      type: "accepted",
      ccfRank: "B",
      image: "assets/publications/2025.findings-emnlp.572_1.pdf",
      imageAlt: { en: "First page of the paper", zh: "论文首页" },
      summary: {
        en: "We propose SSL, a plug-and-play hallucination mitigation method that leverages sparse autoencoders to identify interpretable latent directions associated with faithfulness and hallucination. By steering internal model representations, SSL reduces hallucinations while preserving semantic consistency and inference efficiency.",
        zh: "提出基于稀疏自编码器的模型引导方法 SSL，通过识别与生成忠实性及幻觉相关的可解释潜在表征方向，对模型内部表示进行精细化干预，在保持语义一致性与推理效率的同时有效缓解多模态大模型幻觉。"
      },
      links: [
        {
          label: {
            en: "Paper",
            zh: "论文"
          },
          url: "https://aclanthology.org/2025.findings-emnlp.572/",
          icon: "link"
        },
        {
          label: {
            en: "Code",
            zh: "代码"
          },
          url: "https://github.com/huazhenglin2003/SSL",
          icon: "github"
        }
      ]
    },

    {
      title: {
        en: "Finding the Correct Visual Evidence Without Forgetting: Mitigating Hallucination in LVLMs via Inter-Layer Visual Attention Discrepancy",
        zh: "Finding the Correct Visual Evidence Without Forgetting: Mitigating Hallucination in LVLMs via Inter-Layer Visual Attention Discrepancy"
      },
      authors: [
        "Yutong Xie",
        "Zhenglin Hua",
        "Ran Wang",
        "Wing W. Y. Ng",
        "Xizhao Wang",
        "Yuheng Jia*"
      ],
      venue: {
        en: "Proceedings of the 43rd International Conference on Machine Learning",
        zh: "第43届国际机器学习大会"
      },
      venueShort: "ICML 2026",
      year: "2026",
      type: "accepted",
      ccfRank: "A",
      image: "assets/publications/icml2026_1.pdf",
      imageAlt: { en: "First page of the paper", zh: "论文首页" },
      summary: {
        en: "We propose ILVAD, a training-free hallucination mitigation method that exploits inter-layer visual attention discrepancies to identify relevant visual evidence. By reinforcing visual attention and mitigating visual forgetting during generation, ILVAD improves the faithfulness of LVLM outputs.",
        zh: "提出基于层间视觉注意力差异的幻觉缓解方法 ILVAD，利用不同网络层对视觉信息的注意力差异识别关键视觉证据，并在生成过程中强化视觉注意力、缓解视觉信息遗忘，从而提升多模态大模型生成内容的忠实性。"
      },
      links: [
        {
          label: {
            en: "Paper",
            zh: "论文"
          },
          url: "https://proceedings.mlr.press/v306/xie26m.html",
          icon: "link"
        },
        {
          label: {
            en: "Code",
            zh: "代码"
          },
          url: "https://github.com/ytx-ML/ILVAD",
          icon: "github"
        }
      ]
    },
    {
      title: {
        en: "Cracking the Code of Hallucination in LVLMs with Vision-aware Head Divergence",
        zh: "Cracking the Code of Hallucination in LVLMs with Vision-aware Head Divergence"
      },
      authors: [
        "Jinghan He",
        "Kuan Zhu",
        "Haiyun Guo*",
        "Junfeng Fang",
        "Zhenglin Hua",
        "Yuheng Jia",
        "Ming Tang",
        "Tat-Seng Chua",
        "Jinqiao Wang*"
      ],
      venue: {
        en: "Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics",
        zh: "第63届计算语言学协会年会"
      },
      venueShort: "ACL 2025",
      year: "2025",
      type: "accepted",
      ccfRank: "A",
      image: "assets/publications/2025.acl-long.175_1.pdf",
      imageAlt: { en: "First page of the paper", zh: "论文首页" },
      summary: {
        en: "We investigate hallucinations in LVLMs through Vision-aware Head Divergence (VHD), revealing the role of vision-sensitive attention heads in visual grounding. Based on these findings, we propose Vision-aware Head Reinforcement (VHR), a training-free method that strengthens visual attention to mitigate hallucinations efficiently.",
        zh: "提出视觉感知注意力头差异指标 VHD，深入分析多模态大模型中视觉敏感注意力头与幻觉现象之间的关系。在此基础上，提出无需额外训练的视觉感知注意力头增强方法 VHR，通过强化模型对视觉信息的关注，高效缓解生成过程中的幻觉问题。"
      },
      links: [
        {
          label: {
            en: "Paper",
            zh: "论文"
          },
          url: "https://aclanthology.org/2025.acl-long.175/",
          icon: "link"
        },
        {
          label: {
            en: "Code",
            zh: "代码"
          },
          url: "https://github.com/jinghan1he/VHR",
          icon: "github"
        }
      ]
    },
    {
      title: {
        en: "Do Not Train Away Uncertainty: Early Uncertainty Anchored Calibration",
        zh: "Do Not Train Away Uncertainty: Early Uncertainty Anchored Calibration"
      },
      authors: [
        "Yutong Xie",
        "Jiawei Tang",
        "Zhenglin Hua",
        "Yuxiang Ma",
        "Si Qin",
        "Yaxin Hou",
        "Hui Liu",
        "Junhui Hou",
        "Yuheng Jia*"
      ],
      venue: {
        en: "arXiv Preprint",
        zh: "arXiv 预印本"
      },
      venueShort: "arXiv 2026",
      year: "2026",
      type: "preprint",
      ccfRank: "None",
      image: "assets/publications/2610.12048v1_1.pdf",
      imageAlt: { en: "First page of the paper", zh: "论文首页" },
      summary: {
        en: "We propose EUA-Cal, an early uncertainty anchored calibration framework that preserves predictive and feature-level uncertainty from early training stages. By leveraging early model predictions and prototype structures, EUA-Cal mitigates overconfidence and improves calibration across diverse models and tasks.",
        zh: "提出早期不确定性锚定校准框架 EUA-Cal，通过保留模型训练早期的预测不确定性与特征空间中的不确定性信息，缓解模型过度自信问题，并提升不同模型与任务中的置信度校准性能。"
      },
      links: [
        {
          label: "arXiv",
          url: "https://arxiv.org/abs/2610.12048",
          icon: "link"
        }
      ]
    },
    {
      title: {
        en: "Rethinking Representativeness and Diversity in Dynamic Data Selection",
        zh: "Rethinking Representativeness and Diversity in Dynamic Data Selection"
      },
      authors: [
        "Yuzhe Zhou",
        "Zhenglin Hua",
        "Haiyun Guo*",
        "Yuheng Jia*"
      ],
      venue: {
        en: "arXiv Preprint",
        zh: "arXiv 预印本"
      },
      venueShort: "arXiv 2026",
      year: "2026",
      type: "preprint",
      ccfRank: "None",
      image: "assets/publications/2603.04981v1_1.pdf",
      imageAlt: { en: "First page of the paper", zh: "论文首页" },
      summary: {
        en: "We revisit representativeness and diversity in dynamic data selection from the perspectives of dataset-level feature coverage and process-level diversity. By combining sparse autoencoder representations, rare-factor sampling, and a usage-frequency penalty, we improve the accuracy-efficiency trade-off in model training.",
        zh: "从数据集级特征覆盖与训练过程级多样性的角度，重新审视动态数据选择中的代表性与多样性。通过结合稀疏自编码器表征、稀有特征采样及使用频率惩罚机制，提升模型训练的准确率与效率之间的权衡表现。"
      },
      links: [
        {
          label: "arXiv",
          url: "https://arxiv.org/abs/2603.04981",
          icon: "link"
        }
      ]
    },

    // {
    //   title: { en: "Example preprint title — introduce ongoing work", zh: "预印本标题示例：介绍你正在进行的研究" },
    //   authors: ["Coauthor A", "Your Name*", "Coauthor B*"],
    //   venue: { en: "Preprint (example)", zh: "预印本（示例）" },
    //   venueShort: "PREPRINT 2026",
    //   year: "2026",
    //   type: "preprint",
    //   ccfRank: "",
    //   image: "",
    //   imageAlt: "",
    //   summary: {
    //     en: "Use this entry for an arXiv preprint or work in progress. Add the paper and code URLs when they are available.",
    //     zh: "这条记录可用于 arXiv 预印本或进行中的研究。公开后可填写论文和代码链接。"
    //   },
    //   links: [{ label: "arXiv", url: "", icon: "file" }]
    // },
    // {
    //   title: { en: "Another example publication — earlier research", zh: "另一篇论文示例：你的早期研究" },
    //   authors: ["Your Name", "Coauthor A"],
    //   venue: { en: "Your conference or journal (example)", zh: "你的会议或期刊名称（示例）" },
    //   venueShort: "VENUE 2025",
    //   year: "2025",
    //   type: "accepted",
    //   ccfRank: "",
    //   image: "",
    //   imageAlt: "",
    //   summary: { en: "Add a concise description of this work and why it matters to your research.", zh: "简要介绍这项工作的内容及其与你研究方向的联系。" },
    //   links: [{ label: { en: "Paper", zh: "论文" }, url: "", icon: "file" }]
    // }
  ],

  // 4. 荣誉：荣誉称号、人才称号等；与下方的具体奖项分别填写。
  honors: [
    {
      date: "2026.10",
      title: { en: "Merit M.S. Students", zh: "三好研究生" },
      organization: { en: "Southeast University", zh: "东南大学" },
      link: ""
    },
    {
      date: "2025.06",
      title: {
        en: "Outstanding Graduate",
        zh: "江南大学优秀毕业生"
      },
      organization: {
        en: "Jiangnan University",
        zh: "江南大学"
      },
      link: ""
    }
  ],

  // 5. 奖项：奖学金、竞赛奖、最佳论文奖等；没有条目时填写 []。
  awards: [
    {
      date: "2026.10",
      title: { en: "National Scholarship for M.S. Students", zh: "硕士生国家奖学金" },
      organization: { en: "Ministry of Education of the People's Republic of China", zh: "中华人民共和国教育部" },
      link: ""
    },
    {
      date: "2026.10",
      title: {
        en: "First-Class Academic Scholarship for Master's Students",
        zh: "东南大学硕士研究生学业一等奖学金"
      },
      organization: {
        en: "Southeast University",
        zh: "东南大学"
      },
      link: ""
    },
    {
      date: "2025.12",
      title: {
        en: 'National Second Prize, 22nd "Huawei Cup" China Post-Graduate Mathematical Contest in Modeling',
        zh: "“华为杯”第二十二届中国研究生数学建模竞赛国家二等奖"
      },
      organization: {
        en: "Chinese Society of Academic Degrees and Graduate Education",
        zh: "中国学位与研究生教育学会"
      },
      link: ""
    },
    {
      date: "2024.12",
      title: {
        en: "National Scholarship for Undergraduate Students",
        zh: "本科生国家奖学金"
      },
      organization: {
        en: "Ministry of Education of the People's Republic of China",
        zh: "中华人民共和国教育部"
      },
      link: ""
    },
    {
      date: "2023.12",
      title: {
        en: "National Scholarship for Undergraduate Students",
        zh: "本科生国家奖学金"
      },
      organization: {
        en: "Ministry of Education of the People's Republic of China",
        zh: "中华人民共和国教育部"
      },
      link: ""
    }
  ],

  // 6. 学术服务：审稿、领域主席、程序委员会等。category 支持 conference / journal / other。
  service: [
    {
      category: "conference",
      venue: {
        en: "International Conference on Learning Representations (ICLR)",
        zh: "国际学习表征会议（ICLR）"
      },
      role: {
        en: "Reviewer",
        zh: "审稿人"
      },
      years: ["2027"],
      link: "https://iclr.cc/Conferences/2027"
    },
    {
      category: "journal",
      venue: {
        en: "IEEE Transactions on Image Processing (TIP)",
        zh: "IEEE 图像处理汇刊（TIP）"
      },
      role: {
        en: "Reviewer",
        zh: "审稿人"
      },
      years: [],
      link: "https://signalprocessingsociety.org/publications-resources/ieee-transactions-image-processing"
    }
  ]
};
