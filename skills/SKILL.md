---
name: browser-presentation
description: "Generate a browser-based slideshow presentation as three files: index.html, script.js, and style.css. Use this skill whenever the user asks to create a presentation, slide deck, or slideshow that runs in a browser — even if they don't say 'HTML' or '3 files'. Triggers include: 'プレゼン資料を作って', 'ブラウザプレゼン', 'ブラウザで動くプレゼン', 'make me a slideshow', 'create a presentation', 'HTML slides', 'browser presentation', 'index.html プレゼン'. The output is always exactly 3 files (index.html, script.js, style.css) with full slide navigation: prev/next buttons, keyboard arrow keys, slide number display, and animated CSS transitions between slides. IMPORTANT: Always apply modern design enhancements including gradients, shadows, hover effects, and visual polish to create professional, visually appealing presentations by default."
---

# Browser Presentation Skill

Generate a complete, self-contained browser slideshow from a topic or outline. Output is always exactly three files in the current working directory:

- `index.html` — slide markup + layout shell
- `script.js` — navigation, keyboard support, transition logic
- `style.css` — visual design and slide transition animations

---

## Workflow

### 1. Gather content

Ask the user (or infer from context):
- **Topic / title** of the presentation
- **Slide content**: either a full outline they provide, or ask them to share bullet points, and generate sensible slide content yourself
- **Slide count**: aim for 5–10 slides unless the user specifies otherwise
- **Visual style preference** (optional): minimal, bold, dark, corporate, colorful — default to a clean modern light theme

If the user just says "make a presentation about X", generate 6–8 slides covering a logical arc: title → overview → 2-4 content slides → summary/conclusion.

### 2. Plan the slide structure

Typical arc:
1. Title slide (title + subtitle/author)
2. Agenda or Overview
3. Content slides (one topic each, 3-5 bullet points)
4. Summary / Key Takeaways
5. Thank you / Q&A

Keep each slide focused: one heading, 3–5 bullet points or a short paragraph. Avoid cramming too much text.

### 3. Generate the three files

#### index.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Presentation Title</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="slide-wrapper">

    <div class="slide active" id="slide-1">
      <div class="slide-content">
        <h1>Title</h1>
        <p class="subtitle">Subtitle or author</p>
      </div>
    </div>

    <div class="slide" id="slide-2">
      <div class="slide-content">
        <h2>Section Heading</h2>
        <ul>
          <li>Point one</li>
          <li>Point two</li>
          <li>Point three</li>
        </ul>
      </div>
    </div>

    <!-- ...more slides... -->

  </div>

  <nav class="controls">
    <button id="btn-prev" aria-label="Previous slide">&#8592;</button>
    <span class="counter" id="counter">1 / N</span>
    <button id="btn-next" aria-label="Next slide">&#8594;</button>
  </nav>

  <script src="script.js"></script>
</body>
</html>
```

**Rules for index.html:**
- Every slide is a `<div class="slide">` inside `.slide-wrapper`
- The first slide gets `class="slide active"`
- Use `<h1>` for title slides, `<h2>` for section headings
- Use `<ul>/<li>` for bullet points
- The `<nav class="controls">` block lives outside `.slide-wrapper`
- The counter span shows "current / total" (e.g., "1 / 8")

#### style.css

Design goals: clean, readable, professional. Default to a light theme with a strong accent color.

**Key layout principle:** The slide fills the entire browser window (`100vw × 100vh`). The navigation controls float as an overlay at the bottom center of the slide, semi-transparent so they don't eat into slide real estate.

```css
/* Reset & base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f0f4f8;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Slide wrapper — large with a little breathing room */
.slide-wrapper {
  position: relative;
  width: 90vw;
  height: 80vh;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}

