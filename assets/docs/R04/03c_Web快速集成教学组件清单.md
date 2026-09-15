# 可快速集成到 Web 应用的教学插件与组件清单

**编制日期**：2026-09-10
**定位**：与 `03b_GitHub开源清单.md` 互补——03b 收的是"AI 平台与成套大工具"，本清单收的是**能直接嵌进你自己开发的教学 Web 应用的组件、插件与数据源**（一行 script / npm 安装 / iframe 嵌入即用）。
**数据核验**：标注具体星数的均为 2026-09-10 GitHub 实时检索核验；标"≈"为量级估计（成熟知名项目，未逐一核验）；官网类（GeoGebra、Desmos、PhET、Teachable Machine）无 GitHub 星数概念。
**集成难度图例**：★ = iframe/一行代码直接嵌入；★★ = 前端库（npm 或 CDN script）；★★★ = 需自托管或后端配合。

---

## ⚠️ 先看地图合规红线（涉及地理类组件必读）

- **Leaflet、MapLibre、OpenLayers、Cesium 若直接调用 OpenStreetMap / Mapbox / Google 瓦片，属不合规图源**，不得用于正式教学场景。
- 合规图源仅四家：**腾讯位置服务、高德（AMap）、百度地图、天地图 NASG**。Leaflet 等引擎可搭配天地图瓦片或高德 JSAPI 使用（坐标系注意 GCJ-02）。
- Cesium 做纯"太空视角地球演示"（不叠加国界线）可用；**一旦涉及中国疆域呈现，界线必须用自然资源部标准地图（带审图号）审校**，AI 生成地图一律禁止（同 02d 红线清单）。
- 前端代码中不得明文写地图 API key，教育用途也应配置域名白名单或后端代理。

---

## 一、语文·汉语

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **hanzi-writer** | github.com/chanind/hanzi-writer | 4,960 | 汉字笔顺动画+描红练习测验 | ★★ npm/CDN，几行代码 | 低年级写字课、笔顺纠错、生字卡 |
| hanzi-writer-data | github.com/chanind/hanzi-writer-data | 749 | 9000+汉字笔顺数据 | 数据文件 | 配合上条自托管（离线教室可用） |
| **chinese-poetry** | github.com/chinese-poetry/chinese-poetry | 53,392 | 最全古诗词数据库：5.5万唐诗+26万宋诗+2万词 | ★ 数据JSON直接fetch | 飞花令游戏、诗词卡片、单元诗词检索 |
| **chinese-xinhua** | github.com/pwxcoo/chinese-xinhua | 11,675 | 新华字典数据库：汉字、成语、词语、歇后语 | ★ JSON数据 | 字词闯关、成语接龙、查字工具 |
| **pinyin-pro** | github.com/zh-lx/pinyin-pro | 4,702 | 汉字转拼音（多音字/声调/姓氏/分词） | ★★ npm | 全文注音、拼音检索、输入联想 |
| pinyin | github.com/hotoo/pinyin | 7,828 | 老牌汉字拼音库 | ★★ npm | 同上（功能较简） |
| OpenCC | github.com/BYVoid/OpenCC | ≈13k | 简繁转换 | ★★ npm | 港台用字对比、"一国两字"文化拓展 |
| segmentit | github.com/lauren-fung/segmentit | ≈1k | 纯JS中文分词 | ★★ npm | 词频统计、"信息检索"启蒙课 |
| chinese-poetry-api（诗泉） | github.com/palemoky/chinese-poetry-api | 2,825 | 高性能古诗词 API 服务 | ★★★ 自托管 | 需要后端接口时的现成方案 |

