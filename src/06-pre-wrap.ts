// ============================================================
// 範例 6：pre-wrap 模式（保留空白和換行）
//
// pre-wrap 模式：
//   prepare(text, font, { whiteSpace: 'pre-wrap' })
//
// 跟預設的 'normal' 模式差異：
//   normal   → 空白會被合併，\n 被當成空白（跟 CSS white-space: normal 一樣）
//   pre-wrap → 空白保留，\t 變成 tab stop，\n 強制換行
//              （跟 CSS white-space: pre-wrap 一樣）
//
// Tab 寬度預設跟瀏覽器一樣是 tab-size: 8
// ============================================================
import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const textarea = document.getElementById('input') as HTMLTextAreaElement
const output = document.getElementById('output') as HTMLPreElement
const font = '14px "Courier New", monospace'
const lineHeight = 20

function measure(): void {
  const text = textarea.value
  const width = textarea.clientWidth - 16 // 扣掉 padding

  // --- 關鍵：傳入 { whiteSpace: 'pre-wrap' } ---
  // 這樣 \n 會強制換行，空白不會被合併
  const prepared = prepare(text, font, { whiteSpace: 'pre-wrap' })
  const result = layout(prepared, width, lineHeight)

  // 也可以用 prepareWithSegments 看每行內容
  const preparedRich = prepareWithSegments(text, font, { whiteSpace: 'pre-wrap' })
  const { lines } = layoutWithLines(preparedRich, width, lineHeight)

  let info =
    `textarea 寬度: ${width}px\n` +
    `行數: ${result.lineCount}\n` +
    `高度: ${result.height}px\n\n` +
    `--- 每行內容 ---\n`

  for (let i = 0; i < lines.length; i++) {
    // 用 JSON.stringify 讓 \t 和空白可見
    info += `${i + 1}: ${JSON.stringify(lines[i]!.text)}\n`
  }

  output.textContent = info
}

textarea.addEventListener('input', measure)

// 等字型載入後再量（避免字型還沒 ready 時量錯）
document.fonts.ready.then(measure)
measure()