/* Individual slides */
.slide {
  position: absolute;
  inset: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5vw 2.5vw 4vh;  /* bottom padding leaves room for overlaid controls */
  opacity: 0;
  transform: translateX(60px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}

.slide.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* Slide content */
.slide-content { width: 100%; }

h1 { font-size: clamp(2.8rem, 6vw, 5.5rem); color: #1a202c; margin-bottom: 0.5rem; }
h2 { font-size: clamp(2.2rem, 4.5vw, 4rem); color: #2d3748; margin-bottom: 1.2rem; border-bottom: 3px solid #4299e1; padding-bottom: 0.4rem; }
.subtitle { font-size: clamp(1.6rem, 3vw, 2.6rem); color: #718096; }

ul { list-style: none; padding: 0; }
ul li {
  padding: 0.4rem 0 0.4rem 1.4rem;
  position: relative;
  font-size: clamp(1.3rem, 2.6vw, 2rem);
  color: #4a5568;
  line-height: 1.6;
}
ul li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #4299e1;
}

/* Navigation controls — overlaid at bottom center */
.controls {
  position: fixed;
  bottom: 1.8rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  border-radius: 2rem;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 100;
}

.controls button {
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.6rem;
  height: 2.6rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.controls button:hover { background: #2b6cb0; transform: scale(1.08); }
.controls button:disabled { background: #cbd5e0; cursor: not-allowed; transform: none; }

.counter { font-size: 0.95rem; color: #4a5568; min-width: 3.5rem; text-align: center; font-weight: 600; }
```

The exact colors and fonts can vary based on the user's style preference, but always keep:
- `body` and `.slide-wrapper` set to `100vw × 100vh` — slides fill the full browser window
- Navigation controls use `position: fixed` at the bottom, overlaid on the slide
- Smooth `opacity + transform` transition on `.slide` (not just display toggling)
- `.slide.active` fully visible, others hidden via `opacity: 0`
- Font sizes with `clamp()` so text scales with the viewport

**Always include the following `@media print` block at the end of style.css** so users can print/export to PDF (Cmd+P → Save as PDF) with each slide on its own page:

```css
/* ===== Print / PDF export ===== */
@media print {
  body {
    width: 100%;
    height: auto;
    overflow: visible;
    background: white;
    display: block;
  }

  .slide-wrapper {
    position: static;
    width: 100%;
    height: auto;
    overflow: visible;
    box-shadow: none;
    border-radius: 0;
  }

  .slide {
    position: relative;
    display: flex !important;
    opacity: 1 !important;
    transform: none !important;
    width: 100%;
    height: 100vh;
    page-break-after: always;
    break-after: page;
    box-shadow: none;
    border-radius: 0;
    pointer-events: none;
  }

  .slide:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  .controls {
    display: none !important;
  }
}
```

This makes every slide appear sequentially when printing, with each slide occupying exactly one page. The navigation controls are hidden in print output.

#### script.js

```javascript
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counter = document.getElementById('counter');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  let current = 0;

  function goTo(index) {
    slides[current].classList.remove('active');
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides[current].classList.add('active');
    counter.textContent = `${current + 1} / ${slides.length}`;
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === slides.length - 1;
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')                     goTo(current - 1);
  });

  // Initialize
  goTo(0);
}());
```

**Rules for script.js:**
- Always use an IIFE to avoid polluting global scope
- Disable the Prev button on slide 1, Next button on last slide
- Support keyboard: →/↓/Space = next, ←/↑ = previous
- Counter shows `current / total` (1-indexed)

### 4. Write the files

Write all three files using available file tools. Confirm the save location with the user if unclear, or default to the current directory.

After writing, tell the user:
> "3つのファイルを生成しました。`index.html` をブラウザで開くとプレゼンが表示されます。←→キーまたはボタンでスライドを切り替えられます。"
> (or in English if the user wrote in English)

---

## Export: PPTX（スクリーンショット方式）

ユーザーが「PPTXに変換して」「パワーポイントにしてほしい」と言ったとき、または `index.html` から `.pptx` を生成するよう求められたときは、以下の `export-pptx.js` を使う。

**前提:** Puppeteer（`@mermaid-js/mermaid-cli` の依存として `/opt/homebrew/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer` に存在）と python-pptx が利用可能であること。

### export-pptx.js（スキルディレクトリに配置済み）

```
~/.claude/skills/browser-presentation/export-pptx.js
```

**実行コマンド:**
```bash
node ~/.claude/skills/browser-presentation/export-pptx.js index.html output.pptx
```

**動作の流れ:**
1. Puppeteer で `index.html` を開く（viewport: 1920×1080）— コンテンツの下部切れを防ぐため高解像度を使用
2. CSSトランジションを無効化してスナップショットをクリーンに取得
3. `.slide` の数だけループし、各スライドを `.active` に切り替えて `.slide-wrapper` 要素をスクリーンショット
4. 取得した PNG を python-pptx でスライドサイズ（13.33 × 7.5 インチ）のPPTXに貼り込む
5. 一時ファイルを削除して完了

**ポイント:**
- HTML/CSSのデザインがそのまま画像として保存されるため、フォント・グラデーション・レイアウトが完全に再現される
- ナビゲーションボタンは `.slide-wrapper` の外側にあるため、スクリーンショットには含まれない

**ユーザーへの案内:**
> `node ~/.claude/skills/browser-presentation/export-pptx.js index.html presentation.pptx` を実行するとPPTXが生成されます。

または、Claude 自身が Bash ツールでそのまま実行することも可能。

---

## Export: PDF（ヘッダー/フッターなし）

ユーザーがブラウザのヘッダー（URL・日付）を含めずPDFにしたい場合は `export-pdf.js` を使う。

```
~/.claude/skills/browser-presentation/export-pdf.js
```

**実行コマンド:**
```bash
node ~/.claude/skills/browser-presentation/export-pdf.js index.html output.pdf
```

**動作:** Puppeteer の `page.pdf()` で `displayHeaderFooter: false`・`margin: 0` を指定し、`@media print` CSS によって全スライドを1ページずつ出力する。

---

## Customization hints

When the user requests a particular style, adapt accordingly:

| Style request | Approach |
|---|---|
| Dark / dark mode | `background: #1a1a2e`, white text, colored accents |
| Corporate / formal | Muted blues/grays, serif headings, minimal animation |
| Bold / colorful | Gradient backgrounds, large type, vivid accent colors |
| Minimal | White background, thin borders, reduced animation |
| Japanese content | Set `lang="ja"`, use `font-family: 'Noto Sans JP', sans-serif` with Google Fonts |

For Japanese content, add the Google Fonts link:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
```

---

## Design Enhancement Guidelines

**Always prioritize visual appeal and modern design aesthetics.** Even when the user doesn't explicitly request design enhancements, apply professional design principles to create visually engaging presentations.

### Core Design Principles

1. **Use Gradients Liberally**
   - Apply gradient backgrounds to body, buttons, and text elements
   - Recommended gradient: `linear-gradient(135deg, #11998e 0%, #1a6fa8 100%)`
   - Use `-webkit-background-clip: text` for gradient text effects

2. **Add Depth with Shadows**
   - Box shadows for slide wrapper: `0 20px 60px rgba(0,0,0,0.3)`
   - Button shadows: `0 4px 15px rgba(102, 126, 234, 0.4)`
   - Text shadows for titles: `0 2px 10px rgba(102, 126, 234, 0.3)`

3. **Enhance Interactive Elements**
   - Add hover effects with `transform: scale()` and `translateX()`
   - Use smooth transitions: `transition: all 0.3s ease`
   - Implement active states with `transform: scale(0.95)`

4. **Typography Enhancements**
   - Use gradient text for headings and important elements
   - Add decorative elements (e.g., accent lines under h2)
   - Apply italic styles to subtitles for elegance

5. **Visual Hierarchy**
   - Larger, bolder titles with gradient effects
   - Decorative borders with gradient colors
   - Consistent color scheme throughout

### Default Enhanced Style Template

```css
/* Enhanced body with gradient background */
body {
  background: linear-gradient(135deg, #11998e 0%, #1a6fa8 100%);
}

/* Slide with subtle gradient */
.slide {
  background: linear-gradient(to bottom right, #ffffff 0%, #f8f9fa 100%);
}

/* Gradient text for h1 */
h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

/* Decorative h2 with gradient border */
h2 {
  border-bottom: 4px solid transparent;
  border-image: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-image-slice: 1;
}

h2::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* Enhanced list items with hover effect */
ul li {
  transition: transform 0.2s ease, color 0.2s ease;
}

ul li:hover {
  transform: translateX(5px);
  color: #2d3748;
}

ul li::before {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced navigation controls */
.controls {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.controls button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.controls button:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.controls button:active {
  transform: scale(0.95);
}
```

### When to Apply Enhanced Design

- **Always**: Apply enhanced design by default unless user explicitly requests minimal/simple style
- **Corporate presentations**: Use more subtle gradients and professional color schemes
- **Creative presentations**: Use bold gradients and vibrant colors
- **Technical presentations**: Balance professionalism with modern design elements

### Color Scheme Variations

| Theme | Primary Gradient | Use Case |
|---|---|---|
| Purple-Pink | `#667eea → #764ba2` | General, modern, tech |
| Blue-Cyan | `#4299e1 → #00d4ff` | Corporate, professional |
| Orange-Red | `#ff6b6b → #ee5a6f` | Creative, energetic |
| Green-Blue (Default) | `#11998e → #1a6fa8` | General, modern, tech |
| Green-Teal | `#11998e → #38ef7d` | Nature, sustainability |
| Dark-Neon | `#1a1a2e → #16213e` with neon accents | Tech, gaming, futuristic |

---

## Quality checklist before writing files

- [ ] All slides have meaningful, concise content (not placeholder text)
- [ ] Slide count matches the topic complexity (5–10 slides)
- [ ] First slide has `.slide.active` class
- [ ] `counter` shows correct total on load (handled by `goTo(0)`)
- [ ] Prev button disabled on first slide, Next button disabled on last slide
- [ ] CSS transitions use `opacity` + `transform` (not `display: none` toggling)
- [ ] Keyboard navigation works for ←→ and Space
- [ ] Text is readable: sufficient contrast, reasonable font sizes
