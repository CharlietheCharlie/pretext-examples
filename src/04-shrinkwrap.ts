// ============================================================
// 範例 4：Shrinkwrap 聊天氣泡 — walkLineRanges()
//
// walkLineRanges(prepared, maxWidth, onLine) 的用法：
//   - 不會建構 line.text 字串，只給你 line.width
//   - 回傳值是 lineCount
//   - 適合做 shrinkwrap：找出最寬那行 = 不增加行數的最小寬度
//
// Shrinkwrap 流程：
//   1. 用 layout() 在 maxWidth 下算行數
//   2. 用 walkLineRanges() 拿精確的最寬行寬度
//   3. 用最寬行寬度當作氣泡寬度 → 剛好包住文字
// ============================================================
import { prepareWithSegments, walkLineRanges, layout, type PreparedText, type PreparedTextWithSegments } from '@chenglou/pretext'

const font = '15px "Helvetica Neue", Helvetica, Arial, sans-serif'
const lineHeight = 20
let maxBubbleWidth: number;

// 模擬聊天訊息
const messages = [
  { text: '嗨！', side: 'received' },
  { text: '你今天下班後要不要一起去吃拉麵？', side: 'received' },
  { text: '好啊！聽說車站旁邊新開了一家很好吃的 🍜', side: 'sent' },
  { text: '對對對，那家叫「麵屋一燈」，Google 評價 4.8 超高', side: 'received' },
  { text: '那我們約六點半在車站北口見？', side: 'sent' },
]

const chat = document.getElementById('chat')!
let info = ''

let prepared: PreparedTextWithSegments
for (const msg of messages) {
  prepared = prepareWithSegments(msg.text, font)
}

if(prepared!) update(prepared)
const slider = document.getElementById('slider') as HTMLInputElement
const label = document.getElementById('widthLabel') as HTMLSpanElement
slider.addEventListener('input', () => {
  label.textContent = `${slider.value}px`
  maxBubbleWidth = Number(slider.value)
  info = `maxBubbleWidth: ${maxBubbleWidth}px`
  chat.innerHTML = ''
  update(prepared)
})

function update(prepared: PreparedTextWithSegments): void {
for (const msg of messages) {
  // --- 在 maxBubbleWidth 下算行數 ---
  const { lineCount } = layout(prepared, maxBubbleWidth, lineHeight)

  // --- 找最寬那行寬度（= shrinkwrap 寬度） ---
  let maxLineWidth = 0
  walkLineRanges(prepared, maxBubbleWidth, line => {
    // line.width 是該行的實際寬度（不含尾部空白）
    // line.start / line.end 是 cursor，這裡不需要用到
    if (line.width > maxLineWidth) maxLineWidth = line.width
  })

  const tightWidth = Math.ceil(maxLineWidth)

  // --- 建立氣泡 DOM ---
  const bubble = document.createElement('div')
  bubble.className = `bubble ${msg.side}`
  bubble.textContent = msg.text
  // 用 shrinkwrap 的寬度，加上左右 padding（12px × 2）
  bubble.style.width = (tightWidth + 24) + 'px'
  bubble.style.maxWidth = maxBubbleWidth + 'px'
  chat.appendChild(bubble)

  // --- 加標籤顯示節省了多少 ---
  const saved = maxBubbleWidth - tightWidth
  const label = document.createElement('div')
  label.className = 'label'
  label.textContent = `shrinkwrap: ${tightWidth}px (省 ${saved}px)`
  label.style.textAlign = msg.side === 'sent' ? 'right' : 'left'
  chat.appendChild(label)

  info += `"${msg.text}"\n`
  info += `  CSS 最大寬度: ${maxBubbleWidth}px\n`
  info += `  Shrinkwrap:  ${tightWidth}px (省了 ${saved}px)\n`
  info += `  行數: ${lineCount}\n\n`
}

document.getElementById('output')!.textContent = info
}