## 二、数学

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **GeoGebra Apps API**（官网） | geogebra.org/docu/GeoGebra_Apps_Embedding | — | 几何/代数/3D/电子表格全套交互引擎 | ★ iframe嵌入 + JS API 双向通信 | 几何画板课、函数参数探究、统计 |
| **Desmos API**（官网） | desmos.com/api | — | 王牌图形计算器 | ★★ JS API（教育免费需申请key） | 函数图像、回归拟合、动态演示 |
| JSXGraph | github.com/jsxgraph/jsxgraph | 1,442 | 交互几何/函数绘图/图表库 | ★★ script标签 | 尺规作图、动态几何、完全离线 |
| Mafs | github.com/stevenpetryk/mafs | ≈4k | React 函数图像组件 | ★★ npm（React） | 几何可视化、数学网页App |
| function-plot | github.com/maurizzzio/function-plot | ≈1.7k | 轻量函数绘图 | ★★ npm | 快速画函数 |
| MathLive | github.com/arnog/mathlive | ≈2.5k | 所见即所得数学公式输入框 | ★★ WebComponent | 公式答题输入、在线作业 |
| KaTeX | github.com/KaTeX/KaTeX | ≈19k | 极快公式渲染 | ★★ script | 试卷/讲义排版 |
| MathJax | github.com/mathjax/MathJax | ≈6.5k | 全功能公式渲染 | ★★ script | 兼容性要求高时 |
| **Univer** | github.com/dream-num/univer | 14,335 | Web版 Excel/Word/PPT 全家桶 SDK | ★★ npm | 数学实验记录表、统计课、综合与实践 |
| x-spreadsheet | github.com/myliang/x-spreadsheet | 14,587 | 轻量 Excel 组件（已迁 wolf-table） | ★★ npm | 简单数据表 |
| SheetJS | github.com/SheetJS/sheetjs | 36,339 | 读写 xlsx/csv 数据 | ★★ npm | 成绩单导入导出、数据采集 |
| Handsontable | github.com/handsontable/handsontable | 22,040 | 数据网格/表格编辑 | ★★ npm | ⚠️ 商用收费，校内免费版需确认条款 |

## 三、物理

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **PhET 交互模拟**（官网） | phet.colorado.edu | — | 160+ 个物理/化学/生物/地学模拟，科罗拉多大学出品 | ★ 官方支持 iframe 嵌入 | 虚拟实验首选：电路、波、力与运动 |
| matter-js | github.com/liabru/matter-js | 18,396 | 2D 刚体物理引擎 | ★★ npm/CDN | 力学小游戏、碰撞/重力探究、编程+物理跨学科 |
| planck.js | github.com/shakiba/planck.js | ≈5k | Box2D 的 JS 移植，精度高 | ★★ npm | 更精确的物理仿真 |
| p5.js | github.com/processing/p5.js | ≈21k | 创意编程框架 | ★★ script一行 | 仿真+编程双用途（信息科技联动） |
| Manim（03b已列） | — | 40,633 | 数学/物理动画引擎 | Python，成品视频嵌入 | 交叉引用 03b |

## 四、化学

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **3Dmol.js** | github.com/3dmol/3Dmol.js | 1,016 | WebGL 分子 3D 查看器 | ★★ 一行 script + div | 分子结构、晶体模型、旋转观察 |
| Mol* | github.com/molstar/molstar | 1,007 | 蛋白质/大分子 3D 查看器（支持VR） | ★★ npm | 高中拓展、科研启蒙 |
| Ketcher | github.com/epam/ketcher | 882 | 网页分子结构编辑器 | ★★ WebComponent | 画结构式、结构式答题 |
| RDKit-JS | github.com/rdkit/rdkit | 3,581 | 化学信息学库（WASM 版 @rdkit/rdkit） | ★★ npm | SMILES 校验、高阶开发 |
| PhET 化学系列 | 同上官网 | — | 分子形状、反应速率、酸碱溶液等 | ★ iframe | 配合实验室课 |

## 五、生物

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| Mol* / 3Dmol.js | 见化学节 | 1,007/1,016 | 蛋白质与分子 3D | ★★ | DNA/蛋白质结构展示 |
| JBrowse 2 | github.com/GMOD/jbrowse-components | 294 | 现代化基因组浏览器 | ★★★ npm/自托管 | 高中拓展、基因组科普 |
| BioJS | biojs.io | — | 上百个生物可视化 Web 组件的组件库注册表 | ★★ 按组件npm | 序列查看、进化树 |
| PhET 生物学系列 | 同上官网 | — | 自然选择、DNA结构与复制等 | ★ iframe | 进化、遗传模拟 |

