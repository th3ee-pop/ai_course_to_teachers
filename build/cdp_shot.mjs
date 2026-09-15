// 用 Chrome headless + CDP 截图（可先执行 JS 再截）。
// 用法：node build/cdp_shot.mjs --url URL --out out.png [--js "code"] [--wait 1200] [--w 1920 --h 1080]
//      node build/cdp_shot.mjs --jobs jobs.json   （[{url,out,js,wait}] 共用一个浏览器，逐个截）
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Chrome 路径：优先环境变量 CHROME，其次 macOS 默认安装，再依次尝试 Linux 常见命令名（云端环境）
import { execSync } from 'node:child_process';
function findChrome() {
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(mac)) return mac;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome']) {
    try { const p = execSync(`command -v ${name}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); if (p) return p; } catch {}
  }
  throw new Error('未找到 Chrome：请设置环境变量 CHROME 指向可执行文件（云端可 `npx @puppeteer/browsers install chrome@stable` 后指定）');
}
const CH = findChrome();
const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { const k = argv[i].slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; opt[k] = v; }
}
const W = +(opt.w || 1920), H = +(opt.h || 1080);
let jobs = opt.jobs ? JSON.parse(fs.readFileSync(opt.jobs, 'utf8')) : [{ url: opt.url, out: opt.out, js: opt.js, wait: opt.wait }];

const port = 9400 + Math.floor(Math.random() * 400);
const udir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
const chrome = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--use-mock-keychain',
  `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, `--user-data-dir=${udir}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitPort() {
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json`); return await r.json(); } catch { await sleep(150); }
  }
  throw new Error('chrome not up');
}

let id = 0; const pending = new Map(); const listeners = [];
let ws;
function send(method, params = {}, ms = 20000) {
  return new Promise((res, rej) => {
    const i = ++id;
    const t = setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('CDP timeout: ' + method)); } }, ms);
    pending.set(i, { res: (v) => { clearTimeout(t); res(v); }, rej: (e) => { clearTimeout(t); rej(e); } });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}
function once(method) { return new Promise(res => listeners.push({ method, res })); }

try {
  const targets = await waitPort();
  setTimeout(() => { console.error('FAIL global watchdog'); process.exit(2); }, 60000 + jobs.length * 25000).unref();
  const page = targets.find(t => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method) { for (let i = listeners.length - 1; i >= 0; i--) if (listeners[i].method === m.method) { listeners[i].res(m.params); listeners.splice(i, 1); } }
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  for (const j of jobs) { try {
    await send('Page.navigate', { url: 'about:blank' }); await sleep(120);
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: j.url });
    await Promise.race([loaded, sleep(15000)]);
    await sleep(+(j.wait ?? 1200));
    if (j.js) {
      const r = await send('Runtime.evaluate', { expression: j.js, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) console.error('JS error:', JSON.stringify(r.exceptionDetails).slice(0, 300));
      await sleep(+(j.wait2 ?? 800));
    }
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.dirname(j.out), { recursive: true });
    fs.writeFileSync(j.out, Buffer.from(shot.data, 'base64'));
    console.log('ok', j.out, fs.statSync(j.out).size);
  } catch (e) { console.error('FAIL', j.out, e.message); process.exitCode = 1; } }
} catch (e) { console.error('FAIL', e.message); process.exitCode = 1; }
finally { try { ws && ws.close(); } catch {} chrome.kill('SIGKILL'); fs.rmSync(udir, { recursive: true, force: true }); }
