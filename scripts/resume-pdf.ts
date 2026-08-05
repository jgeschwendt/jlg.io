import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';

const PORT = 4311;
const URL = `http://localhost:${PORT}/resume`;

const waitForServer = async (): Promise<void> => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(URL);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still booting.
    }
    await sleep(250);
  }
  throw new Error(`Server did not respond at ${URL}`);
};

const server = spawn('bun', ['--bun', 'next', 'start', '--port', String(PORT)], {
  stdio: 'ignore',
});

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(async () => document.fonts.ready);
  await page.pdf({
    format: 'Letter',
    path: 'public/resume.pdf',
    printBackground: true,
  });
  await browser.close();
  console.log('Wrote public/resume.pdf');
} finally {
  server.kill();
}
