#!/usr/bin/env node
/**
 * Take a screenshot of each slide and assemble into a .pptx file.
 * Usage: node export-pptx.js [input.html] [output.pptx]
 * Defaults: index.html → presentation.pptx
 */
const puppeteer = require(`${process.env.HOME}/.volta/tools/image/packages/@mermaid-js/mermaid-cli/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer`);
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { execSync } = require('child_process');

(async () => {
  const htmlFile   = process.argv[2] || 'index.html';
  const outputFile = process.argv[3] || path.basename(htmlFile, '.html') + '.pptx';
  const absHtml    = path.resolve(htmlFile);

  const browser = await puppeteer.launch();
  const page    = await browser.newPage();
  await page.setViewport({ width: 1200, height: 675, deviceScaleFactor: 2 });
  await page.goto(`file://${absHtml}`, { waitUntil: 'networkidle0' });

  // Disable transitions/animations and hide UI chrome only
  await page.addStyleTag({ content: `
    * { transition: none !important; animation: none !important; }
    .controls, #slide-dots, #progress-bar-track, .keyboard-hint { display: none !important; }
    .slide-wrapper { border-radius: 0 !important; box-shadow: none !important; }
    .slide { border-radius: 0 !important; }
  `});

  const slideCount = await page.evaluate(() =>
    document.querySelectorAll('.slide').length
  );

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
  const shots  = [];

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide').forEach((s, j) => {
        s.classList.toggle('active', j === idx);
      });
    }, i);

    // Capture only the slide-wrapper element (exact slide area, high-res)
    const wrapper = await page.$('.slide-wrapper');
    const imgPath = path.join(tmpDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await wrapper.screenshot({ path: imgPath });
    shots.push(imgPath);
    process.stdout.write(`  screenshot ${i + 1}/${slideCount}\r`);
  }
  console.log(`\n✓ ${slideCount} screenshots captured`);

  await browser.close();




  // Inline Python to assemble PPTX from images
  const pyScript = `
import sys
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

  // Cleanup temp screenshots
  shots.forEach(f => fs.unlinkSync(f));
  fs.rmdirSync(tmpDir);
})();
