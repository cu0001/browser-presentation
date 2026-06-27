#!/usr/bin/env node
/**
 * Export the slideshow to a PDF (one slide per page).
 *
 * Default: full-page capture (background-included) — screenshots the ENTIRE
 * viewport for each slide (so the body background around the .slide-wrapper
 * card is included) and assembles the images into a PDF.
 *
 * Pass --card-only to instead use the @media print CSS via page.pdf()
 * (no surrounding background; relies on the print stylesheet), which was the
 * previous default.
 *
 * Usage: node export-pdf.js [input.html] [output.pdf] [--card-only]
 * Defaults: index.html -> presentation.pdf
 */
const puppeteer = require(`${process.env.HOME}/.volta/tools/image/packages/@mermaid-js/mermaid-cli/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer`);
const path = require('path');
const fs   = require('fs');
const os   = require('os');

const W = 1280, H = 720; // 16:9

(async () => {
  const args = process.argv.slice(2);
  const cardOnly = args.includes('--card-only');
  const positional = args.filter((a) => !a.startsWith('--'));
  const htmlFile   = positional[0] || 'index.html';
  const outputFile = positional[1] || path.basename(htmlFile, '.html') + '.pdf';
  const absHtml    = path.resolve(htmlFile);

  const browser = await puppeteer.launch();
  const page    = await browser.newPage();

  // --- card-only: use the print stylesheet (previous default) ---
  if (cardOnly) {
    await page.goto(`file://${absHtml}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputFile,
      printBackground: true,
      landscape: true,
      format: 'A4',
      displayHeaderFooter: false,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    await browser.close();
    console.log(`✓ PDF saved: ${outputFile} (card-only / print CSS)`);
    return;
  }

  // --- default: full-page capture (background-included) ---
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  await page.goto(`file://${absHtml}`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: `
    * { transition: none !important; animation: none !important; }
    .controls, #slide-dots, #progress-bar-track, .keyboard-hint { display: none !important; }
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
    await page.screenshot({ path: imgPath, clip: { x: 0, y: 0, width: W, height: H } });
    shots.push(imgPath);
    process.stdout.write(`  screenshot ${i + 1}/${slideCount}\r`);
  }
  console.log(`\n✓ ${slideCount} screenshots captured (background-included)`);

  // Assemble the screenshots into a PDF (one slide per page) with Puppeteer.
  const imgsHtml = shots.map((s) => `<img src="file://${s}">`).join('\n');
  const pdfHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { size: ${W}px ${H}px; margin: 0; }
    html, body { margin: 0; padding: 0; }
    img { display: block; width: ${W}px; height: ${H}px; page-break-after: always; }
    img:last-child { page-break-after: auto; }
  </style></head><body>${imgsHtml}</body></html>`;
  const htmlPath = path.join(tmpDir, '_pdf.html');
  fs.writeFileSync(htmlPath, pdfHtml);

  const pdfPage = await browser.newPage();
  await pdfPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await pdfPage.pdf({
    path: outputFile,
    printBackground: true,
    width: `${W}px`,
    height: `${H}px`,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  console.log(`✓ PDF saved: ${outputFile}  (${slideCount} pages)`);

  await browser.close();
  shots.forEach(f => fs.unlinkSync(f));
  fs.unlinkSync(htmlPath);
  fs.rmdirSync(tmpDir);
})();