## 六、地理·天文

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| Leaflet | github.com/Leaflet/Leaflet | ≈42k | 最流行的轻量交互地图 | ★★（底图须换合规源） | 校园地图、乡土地理标注 |
| MapLibre GL JS | github.com/maplibre/maplibre-gl-js | ≈7k | 矢量瓦片地图引擎 | ★★（同上） | 高性能地图应用 |
| OpenLayers | github.com/openlayers/openlayers | ≈12k | 全功能 GIS 前端 | ★★（同上） | 专业 GIS 教学 |
| CesiumJS | github.com/CesiumGS/cesium | ≈13k | 3D 数字地球 | ★★（太空视角可用，见合规框） | 地球运动、太阳系视角 |
| Turf.js | github.com/Turfjs/turf | ≈9.6k | 地理空间计算（面积/距离/缓冲区） | ★★ npm 不涉底图，安全 | "计算学校面积"项目 |
| proj4js | github.com/proj4js/proj4js | ≈2.7k | 坐标系转换 | ★★ npm | GCJ-02/WGS84 换算教学 |
| **SunCalc** | github.com/mourner/suncalc | 3,466 | 太阳/月亮位置与月相计算，3KB 超轻量 | ★★ script | 月相观察课、日出日落探究 |
| **lunar-javascript** | github.com/6tail/lunar-javascript | 1,667 | 农历/节气/干支/生肖全量计算 | ★★ npm | "年、月、日的秘密"主题活动、传统历法 |
| astronomy-engine | github.com/cosinekitty/astronomy | ≈3k | 高精度天体位置、月相、日食月食计算 | ★★ npm | 日食月食成因演示、天文拓展 |

## 七、音乐·美术

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **Tone.js** | github.com/Tonejs/Tone.js | 14,718 | Web Audio 框架（合成/采样/节拍） | ★★ npm/CDN | 节奏训练、音高听辨、编曲入门 |
| abcjs | github.com/paulrosen/abcjs | 2,335 | ABC 记谱渲染+播放 | ★★ script | 简谱/五线谱展示与试听 |
| VexFlow | github.com/0xfe/vexflow | 4,372 | 五线谱/吉他谱渲染 | ★★ npm | 识谱教学、谱面练习 |
| alphaTab | github.com/CoderLine/alphaTab | 1,828 | 跨平台乐谱渲染+播放 | ★★ npm | 专业曲谱应用 |
| Fabric.js | github.com/fabricjs/fabric.js | ≈29k | Canvas 绘图引擎 | ★★ npm | 美术创作画板、拼贴工具 |
| Konva.js | github.com/konvajs/konva | ≈11.8k | Canvas 图层/变换/滤镜 | ★★ npm | 像素画、对称图案（数学美术跨学科） |
| p5.js | 见物理节 | ≈21k | 创意编程 | ★★ | 生成艺术（艺术×信息科技） |

## 八、英语·语言学习

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **Web Speech API**（浏览器原生） | MDN 文档 | — | 语音合成+语音识别，零依赖 | ★ 内置API | 单词朗读、跟读练习原型（Chrome 支持好） |
| LanguageTool | github.com/languagetool-org/languagetool | ≈13k | 开源语法检查（可自托管 API） | ★★★ 自托管 | 英语写作批改辅助（注意：替代不了教师） |
| Twine | github.com/klembot/twine | ≈4k | 互动小说创作工具，发布为单个 HTML | ★ 导出即嵌入 | 分支剧情阅读、互动故事写作（英语/语文两用） |
| Anki（03b已列） | — | 30,322 | 间隔重复记忆卡 | 桌面/移动 | 词汇复习 |

## 九、信息科技·编程教育

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **Blockly** | github.com/RaspberryPiFoundation/blockly | 13,551 | 积木式可视化编程编辑器（Google 创建，现由树莓派基金会维护） | ★★ script/iframe | 图形化编程、自制编程学习平台 |
| Scratch GUI | github.com/scratchfoundation/scratch-gui | 4,811 | Scratch 3.0 完整界面（⚠️已归档，仍可用） | ★★★ npm | 深度定制校内 Scratch 平台 |
| TurboWarp Packager | github.com/TurboWarp/packager | 344 | 把 Scratch 项目打包成独立 HTML | ★ 网页工具 | 学生作品一键变网页应用、嵌入学校网站 |
| CodeMirror 6 | github.com/codemirror/dev | ≈30k | 轻量代码编辑器 | ★★ npm | 在线编程课编辑器 |
| Monaco Editor | github.com/microsoft/monaco-editor | ≈42k | VSCode 同款编辑器 | ★★ npm | 高年级、社团课 |

## 十、历史·时间线

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **TimelineJS3** | github.com/NUKnightLab/TimelineJS3 | 3,217 | 叙事型多媒体时间线 | ★ iframe（数据用表格维护） | 朝代大事年表、人物年谱 |
| vis-timeline | github.com/visjs/vis-timeline | ≈2k | 可定制时间线组件 | ★★ npm | 精确时间轴交互定制 |

