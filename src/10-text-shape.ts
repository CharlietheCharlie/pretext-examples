// ============================================================
// 範例 10：文字填滿自訂圖案（動畫版）
//
// 原理：
//   1. 把大字（例如 "SOS"）畫到一個隱藏的 offscreen canvas
//   2. 逐行掃描像素，找出每行裡有墨水的連續 x 區間（spans）
//   3. 對每個 span 呼叫 layoutNextLine()，用 span 的寬度當 maxWidth
//   4. 先把所有排版結果存起來，再用 requestAnimationFrame 逐步畫出來
//
// 動畫做法：
//   - 預先算好所有行的排版結果（位置、文字）
//   - 每幀多畫幾行，用 requestAnimationFrame 驅動
//   - 文字就像打字機一樣逐行浮現，填滿圖案
// ============================================================
import { prepareWithSegments, layoutNextLine, type LayoutCursor } from '@chenglou/pretext'

const fillText = 'SOS SOS SOS SAVE OUR SOULS SAVE OUR SOULS SAVE OUR SOULS SOS SOS SOS HELP HELP HELP MAYDAY MAYDAY MAYDAY SOS SOS SOS SAVE OUR SOULS SAVE OUR SOULS SOS SOS SOS HELP HELP HELP MAYDAY MAYDAY MAYDAY SOS SOS SOS SAVE OUR SOULS SAVE OUR SOULS SOS SOS SOS HELP HELP HELP MAYDAY MAYDAY MAYDAY SOS SOS SOS SAVE OUR SOULS SAVE OUR SOULS SOS SOS SOS HELP HELP SOS SOS SOS SAVE OUR SOULS SAVE OUR SOULS SOS SOS SAVE OUR SOULS '

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const shapeInput = document.getElementById('shapeText') as HTMLInputElement
const shapeFontSelect = document.getElementById('shapeFont') as HTMLSelectElement
const fillFontSelect = document.getElementById('fillFont') as HTMLSelectElement
const sizeSlider = document.getElementById('sizeSlider') as HTMLInputElement
const sizeLabel = document.getElementById('sizeLabel') as HTMLSpanElement
const fillSizeSlider = document.getElementById('fillSizeSlider') as HTMLInputElement
const fillSizeLabel = document.getElementById('fillSizeLabel') as HTMLSpanElement
const output = document.getElementById('output') as HTMLPreElement

type Span = { x: number; width: number }

// 預先算好的一筆繪製指令
type DrawCommand = { text: string; x: number; y: number }

// 目前正在跑的動畫 ID，用來在參數改變時取消舊動畫
let activeAnimationId = 0

function scanShapeSpans(
  shapeText: string,
  fontSize: number,
  fontFamily: string,
): { spans: Span[][]; width: number; height: number } {
  const offscreen = document.createElement('canvas')
  const shapeFont = `bold ${fontSize}px "${fontFamily}", Impact, sans-serif`
  const offCtx = offscreen.getContext('2d')!
  offCtx.font = shapeFont
  const metrics = offCtx.measureText(shapeText)

  const padding = 20
  const w = Math.ceil(metrics.width) + padding * 2
  const h = fontSize + padding * 2
  offscreen.width = w
  offscreen.height = h

  offCtx.fillStyle = 'black'
  offCtx.font = shapeFont
  offCtx.textBaseline = 'top'
  offCtx.fillText(shapeText, padding, padding)

  const imageData = offCtx.getImageData(0, 0, w, h)
  const pixels = imageData.data

  const allSpans: Span[][] = []
  for (let y = 0; y < h; y++) {
    const rowSpans: Span[] = []
    let inSpan = false
    let spanStart = 0

    for (let x = 0; x < w; x++) {
      const alpha = pixels[(y * w + x) * 4 + 3]!
      const hasInk = alpha > 80

      if (hasInk && !inSpan) {
        inSpan = true
        spanStart = x
      } else if (!hasInk && inSpan) {
        inSpan = false
        rowSpans.push({ x: spanStart, width: x - spanStart })
      }
    }
    if (inSpan) {
      rowSpans.push({ x: spanStart, width: w - spanStart })
    }
    allSpans.push(rowSpans)
  }

  return { spans: allSpans, width: w, height: h }
}

