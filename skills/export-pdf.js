#!/usr/bin/env node
/**
 * Usage: node export-pdf.js [input.html] [output.pdf]
 * Defaults: index.html → presentation.pdf
 */
const puppeteer = require(`${process.env.HOME}/.volta/tools/image/packages/@mermaid-js/mermaid-cli/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer`);
const path = require('path');

(async () => {
  const htmlFile  = process.argv[2] || 'index.html';
  const outputFile = process.argv[3] || path.basename(htmlFile, '.html') + '.pdf';
  const absPath = path.resolve(htmlFile);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`file://${absPath}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputFile,
    printBackground: true,
    landscape: true,
    format: 'A4',
    displayHeaderFooter: false,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });

  await browser.close();
  console.log(`✓ PDF saved: ${outputFile}`);
})();