## 十一、跨学科通用：互动课件与测验

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **H5P 内容体系** | h5p.com | — | 50+ 种互动题型：拖拽、视频内答题、虚拟游览、记忆游戏 | ★ iframe 嵌入 | 微课互动化、课件作业 |
| h5p-standalone | github.com/tunapanda/h5p-standalone | 342 | 无需 LMS/服务器播放 H5P 内容 | ★★ script | 把 H5P 嵌进自己的 Web 应用（离线可用的关键） |
| Lumi | lumi.education | ≈1k | 桌面 H5P 编辑器 | 桌面软件 | 让不写代码的老师也能做 H5P |
| **Khan Perseus** | github.com/Khan/perseus | 1,590 | 可汗学院题目编辑与渲染引擎（React） | ★★★ React 组件 | 自建数学/理科题库系统 |
| ECharts | github.com/apache/echarts | ≈62k | 百度捐 Apache 的图表库，中文文档友好 | ★★ npm | 数据可视化（数学/科学/气象站看板） |
| Chart.js | github.com/chartjs/Chart.js | ≈66k | 简洁图表库 | ★★ npm | 快速出图 |
| Plotly.js | github.com/plotly/plotly.js | ≈17k | 科学计算图表（热力图/3D曲面） | ★★ npm | 科学数据绘图 |
| Excalidraw（03b已列） | — | 131,178 | 手绘风白板，提供嵌入组件 | React | 课堂板书 |
| reveal.js | github.com/hakimel/reveal.js | ≈68k | HTML 幻灯片框架 | ★★ script | 网页课件、学生汇报 |
| Slidev | github.com/slidevjs/slidev | ≈35k | 程序员向 PPT（Markdown+代码） | ★★★ Node | 教师中的技术党 |

## 十二、跨学科通用：协作与课堂互动

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| Etherpad | github.com/ether/etherpad-lite | ≈18k | 实时协同文档 | ★★★ 自托管+iframe | 课堂共同写作、小组纪要 |
| CryptPad | github.com/cryptpad/cryptpad | ≈6.7k | 端到端加密协同办公套件 | ★★★ 自托管 | 隐私敏感的协作场景 |
| Particify / ARSnova | github.com/particify/arsnova | 66 | 课堂应答系统（投票/抢答/问答） | ★★★ Docker 自托管 | 替代收费的课堂互动平台 |
| BigBlueButton | github.com/bigbluebutton/bigbluebutton | ≈11.6k | 面向教学的开源视频会议 | ★★★ 自托管 | 在线课堂、直播授课 |

## 十三、浏览器端 AI（无需后端，学生浏览器里直接跑）

| 组件 | 地址 | Stars | 一句话 | 集成 | 教学场景 |
|---|---|---:|---|---|---|
| **transformers.js** | github.com/huggingface/transformers.js | 16,290 | 在浏览器直接跑 HF 模型（OCR/语音/嵌入/翻译） | ★★ npm | 离线 AI 应用、AI 原理教学演示 |
| **tesseract.js** | github.com/naptha/tesseract.js | 38,694 | 纯浏览器 OCR，支持中文 | ★★ 一行script | 错题本拍照识别（学生数据不出本地！） |
| TensorFlow.js | github.com/tensorflow/tfjs | ≈19k | 浏览器机器学习框架 | ★★ script | AI 编程课 |
| ml5.js | github.com/ml5js/ml5-library | ≈6.4k | 专为教育设计的 TF.js 友好封装 | ★★ script | "三行代码玩 AI"入门 |
| Teachable Machine（官网） | teachablemachine.withgoogle.com | — | 网页训练图像/姿态/声音分类器，导出模型 | ★ 导出模型配合 tfjs | AI 课第一课神器（训练→导出→嵌入自己应用） |
| WebLLM | github.com/mlc-ai/web-llm | ≈20k | 浏览器内跑大语言模型（WebGPU） | ★★ npm | 离线 AI 对话演示 |
| MediaPipe tasks-vision | github.com/google-ai-edge/mediapipe | ≈8k | 手势/姿态/人脸检测 | ★★ npm | 体育动作分析、举手统计、体感互动 |

## 十四、即插即用的开放数据源（fetch 即用）

| 数据源 | 地址 | Key | 一句话 | 教学场景 |
|---|---|---|---|---|
| **Open-Meteo** | open-meteo.com/api | 免费无key | 全球天气 API（实时+历史+预报） | **在线数字气象站项目的现成数据源**：全球任意经纬度温度/降水/风速 |
| USGS Earthquake | earthquake.usgs.gov/api | 免费无key | 全球地震实时数据 | 科学课"地震"单元实时案例地图 |
| NASA APOD / EPIC | api.nasa.gov | 免费DEMO_KEY | 每日天文图/地球深空照 | 科学/美术素材、写话情境 |
| chinese-poetry / chinese-xinhua | 见语文节 | — | 古诗词+字典数据 | 应用后端数据 |
| 自然资源部标准地图服务 | bzdt.ch.mnr.gov.cn | — | 官方标准地图下载（带审图号） | 地理课件的唯一合规地图来源 |

