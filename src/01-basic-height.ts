// ============================================================
// 範例 1：量高度 — prepare() + layout()
//
// 核心觀念：
//   prepare() — 做一次性的前處理（分詞 + 量測每個字詞寬度）
//   layout()  — 用快取的寬度做純算術，算出行數和高度（超快）
// ============================================================
import { prepare, layout } from '@chenglou/pretext'

// 要測量的文字（支援中英文混排、emoji）
const text = 'Hello World 你好世界，這是一段測試文字，看看會換幾行 🚀行行行行行行行行行行行行行行行行行行行行行行行行行！'

// font 格式要跟 CSS font shorthand 一致（跟 canvas ctx.font 同格式）
const font = '16px Inter, sans-serif'

// 容器寬度（單位 px）
const maxWidth = 500

// 行高，要跟 CSS line-height 同步
const lineHeight = 24

// --- Step 1: prepare（只做一次） ---
// 內部會用 Intl.Segmenter 分詞，再用 Canvas measureText 量寬度
const prepared = prepare(text, font)

// --- Step 2: layout（可反覆呼叫，非常快） ---
// 純算術，不碰 DOM，不觸發 reflow
const result = layout(prepared, maxWidth, lineHeight)

// 把文字放進 DOM 驗證，同時把 font / width / lineHeight 同步到 CSS
// 這樣改 TS 裡的變數，DOM 也會跟著變
const box = document.getElementById('box')!
box.textContent = text
box.style.font = font
box.style.width = maxWidth + 'px'
box.style.lineHeight = lineHeight + 'px'

// 輸出結果
document.getElementById('output')!.textContent =
  `文字: "${text}"\n` +
  `容器寬度: ${maxWidth}px\n` +
  `行高: ${lineHeight}px\n` +
  `---\n` +
  `計算行數: ${result.lineCount}\n` +
  `計算高度: ${result.height}px (= ${result.lineCount} 行 × ${lineHeight}px)`
