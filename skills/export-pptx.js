#!/usr/bin/env node
/**
 * Take a screenshot of each slide and assemble into a .pptx file.
 *
 * Default: full-page capture (background-included) — screenshots the ENTIRE
 * viewport, so the body background (e.g. a gradient frame) around the
 * .slide-wrapper card is included in the output.
 *
 * Pass --card-only to capture just the .slide-wrapper element (no surrounding
 * background), which was the previous default.
 *
 * Usage: node export-pptx.js [input.html] [output.pptx] [--card-only]
 * Defaults: index.html -> presentation.pptx
 */
const puppeteer = require(`${process.env.HOME}/.volta/tools/image/packages/@mermaid-js/mermaid-cli/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer`);
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { execSync } = require('child_process');

const W = 1280, H = 720; // 16:9, matches PPTX 13.33x7.5

(async () => {
  const args = process.argv.slice(2);
  const cardOnly = args.includes('--card-only');
  const positional = args.filter((a) => !a.startsWith('--'));
  const htmlFile   = positional[0] || 'index.html';
  const outputFile = positional[1] || path.basename(htmlFile, '.html') + '.pptx';
  const absHtml    = path.resolve(htmlFile);

  const browser = await puppeteer.launch();
  const page    = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.goto(`file://${absHtml}`, { waitUntil: 'networkidle0' });

  // Disable transitions and hide nav chrome (keep the body background)
  await page.addStyleTag({ content: `
    * { transition: none !important; animation: none !important; }
    .controls, #slide-dots, #progress-bar-track, .keyboard-hint { display: none !important; }
    ${cardOnly ? '.slide-wrapper { border-radius: 0 !important; box-shadow: none !important; } .slide { border-radius: 0 !important; }' : ''}
  `});

  const slideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
  const shots  = [];

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx));
    }, i);
    await page.evaluate(() => {
      document.querySelectorAll('.slide.active *').forEach((el) => {
        if (getComputedStyle(el).opacity === '0') el.style.setProperty('opacity', '1', 'important');
      });
    });
    const imgPath = path.join(tmpDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    if (cardOnly) {
      const wrapper = await page.$('.slide-wrapper');
      await wrapper.screenshot({ path: imgPath });
    } else {
      // Full viewport screenshot -> includes the body background around the card
      await page.screenshot({ path: imgPath, clip: { x: 0, y: 0, width: W, height: H } });
    }
    shots.push(imgPath);
    process.stdout.write(`  screenshot ${i + 1}/${slideCount}\r`);
  }
  console.log(`\n✓ ${slideCount} screenshots captured${cardOnly ? ' (card-only)' : ' (background-included)'}`);
  await browser.close();

  const pyScript = `
from pptx import Presentation
from pptx.util import Inches

images = """${shots.join('\n')}""".strip().splitlines()
out    = r"""${outputFile}"""

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]

for img in images:
    slide = prs.slides.add_slide(blank)
    slide.shapes.add_picture(img, 0, 0, prs.slide_width, prs.slide_height)

prs.save(out)
print(f"✓ PPTX saved: {out}  ({len(images)} slides)")
`;
  execSync(`python3 -c '${pyScript.replace(/'/g, "'\"'\"'")}'`, { stdio: 'inherit' });

  shots.forEach(f => fs.unlinkSync(f));
  fs.rmdirSync(tmpDir);
})();