## 十五、平台级自托管（不想自己写应用时的整站方案）

| 项目 | Stars | 一句话 | 适用 |
|---|---:|---|---|
| **学之思 xzs** | 3,900 | Java+Vue 在线考试系统（学生/教师/管理三端） | 校内组卷考试，中文生态好 |
| SpringBoot-Vue-OnlineExam | 2,272 | SpringBoot+Vue 在线考试 | 同类替代 |
| PlayEdu | ≈3k | Java 视频培训/网课平台 | 校本网课 |
| Moodle | ≈5.9k | 全球最大开源 LMS，插件生态之王（GPL） | 想要"什么都有"时的重型方案 |
| Kolibri（03b已列） | 1,111 | 离线优先教育内容平台 | 无网络环境的资源分发 |

---

## 十六、选型小抄：按"我想做一个…"索引组件组合

| 我想做… | 组件组合 | 总工作量 |
|---|---|---|
| 语文飞花令/诗词闯关小程序 | chinese-poetry（数据）+ pinyin-pro（注音）+ ECharts（战力图） | 周末一天 |
| 低年级写字练习页 | hanzi-writer（笔顺）+ h5p-standalone（互动题） | 半天 |
| 数学函数实验室 | GeoGebra Apps iframe + MathLive（公式输入）+ KaTeX | 一天 |
| 校园气象站数据看板 | Open-Meteo（数据）+ ECharts（图表）+ lunar-javascript（节气）+ Turf.js（校区计算） | 两天，**与信息科技课标"在线数字气象站"案例直接对应** |
| 化学分子馆 | 3Dmol.js（3D查看）+ Ketcher（画结构式） | 一天 |
| 月相/历法探究页 | SunCalc + lunar-javascript + astronomy-engine | 一天 |
| 音乐节奏训练小游戏 | Tone.js + abcjs（谱面） | 两天 |
| 校内图形化编程平台 | Blockly + TurboWarp Packager（作品发布） | 一周 |
| 错题本（拍照→题库） | tesseract.js（OCR）+ Khan Perseus（题目渲染）+ SheetJS（导出） | 3—5 天 |
| 课堂即时互动站 | h5p-standalone + Particify（自托管）或纯 H5P iframe | 两天 |
| 体育动作分析实验 | MediaPipe tasks-vision + 摄像头 | 两天（实验性） |
| 学生 AI 第一课 | Teachable Machine（训练）+ ml5.js（嵌入使用） | 零开发，纯网页 |

## 十七、风险与注意事项

1. **地图合规**：见文首红线框。任何在中国境内呈现疆域的画面，先问"底图哪来的、审图号是什么"。
2. **许可证**：Handsontable 商用收费（校内使用前确认条款）；Moodle/ARSnova/部分 H5P 内容类型为 GPL，自托管使用没问题，二次分发修改需开源；课堂工具建议优先 MIT/Apache/BSD 系。
3. **归档/迁移提醒**：scratch-gui 已归档（仍可编译使用）；Luckysheet 已停更转 Univer；TimelineJS 用 v3 不要用 v1。
4. **境外依赖**：CDN 建议国内镜像（npmmirror 等）或直接下载到校内服务器——**教室网络环境永远按最坏情况准备**；涉及学生数据的组件（OCR、照片）优先选浏览器本地运行方案（tesseract.js/transformers.js 恰好都是本地跑，这是它们对教育的核心价值）。
5. **学生隐私**：凡调用云端 API 的方案（语音识别、图像生成），确认服务商合规资质，未成年人数据不外传；本地跑的浏览器 AI 是最安全边界。

**一句话总结**：学科组件看第二至十节（语文 hanzi-writer、数学 GeoGebra、物理 PhET/matter-js、化学 3Dmol、生物 Mol*、地理 Leaflet+合规底图、音乐 Tone.js、信息科技 Blockly、历史 TimelineJS3），通用底座看第十一至十三节（H5P 管互动、ECharts 管图表、tesseract.js/transformers.js 管浏览器 AI），数据源看第十四节（Open-Meteo 直接喂气象站项目）。与自己写代码相比，这些组件能把"做一个学科工具"从几周压缩到几天——这正是给老师做 AI/数字工具培训时最有说服力的现场演示素材。