// --- 預先算好所有繪製指令 ---
function computeDrawCommands(
  spans: Span[][],
  height: number,
  fillFont: string,
  fillFontSize: number,
): DrawCommand[] {
  const lineHeight = fillFontSize + 2
  const prepared = prepareWithSegments(fillText, fillFont)
  const commands: DrawCommand[] = []
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }

  for (let y = 0; y < height; y += lineHeight) {
    const sampleY = Math.min(y + Math.floor(lineHeight / 2), height - 1)
    const rowSpans = spans[sampleY]!

    for (const span of rowSpans) {
      if (span.width < fillFontSize) continue

      let line = layoutNextLine(prepared, cursor, span.width)
      if (line === null) {
        // 文字用完了，從頭循環
        cursor = { segmentIndex: 0, graphemeIndex: 0 }
        line = layoutNextLine(prepared, cursor, span.width)
        if (line === null) continue
      }
      commands.push({ text: line.text, x: span.x, y })
      cursor = line.end
    }
  }

  return commands
}

// --- 動畫：逐步畫出預算好的指令 ---
function render(): void {
  // 取消之前的動畫
  const animationId = ++activeAnimationId

  const shapeText = shapeInput.value || 'SOS'
  const shapeFontSize = Number(sizeSlider.value)
  const shapeFontFamily = shapeFontSelect.value
  const fillFontSize = Number(fillSizeSlider.value)
  const fillFontFamily = fillFontSelect.value
  const fillFont = `${fillFontSize}px "${fillFontFamily}", monospace`

  sizeLabel.textContent = shapeFontSize + 'px'
  fillSizeLabel.textContent = fillFontSize + 'px'

  // 掃描 + 預算所有繪製指令
  const { spans, width, height } = scanShapeSpans(shapeText, shapeFontSize, shapeFontFamily)
  const commands = computeDrawCommands(spans, height, fillFont, fillFontSize)

  // 設定 canvas
  canvas.width = width
  canvas.height = height
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  // 每幀畫幾行（控制動畫速度）
  const linesPerFrame = Math.max(1, Math.ceil(commands.length / 60))
  let drawn = 0

  output.textContent =
    `圖案: "${shapeText}"\n` +
    `填充行數: ${commands.length}\n` +
    `動畫中... 0%`

  function animateFrame(): void {
    // 如果參數改變了，這個動畫就停掉
    if (animationId !== activeAnimationId) return

    const end = Math.min(drawn + linesPerFrame, commands.length)

    ctx.font = fillFont
    ctx.fillStyle = '#e94560'
    ctx.textBaseline = 'top'

    // 畫這一幀的幾行
    for (let i = drawn; i < end; i++) {
      const cmd = commands[i]!
      ctx.fillText(cmd.text, cmd.x, cmd.y)
    }

    drawn = end
    const pct = Math.round((drawn / commands.length) * 100)
    output.textContent =
      `圖案: "${shapeText}"\n` +
      `填充行數: ${commands.length}\n` +
      (drawn < commands.length ? `動畫中... ${pct}%` : `完成！`)

    if (drawn < commands.length) {
      requestAnimationFrame(animateFrame)
    }
  }

  requestAnimationFrame(animateFrame)
}

shapeInput.addEventListener('input', render)
shapeFontSelect.addEventListener('change', render)
fillFontSelect.addEventListener('change', render)
sizeSlider.addEventListener('input', render)
fillSizeSlider.addEventListener('input', render)

// 等 Google Fonts 載入完再畫，否則會 fallback 到預設字型
document.fonts.ready.then(render)
