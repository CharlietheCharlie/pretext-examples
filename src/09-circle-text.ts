// ============================================================
// 範例 9：圓形文字排版
//
// 核心原理：
//   圓的方程式 x² + y² = r²
//   在高度 y 的位置，弦寬 = 2 * sqrt(r² - (y - cy)²)
//   把弦寬當作該行的 maxWidth 傳給 layoutNextLine()
//   每行寬度不同 → 文字自然排成圓形
//
// 這正是 layoutNextLine() 的設計目的：
//   每次呼叫可以傳不同的 maxWidth
// ============================================================
import { prepareWithSegments, layoutNextLine, type LayoutCursor } from '@chenglou/pretext'

const text = 'FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US! FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!FLY WITH US!'
const font = '14px "Helvetica Neue", sans-serif'
const lineHeight = 20

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const slider = document.getElementById('slider') as HTMLInputElement
const radiusLabel = document.getElementById('radiusLabel') as HTMLSpanElement
const output = document.getElementById('output') as HTMLPreElement

// 預處理只做一次
const prepared = prepareWithSegments(text, font)

function render(): void {
  const radius = Number(slider.value)
  const diameter = radius * 2
  const padding = 20

  // 設定 Canvas 大小
  const canvasSize = diameter + padding * 2
  canvas.width = canvasSize
  canvas.height = canvasSize
  canvas.style.width = canvasSize + 'px'
  canvas.style.height = canvasSize + 'px'

  const ctx = canvas.getContext('2d')!

  // 畫圓形邊界（參考線）
  const cx = canvasSize / 2 // 圓心 x
  const cy = canvasSize / 2 // 圓心 y
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // --- 逐行排版，寬度跟著圓的弦寬走 ---
  ctx.font = font
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center' // 置中對齊讓圓形更好看

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }

  // 從圓的頂部開始，找第一個能放文字的 y
  // 靠近圓頂弦寬太窄放不下字，所以要跳過
  let y = cy - radius
  let lineIndex = 0
  let info = `半徑: ${radius}px\n\n`

  while (y + lineHeight <= cy + radius) {
    // 計算這一行中心的 y 在圓裡的位置
    const lineCenterY = y + lineHeight / 2
    const dy = lineCenterY - cy

    // 弦寬公式：2 * sqrt(r² - dy²)
    // dy 超出半徑就沒有弦了（不在圓內）
    if (Math.abs(dy) >= radius) {
      y += lineHeight
      continue
    }
    const chordWidth = 2 * Math.sqrt(radius * radius - dy * dy)

    // 弦寬太窄（小於一個字的寬度），跳過這行
    if (chordWidth < 20) {
      y += lineHeight
      continue
    }

    // layoutNextLine：用弦寬當 maxWidth
    const line = layoutNextLine(prepared, cursor, chordWidth)
    if (line === null) break // 文字排完了

    // 置中繪製這一行
    ctx.fillText(line.text, cx, y + lineHeight * 0.8)

    info += `第 ${lineIndex + 1} 行 (弦寬=${chordWidth.toFixed(0)}px): "${line.text}"\n`

    cursor = line.end
    y += lineHeight
    lineIndex++
  }

  radiusLabel.textContent = radius + 'px'
  output.textContent = info
}

slider.addEventListener('input', render)
render()
