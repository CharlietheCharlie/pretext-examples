// ============================================================
// 範例 2：Resize 時只重跑 layout()
//
// 重點觀念：
//   prepare() 成本較高（~19ms / 500段文字），只在文字改變時做一次
//   layout()  成本極低（~0.09ms / 500段文字），每次 resize 都可以跑
//
//   所以 resize 事件中 ❌ 不要重新 prepare()
//                     ✅ 只要重跑 layout()
// ============================================================
import { prepare, layout } from '@chenglou/pretext'

const text = 'Pretext 不需要 DOM 測量，用 Canvas 字型引擎做底層量測，resize 時只要重跑 layout() 就好。拖動上面的滑桿試試看！'
const font = '16px Inter, sans-serif'
const lineHeight = 24

// ✅ prepare 只做一次
const prepared = prepare(text, font)

const box = document.getElementById('box') as HTMLDivElement
const slider = document.getElementById('slider') as HTMLInputElement
const output = document.getElementById('output') as HTMLPreElement
const widthLabel = document.getElementById('widthLabel') as HTMLSpanElement

box.textContent = text
// 把 font / lineHeight 同步到 CSS，這樣改 TS 變數 DOM 也會跟著變
box.style.font = font
box.style.lineHeight = lineHeight + 'px'

function update(): void {
  const maxWidth = Number(slider.value)
  widthLabel.textContent = maxWidth + 'px'
  box.style.width = maxWidth + 'px'

  // ✅ layout 每次 resize 都跑，成本極低
  const result = layout(prepared, maxWidth, lineHeight)

  output.textContent =
    `容器寬度: ${maxWidth}px\n` +
    `行數: ${result.lineCount}\n` +
    `高度: ${result.height}px`
}

slider.addEventListener('input', update)
update()
