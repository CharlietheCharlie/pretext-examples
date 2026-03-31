// ============================================================
// 範例 3：取得每行文字 — layoutWithLines()
//
// layoutWithLines() 回傳每一行的詳細資訊：
//   line.text  — 該行完整文字，例如 "hello world"
//   line.width — 該行實際寬度（px）
//   line.start — 行起始 cursor { segmentIndex, graphemeIndex }
//   line.end   — 行結束 cursor（exclusive）
//
// 注意：要用 prepareWithSegments()，不是 prepare()
//   prepare()             → 回傳不透明 handle，只能配 layout() 用
//   prepareWithSegments() → 回傳豐富結構，能配所有 rich API 用
// ============================================================
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const text = 'Pretext 支援中文、English、العربية、emoji 🎉🚀 全都能正確斷行排版，這就是 layoutWithLines 的威力！'
const font = '18px "Helvetica Neue", sans-serif'
const maxWidth = 350  // Canvas 內的文字排版寬度
const lineHeight = 28

// --- Step 1: prepareWithSegments（不是 prepare） ---
const prepared = prepareWithSegments(text, font)

// --- Step 2: layoutWithLines 取得每行資訊 ---
const { lines, lineCount, height } = layoutWithLines(prepared, maxWidth, lineHeight)

// --- Step 3: 畫到 Canvas ---
const canvas = document.getElementById('canvas') as HTMLCanvasElement

// 根據排版結果動態調整 Canvas 大小，確保所有行都能顯示
// 必須同時設 canvas 屬性（內部解析度）和 CSS 尺寸（顯示大小）
// 只改 canvas.width 不改 style 的話，瀏覽器會拉伸，文字就變大變模糊
const padding = 10
const canvasW = maxWidth + padding * 2
const canvasH = height + padding + lineHeight
canvas.width = canvasW
canvas.height = canvasH
canvas.style.width = canvasW + 'px'
canvas.style.height = canvasH + 'px'

const ctx = canvas.getContext('2d')!
ctx.font = font
ctx.fillStyle = '#333'

// 逐行繪製
for (let i = 0; i < lines.length; i++) {
  console.log(lines[i])
  ctx.fillText(lines[i]!.text, padding, (i + 1) * lineHeight)
}

// --- 輸出每行的詳細資訊 ---
let info = `總共 ${lineCount} 行, 高度 ${height}px\n\n`
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]!
  info += `第 ${i + 1} 行:\n`
  info += `  文字: "${line.text}"\n`
  info += `  寬度: ${line.width.toFixed(1)}px\n`
  info += `  start: seg=${line.start.segmentIndex}, g=${line.start.graphemeIndex}\n`
  info += `  end:   seg=${line.end.segmentIndex}, g=${line.end.graphemeIndex}\n\n`
}

document.getElementById('output')!.textContent = info
