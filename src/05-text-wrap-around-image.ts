// ============================================================
// 範例 5：文繞圖 — layoutNextLine()
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
import { prepareWithSegments, layoutNextLine, type LayoutCursor } from '@chenglou/pretext'

const text = '這是一段用來示範文字環繞圖片效果的長文。Pretext 的 layoutNextLine API 讓你可以每一行指定不同的寬度，這樣就能做出文繞圖的排版效果。當文字超過圖片的底部之後，就可以使用完整的欄寬，文字會自然地填滿整個段落。這個功能非常適合用在編輯器、電子書閱讀器、雜誌排版等需要精細控制的場景。Pretext handles all languages including English, 中文, العربية, and emoji 🎨🖼️ seamlessly.'
const font = '16px "Helvetica Neue", sans-serif'
const lineHeight = 24
const columnWidth = 480
const padding = 16

const prepared = prepareWithSegments(text, font)
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

// --- 畫「圖片」區塊 ---
const img = { x: 330, y: padding, width: 160, height: 100 }
ctx.fillStyle = '#E8F5E9'
ctx.fillRect(img.x, img.y, img.width, img.height)
ctx.strokeStyle = '#81C784'
ctx.lineWidth = 2
ctx.strokeRect(img.x, img.y, img.width, img.height)
ctx.fillStyle = '#66BB6A'
ctx.font = '32px sans-serif'
ctx.fillText('🖼️', img.x + 60, img.y + 65)
ctx.font = '12px sans-serif'
ctx.fillStyle = '#999'
ctx.fillText('160 × 120', img.x + 45, img.y + 105)

// --- 逐行排版，繞過圖片 ---
ctx.font = font
ctx.fillStyle = '#333'

// 初始 cursor：從第一個 segment 的第一個 grapheme 開始
let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = padding
let lineIndex = 0
let info = ''

while (true) {
  // 關鍵：根據 y 座標決定這一行的可用寬度
  const isNextToImage = (y + lineHeight > img.y) && (y < img.y + img.height)
  const availableWidth = isNextToImage
    ? (img.x - padding - 10)  // 圖片左邊的空間（留 10px 間距）
    : columnWidth             // 完整寬度

  // layoutNextLine：從 cursor 排一行，用 availableWidth 當最大寬度
  const line = layoutNextLine(prepared, cursor, availableWidth)

  // null 表示文字已全部排完
  if (line === null) break

  // 畫這一行
  ctx.fillText(line.text, padding, y + 18)

  info += `第 ${lineIndex + 1} 行 (寬度限制=${availableWidth}px): "${line.text}"\n`

  // 把這行的 end cursor 當作下一行的起點
  cursor = line.end
  y += lineHeight
  lineIndex++
}

document.getElementById('output')!.textContent = info
