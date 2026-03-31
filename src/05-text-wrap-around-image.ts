// ============================================================
// 範例 5：文繞圖 — layoutNextLine() + 拖曳圖片
//
// layoutNextLine(prepared, cursor, maxWidth) 的用法：
//   - 從 cursor 位置開始，排出一行文字
//   - 回傳 LayoutLine { text, width, start, end } 或 null（排完了）
//   - 每次呼叫可以傳不同的 maxWidth！
//   - 把上一行的 line.end 當作下一行的 cursor
//
// cursor 結構：
//   { segmentIndex: number, graphemeIndex: number }
//   初始值是 { segmentIndex: 0, graphemeIndex: 0 }
// ============================================================
import { prepareWithSegments, layoutNextLine, type LayoutCursor, PreparedTextWithSegments } from '@chenglou/pretext'

const font = '16px "Helvetica Neue", sans-serif'
const input = document.getElementById('inputText') as HTMLTextAreaElement
input.value = '這是一段用來示範文字環繞圖片效果的長文。Pretext 的 layoutNextLine API 讓你可以每一行指定不同的寬度，這樣就能做出文繞圖的排版效果。當文字超過圖片的底部之後，就可以使用完整的欄寬，文字會自然地填滿整個段落。這個功能非常適合用在編輯器、電子書閱讀器、雜誌排版等需要精細控制的場景。Pretext handles all languages including English, 中文, العربية, and emoji 🎨🖼️ seamlessly.'
let prepared: PreparedTextWithSegments = prepareWithSegments(input.value, font)

input.addEventListener('input', () => {
  prepared = prepareWithSegments(input.value, font)
  render()
})
const lineHeight = 24
const columnWidth = 480
const padding = 16
const gap = 10

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

// --- 圖片位置（可拖曳） ---
const img = { x: 160, y: padding + 20, width: 160, height: 100 }

// --- 拖曳狀態 ---
let dragging = false
let dragOffsetX = 0
let dragOffsetY = 0

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // --- 畫「圖片」區塊 ---
  ctx.fillStyle = '#E8F5E9'
  ctx.fillRect(img.x, img.y, img.width, img.height)
  ctx.strokeStyle = '#81C784'
  ctx.lineWidth = 5
  ctx.strokeRect(img.x, img.y, img.width, img.height)
  ctx.fillStyle = '#66BB6A'
  ctx.font = '32px sans-serif'
  ctx.fillText('🖼️', img.x + 60, img.y + 65)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#999'
  ctx.fillText('拖我！', img.x + 55, img.y + 116)

  // --- 逐行排版，兩側包覆圖片 ---
  ctx.font = font
  ctx.fillStyle = '#333'

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = padding
  let lineIndex = 0
  let info = ''
  let done = false

  while (!done) {
    const isNextToImage = (y + lineHeight > img.y) && (y < img.y + img.height)

    if (isNextToImage) {
      const leftWidth = img.x - padding - gap
      const rightWidth = columnWidth - (img.x + img.width - padding) - gap

      // 排左邊
      if (leftWidth > 50) {
        const line = layoutNextLine(prepared, cursor, leftWidth)
        if (line === null) { done = true; break }
        ctx.fillText(line.text, padding, y + 18)
        info += `第 ${lineIndex + 1} 行 左側 (寬=${leftWidth}px): "${line.text}"\n`
        cursor = line.end
        lineIndex++
      }

      // 排右邊
      if (rightWidth > 50) {
        const line = layoutNextLine(prepared, cursor, rightWidth)
        if (line === null) { done = true; break }
        ctx.fillText(line.text, img.x + img.width + gap, y + 18)
        info += `第 ${lineIndex + 1} 行 右側 (寬=${rightWidth}px): "${line.text}"\n`
        cursor = line.end
        lineIndex++
      }
    } else {
      const line = layoutNextLine(prepared, cursor, columnWidth)
      if (line === null) break
      ctx.fillText(line.text, padding, y + 18)
      info += `第 ${lineIndex + 1} 行 (寬=${columnWidth}px): "${line.text}"\n`
      cursor = line.end
      lineIndex++
    }

    y += lineHeight
  }

  document.getElementById('output')!.textContent = info
}

// --- 拖曳事件 ---
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  if (mx >= img.x && mx <= img.x + img.width && my >= img.y && my <= img.y + img.height) {
    dragging = true
    dragOffsetX = mx - img.x
    dragOffsetY = my - img.y
    canvas.style.cursor = 'grabbing'
  }
})

window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  const rect = canvas.getBoundingClientRect()
  img.x = e.clientX - rect.left - dragOffsetX
  img.y = e.clientY - rect.top - dragOffsetY
  render()
})

window.addEventListener('mouseup', () => {
  if (dragging) {
    dragging = false
    canvas.style.cursor = ''
  }
})

// hover 時顯示 grab cursor
canvas.addEventListener('mousemove', (e) => {
  if (dragging) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const over = mx >= img.x && mx <= img.x + img.width && my >= img.y && my <= img.y + img.height
  canvas.style.cursor = over ? 'grab' : ''
})

// 初始繪製
render()
