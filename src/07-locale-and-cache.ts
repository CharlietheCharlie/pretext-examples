// ============================================================
// 範例 7：setLocale() 切換分詞語言 + clearCache()
//
// setLocale(locale?) 的用法：
//   - 設定之後的 prepare() / prepareWithSegments() 使用的分詞 locale
//   - 內部會自動呼叫 clearCache()
//   - 不影響已經 prepare 過的結果（不會 mutate 舊的 prepared handle）
//   - 不傳參數或傳 undefined = 回到瀏覽器預設 locale
//
// clearCache() 的用法：
//   - 清除 Pretext 內部的字型量測快取
//   - 如果你的 app 會用到很多不同字型，可以定期清來釋放記憶體
//   - setLocale() 會自動呼叫 clearCache()，通常不需要手動清
// ============================================================
import { setLocale, clearCache, prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

// 混合中日文的測試文字
const text = '日本語のテスト文章です。漢字とひらがなが混ざっています。Pretextは全ての言語をサポートします。'
const font = '16px sans-serif'
const maxWidth = 200
const lineHeight = 24

const box = document.getElementById('box') as HTMLDivElement
const output = document.getElementById('output') as HTMLPreElement
box.textContent = text
box.style.width = maxWidth + 'px'

function show(locale: string): void {
  // 切換 locale（會自動清快取）
  // 不傳參數 = 預設 locale
  if (locale === '') {
    setLocale()
  } else {
    setLocale(locale)
  }

  // 切換後重新 prepare（因為分詞規則可能不同了）
  const prepared = prepareWithSegments(text, font)
  const { lines, lineCount } = layoutWithLines(prepared, maxWidth, lineHeight)

  let info = `locale: ${locale || '(預設)'}\n`
  info += `排版寬度: ${maxWidth}px\n`
  info += `總行數: ${lineCount}\n\n`

  for (let i = 0; i < lines.length; i++) {
    info += `  第 ${i + 1} 行: "${lines[i]!.text}"\n`
  }

  output.textContent = info

  // 更新按鈕樣式
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-locale]')) {
    btn.classList.toggle('active', btn.dataset['locale'] === locale)
  }
}

// 綁定 locale 按鈕
for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-locale]')) {
  btn.addEventListener('click', () => show(btn.dataset['locale']!))
}

// 綁定清快取按鈕
document.getElementById('btn-clear')!.addEventListener('click', () => {
  clearCache()
  output.textContent = '快取已清除！\n\n下次 prepare() 會重新量測所有字型寬度。'
})

show('')
