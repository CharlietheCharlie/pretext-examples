// ============================================================
// 範例 8：Font 格式與注意事項
//
// font 參數的注意事項：
//
// 1. 格式同 Canvas ctx.font（= CSS font shorthand）
//    正確: '16px Inter', 'bold 16px Arial', 'italic 14px Georgia'
//    錯誤: 'Inter 16px'（順序不對）
//
// 2. 家族名有空格要用引號
//    '16px "Helvetica Neue"'
//
// 3. ❌ 不要用 system-ui
//    macOS 上 Canvas measureText 和 DOM 可能解析到不同字型
//    會導致 layout() 算出來的高度跟實際 DOM 不符
//
// 4. lineHeight 要跟 CSS line-height 同步
//    如果 CSS 寫 line-height: 1.5，font-size: 16px
//    那 lineHeight 應該傳 24 (= 16 * 1.5)
//
// 5. 預設行為等同這組 CSS：
//    white-space: normal
//    word-break: normal
//    overflow-wrap: break-word （窄容器會在字元邊界斷詞）
//    line-break: auto
// ============================================================
import { prepare, layout } from '@chenglou/pretext'

const text = 'Hello World 測試文字'
const maxWidth = 200
const lineHeight = 24

// 測試不同 font 格式
const fonts = [
  { font: '16px "Helvetica Neue", sans-serif', label: '16px Helvetica Neue' },
  { font: 'bold 16px "Helvetica Neue", sans-serif', label: 'bold 16px Helvetica Neue' },
  { font: 'italic 16px Georgia, serif', label: 'italic 16px Georgia' },
  { font: '20px Arial, sans-serif', label: '20px Arial（較大字）' },
  { font: '12px "Courier New", monospace', label: '12px Courier New（等寬）' },
]

const demos = document.getElementById('demos')!
let info = `文字: "${text}"\n容器寬度: ${maxWidth}px\n\n`

for (const { font, label } of fonts) {
  // 建立對照用的 DOM 元素
  const row = document.createElement('div')
  row.className = 'demo-row'

  const box = document.createElement('div')
  box.className = 'demo-box'
  box.style.font = font
  box.style.lineHeight = lineHeight + 'px'
  box.style.width = maxWidth + 'px'
  box.textContent = text

  const labelDiv = document.createElement('div')
  labelDiv.className = 'demo-label'

  // 用 prepare + layout 計算
  const prepared = prepare(text, font)
  const result = layout(prepared, maxWidth, lineHeight)

  labelDiv.textContent = `${label} → ${result.lineCount} 行, ${result.height}px`
  info += `${label}\n  行數: ${result.lineCount}, 高度: ${result.height}px\n\n`

  row.appendChild(box)
  row.appendChild(labelDiv)
  demos.appendChild(row)
}

document.getElementById('output')!.textContent = info
