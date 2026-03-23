// ==UserScript==

// @name Gemini Reader Pro

// @namespace http://tampermonkey.net/

// @version 1.0.0

// @description 阅读美化 · 智能目录 · 设置面板

// @author Zhang Zuhao

// @match https://gemini.google.com/*

// @grant GM_setValue

// @grant GM_getValue

// @grant GM_addStyle

// @run-at document-idle

// ==/UserScript==

  

(function () {

'use strict';

  

// ─── 配置默认值 ───────────────────────────────────────────────

const DEFAULTS = {
theme: 'yellow',

fontType: 'serif',

customFontName: '',

customFontUrl: '',

fontSize: 19,

lineHeight: 1.8,

letterSpacing: 0,

maxWidth: 900,

publicStyle: false,

hideFooter: true,

};

  

function loadCfg() {

const raw = GM_getValue('grp_config', null);
if (!raw) return { ...DEFAULTS };

try {
const parsed = JSON.parse(raw) || {};
const { immersive, ...rest } = parsed;
return { ...DEFAULTS, ...rest };
} catch {
return { ...DEFAULTS };
}

}

function saveCfg(c) { GM_setValue('grp_config', JSON.stringify(c)); }

  

let cfg = loadCfg();

  

// ─── 主题 ─────────────────────────────────────────────────────

const THEMES = {

yellow: { bg: '#f6f1e7', text: '#5b4636', accent: '#fff', inputBg: 'rgba(255,255,255,0.7)' },

white: { bg: '#ffffff', text: '#333333', accent: '#f7f7f7', inputBg: 'rgba(255,255,255,0.85)' },

green: { bg: '#cce8cf', text: '#222222', accent: '#ffffff', inputBg: 'rgba(255,255,255,0.7)' },

dark: { bg: '#242628', text: '#d0d4d7', accent: '#33373b', inputBg: 'rgba(54,58,62,0.84)' },

};

  

const FONTS = {

serif: '"Source Han Serif SC","Noto Serif CJK SC","Songti SC",serif',

sans: '"Source Han Sans SC","PingFang SC","Microsoft YaHei",sans-serif',

};

  

// ─── 样式 ─────────────────────────────────────────────────────

GM_addStyle(`

/* 阅读美化变量 */

:root {

--grp-bg: #f6f1e7;

--grp-text: #5b4636;

--grp-accent: #fff;

--grp-input-bg: rgba(255,255,255,0.7);

--grp-font: ${FONTS.serif};

--grp-fs: 19px;

--grp-lh: 1.8;

--grp-ls: 0px;

--grp-max-w: 900px;

--grp-toc-w: 300px;

}

  

/* 阅读美化：始终生效 */

body.grp-reader,

body.grp-reader .mat-drawer-container,

body.grp-reader bard-sidenav-content,

body.grp-reader .content-wrapper {

background-color: var(--grp-bg) !important;

}

body.grp-reader .model-response-text p,

body.grp-reader .model-response-text li {

color: var(--grp-text) !important;

text-align: justify !important;

}

body.grp-reader .model-response-text h1,

body.grp-reader .model-response-text h2,

body.grp-reader .model-response-text h3 {

color: var(--grp-text) !important;

}

body.grp-hide-footer hallucination-disclaimer,

body.grp-hide-footer .hallucination-disclaimer {

display: none !important;

}

body.grp-reader.grp-hide-footer .input-area-container {

transform: translateY(-20px) !important;

}

  

/* 排版设置：始终生效 */

.model-response-text p,

.model-response-text li {

font-family: var(--grp-font) !important;

font-size: var(--grp-fs) !important;

line-height: var(--grp-lh) !important;

letter-spacing: var(--grp-ls) !important;

}

.model-response-text h1,

.model-response-text h2,

.model-response-text h3 {

font-family: var(--grp-font) !important;

letter-spacing: var(--grp-ls) !important;

}

.conversation-container,

.response-container,

.inner-container {

max-width: var(--grp-max-w) !important;

margin: 0 auto !important;

}

  

/* 公众号半覆盖高亮 */

body.grp-public .model-response-text strong,

body.grp-public .model-response-text b {

background: linear-gradient(to bottom, transparent 55%, rgba(255,235,59,0.6) 0) !important;

padding: 0 2px !important;

border-radius: 2px !important;

}

body.grp-dark.grp-public .model-response-text strong,

body.grp-dark.grp-public .model-response-text b {

background: linear-gradient(to bottom, transparent 55%, rgba(255,214,64,0.5) 0) !important;

color: #eef2f4 !important;

}

  

/* 目录面板 push 布局 */

body.grp-toc-open bard-sidenav-content {

margin-right: var(--grp-toc-w) !important;

transition: margin-right 0.3s cubic-bezier(0.2,0,0,1) !important;

}

  

/* 目录面板 */

#grp-toc-panel {

position: fixed;

top: 0; right: calc(-1 * var(--grp-toc-w)); bottom: 0;

width: var(--grp-toc-w);

background: #f8f9fa;

border-left: 1px solid rgba(0,0,0,0.08);

box-shadow: -4px 0 16px rgba(0,0,0,0.06);

z-index: 9999;

display: flex; flex-direction: column;

transition: right 0.3s cubic-bezier(0.2,0,0,1);

font-family: "Google Sans","Roboto",sans-serif;

}

#grp-toc-header {

display: flex; align-items: center; justify-content: space-between;

padding: 16px 16px 12px;

border-bottom: 1px solid rgba(0,0,0,0.08);

font-size: 15px; font-weight: 500; color: #202124;

}

#grp-toc-close {

cursor: pointer; color: #5f6368; font-size: 20px;

width: 32px; height: 32px; display: flex; align-items: center;

justify-content: center; border-radius: 50%;

}

#grp-toc-close:hover { background: rgba(0,0,0,0.06); }

#grp-toc-list {

flex: 1; overflow-y: auto; padding: 8px 8px;

}

.grp-toc-item {

padding: 7px 12px; border-radius: 100px; cursor: pointer;

font-size: 13px; color: #3c4043; white-space: nowrap;

overflow: hidden; text-overflow: ellipsis;

transition: background 0.15s;

}

.grp-toc-item:hover { background: rgba(0,0,0,0.05); }

.grp-toc-item.active { background: #e8f0fe; color: #1967d2; font-weight: 500; }

.grp-toc-user {

background: #d3e3fd; color: #041e49; font-weight: 500;

margin: 8px 0 2px;

}

.grp-toc-user:hover { background: #c2d8fc; }

.grp-toc-h1 { font-weight: 500; padding-left: 12px; }

.grp-toc-h2 {

padding-left: 30px;

font-size: 12px;

opacity: 0.78;

}

.grp-toc-h3 { padding-left: 36px; opacity: 0.75; font-size: 12px; }

  

/* 深色模式 — 目录面板 */

body.grp-dark #grp-toc-panel {

background: #1e1e1e;

border-left-color: rgba(255,255,255,0.08);

}

body.grp-dark #grp-toc-header {

color: #e3e3e3;

border-bottom-color: rgba(255,255,255,0.08);

}

body.grp-dark #grp-toc-close { color: #aaa; }

body.grp-dark #grp-toc-close:hover { background: rgba(255,255,255,0.08); }

body.grp-dark .grp-toc-item { color: #c4c7c5; }

body.grp-dark .grp-toc-item:hover { background: rgba(255,255,255,0.06); }

body.grp-dark .grp-toc-item.active { background: #004a77; color: #c2e7ff; }

body.grp-dark .grp-toc-user { background: #004a77; color: #c2e7ff; }

body.grp-dark .grp-toc-user:hover { background: #005a8e; }

  

/* 设置面板遮罩 */

#grp-overlay {

position: fixed; inset: 0;

background: rgba(0,0,0,0.32);

z-index: 10000; display: none;

backdrop-filter: blur(2px);

}

  

/* 设置面板 */

#grp-settings {

position: fixed; top: 50%; left: 50%;

transform: translate(-50%, -50%);

width: 400px; max-width: 92vw; max-height: 85vh;

overflow-y: auto;

background: #fff; border-radius: 24px;

box-shadow: 0 24px 48px rgba(0,0,0,0.18);

z-index: 10001; display: none;

flex-direction: column; gap: 0;

font-family: "Google Sans","Roboto",sans-serif;

}

.grp-s-header {

padding: 20px 24px 16px;

font-size: 18px; font-weight: 500; color: #202124;

border-bottom: 1px solid #f1f3f4;

display: flex; align-items: center; justify-content: space-between;

}

.grp-s-close {

cursor: pointer; color: #5f6368; font-size: 20px;

width: 32px; height: 32px; display: flex; align-items: center;

justify-content: center; border-radius: 50%;

}

.grp-s-close:hover { background: #f1f3f4; }

.grp-s-body { padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 20px; }

.grp-s-row { display: flex; flex-direction: column; gap: 8px; }

.grp-s-label { font-size: 13px; font-weight: 500; color: #5f6368; }

.grp-s-switch-row {

display: flex; align-items: center; justify-content: space-between;

}

.grp-s-switch-label { font-size: 14px; color: #202124; }

  

/* 深色模式 — 设置面板 */

body.grp-dark #grp-settings {

background: #2b2b2b;

box-shadow: 0 24px 48px rgba(0,0,0,0.5);

}

body.grp-dark .grp-s-header { color: #e3e3e3; border-bottom-color: rgba(255,255,255,0.08); }

body.grp-dark .grp-s-close { color: #aaa; }

body.grp-dark .grp-s-close:hover { background: rgba(255,255,255,0.08); }

body.grp-dark .grp-s-label { color: #9aa0a6; }

body.grp-dark .grp-s-switch-label { color: #e3e3e3; }

body.grp-dark .grp-font-btn { background: #3c3c3c; color: #c4c7c5; }

body.grp-dark .grp-font-btn:hover { background: #484848; }

body.grp-dark .grp-font-btn.active { background: #004a77; color: #c2e7ff; border-color: #1a73e8; }

body.grp-dark .grp-input { background: #3c3c3c; border-color: #5f6368; color: #e3e3e3; }

body.grp-dark .grp-input:focus { border-color: #8ab4f8; }

body.grp-dark .grp-slider-val { color: #9aa0a6; }

  

/* 修复输入栏渐变遮罩冲突 */

body.grp-reader .input-gradient,
body.grp-reader input-container.input-gradient,
body.grp-reader .input-area-container,
body.grp-reader .input-area-container::before,
body.grp-reader .input-area-container::after,
body.grp-reader input-container,
body.grp-reader input-container::before,
body.grp-reader input-container::after {

background: var(--grp-bg) !important;

background-image: none !important;

}

body.grp-reader .top-gradient-container,

body.grp-reader .scroll-container::before,

body.grp-reader .scroll-container::after {

background: transparent !important;

background-image: none !important;

display: none !important;

}

  

/* Toggle switch */

.grp-toggle {

position: relative; width: 44px; height: 24px; cursor: pointer;

}

.grp-toggle input { opacity: 0; width: 0; height: 0; }

.grp-toggle-track {

position: absolute; inset: 0;

background: #dadce0; border-radius: 12px;

transition: background 0.2s;

}

.grp-toggle input:checked + .grp-toggle-track { background: #1a73e8; }

.grp-toggle-thumb {

position: absolute; top: 3px; left: 3px;

width: 18px; height: 18px; background: #fff;

border-radius: 50%; transition: left 0.2s;

box-shadow: 0 1px 3px rgba(0,0,0,0.2);

}

.grp-toggle input:checked ~ .grp-toggle-thumb { left: 23px; }

  

/* 颜色选择 */

.grp-color-row { display: flex; gap: 8px; }

.grp-color-btn {

flex: 1; height: 36px; border-radius: 10px; cursor: pointer;

border: 2px solid transparent; transition: transform 0.1s;

box-shadow: 0 1px 3px rgba(0,0,0,0.12);

}

.grp-color-btn.active { border-color: #1a73e8; transform: scale(0.95); }

  

/* 字体选择 */

.grp-font-row { display: flex; gap: 8px; }

.grp-font-btn {

flex: 1; padding: 8px 0; text-align: center;

background: #f1f3f4; border-radius: 10px;

font-size: 13px; cursor: pointer; color: #3c4043;

border: 2px solid transparent; transition: background 0.15s;

}

.grp-font-btn:hover { background: #e8eaed; }

.grp-font-btn.active { background: #e8f0fe; color: #1967d2; border-color: #1a73e8; font-weight: 500; }

  

/* 滑块行 */

.grp-slider-row { display: flex; align-items: center; gap: 10px; }

.grp-slider-row input[type=range] {

flex: 1; accent-color: #1a73e8; height: 4px;

}

.grp-slider-val {

width: 40px; text-align: center; font-size: 13px;

color: #5f6368; font-variant-numeric: tabular-nums;

}

  

/* 自定义字体输入 */

.grp-input {

width: 100%; padding: 10px 12px; border: 1px solid #dadce0;

border-radius: 8px; font-size: 13px; color: #202124;

box-sizing: border-box; outline: none;

}

.grp-input:focus { border-color: #1a73e8; }

`);

  

// ─── DOM 工具 ─────────────────────────────────────────────────

function el(tag, attrs = {}, children = []) {

const e = document.createElement(tag);

Object.entries(attrs).forEach(([k, v]) => {

if (k === 'cls') e.className = v;

else if (k === 'text') e.textContent = v;

else e.setAttribute(k, v);

});

children.forEach(c => c && e.appendChild(c));

return e;

}

  

function waitFor(selector, timeout = 10000) {

return new Promise((resolve, reject) => {

const found = document.querySelector(selector);

if (found) return resolve(found);

const obs = new MutationObserver(() => {

const node = document.querySelector(selector);

if (node) { obs.disconnect(); resolve(node); }

});

obs.observe(document.body, { childList: true, subtree: true });

setTimeout(() => { obs.disconnect(); reject(new Error('timeout: ' + selector)); }, timeout);

});

}

  

function syncFooterVisibility() {

document.querySelectorAll('hallucination-disclaimer,.hallucination-disclaimer').forEach((node) => {
node.style.display = cfg.hideFooter ? 'none' : '';
});

}

  

function fixMarkdownRenderArtifacts(root = document) {

const containers = root?.matches?.('.model-response-text')
? [root]
: Array.from(root?.querySelectorAll?.('.model-response-text') || []);

containers.forEach((container) => {
const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
acceptNode(node) {
if (!node.nodeValue || !node.nodeValue.includes('**')) return NodeFilter.FILTER_REJECT;
const parent = node.parentElement;
if (!parent || parent.closest('pre, code, textarea, script, style')) {
return NodeFilter.FILTER_REJECT;
}
return NodeFilter.FILTER_ACCEPT;
},
});

const textNodes = [];
while (walker.nextNode()) textNodes.push(walker.currentNode);

textNodes.forEach((node) => {
node.nodeValue = node.nodeValue.replace(/\*\*/g, '');
});

container.normalize();
});

}

  

// ─── 应用配置 ─────────────────────────────────────────────────

function applyConfig() {

const root = document.documentElement;

const t = THEMES[cfg.theme] || THEMES.yellow;

root.style.setProperty('--grp-bg', t.bg);

root.style.setProperty('--grp-text', t.text);

root.style.setProperty('--grp-accent', t.accent);

root.style.setProperty('--grp-input-bg', t.inputBg);

  

const fontStack = cfg.fontType === 'custom' && cfg.customFontName

? `"${cfg.customFontName}",sans-serif`

: (FONTS[cfg.fontType] || FONTS.serif);

root.style.setProperty('--grp-font', fontStack);

root.style.setProperty('--grp-fs', cfg.fontSize + 'px');

root.style.setProperty('--grp-lh', cfg.lineHeight);

root.style.setProperty('--grp-ls', cfg.letterSpacing + 'px');

root.style.setProperty('--grp-max-w', cfg.maxWidth + 'px');

  

document.body.classList.add('grp-reader');

document.body.classList.toggle('grp-public', cfg.publicStyle);

document.body.classList.toggle('grp-hide-footer', cfg.hideFooter);

syncFooterVisibility();

  

if (cfg.fontType === 'custom' && cfg.customFontUrl) {

let link = document.getElementById('grp-custom-font');

if (!link) {

link = document.createElement('link');

link.id = 'grp-custom-font';

link.rel = 'stylesheet';

document.head.appendChild(link);

}

if (link.href !== cfg.customFontUrl) link.href = cfg.customFontUrl;

}

}

  

// ─── 目录 ─────────────────────────────────────────────────────

let tocPanel, tocList, tocOpen = false;

let scrollObserver = null;

  

function buildTocPanel() {

if (document.getElementById('grp-toc-panel')) return;

  

tocPanel = el('div', { id: 'grp-toc-panel' }, [

el('div', { id: 'grp-toc-header' }, [

el('span', { text: '目录' }),

el('div', { id: 'grp-toc-close', text: '✕' }),

]),

(tocList = el('div', { id: 'grp-toc-list' })),

]);

document.body.appendChild(tocPanel);

document.getElementById('grp-toc-close').addEventListener('click', toggleToc);

}

  

function toggleToc() {

buildTocPanel();

tocOpen = !tocOpen;

tocPanel.style.right = tocOpen ? '0' : 'calc(-1 * var(--grp-toc-w))';

document.body.classList.toggle('grp-toc-open', tocOpen);

if (tocOpen) refreshToc();

}

  

function refreshToc() {

if (!tocList) return;

tocList.replaceChildren();

  

const main = document.querySelector('#chat-history');

if (!main) {

const empty = el('div', { text: '暂无内容' });

empty.style.cssText = 'padding:16px;color:#999;font-size:13px';

tocList.appendChild(empty);

return;

}

  

const items = [];
const tocNodes = Array.from(main.querySelectorAll('.query-text.gds-body-l, .model-response-text'));

tocNodes.forEach((node) => {

if (node.matches('.query-text.gds-body-l')) {

const text = node.textContent.trim().replace(/\s+/g, ' ');
if (!text) return;

const label = text.length > 30 ? text.slice(0, 30) + '…' : text;
const scrollTarget = node.closest('.user-query-container') || node;
const div = el('div', { cls: 'grp-toc-item grp-toc-user', text: label });

div.addEventListener('click', () => {
items.forEach(item => item.el.classList.remove('active'));
div.classList.add('active');
smoothScrollTo(scrollTarget);
});

tocList.appendChild(div);
items.push({ el: div, target: scrollTarget });
return;

}

const headings = Array.from(node.querySelectorAll('h1, h2, h3')).filter((heading) => heading.textContent.trim());

if (headings.length) {
headings.forEach((heading) => {
const text = heading.textContent.trim().replace(/\s+/g, ' ');
const label = text.length > 42 ? text.slice(0, 42) + '…' : text;
const level = heading.tagName.toLowerCase();
const div = el('div', { cls: `grp-toc-item grp-toc-${level}`, text: label });

div.addEventListener('click', () => {
items.forEach(item => item.el.classList.remove('active'));
div.classList.add('active');
smoothScrollTo(heading);
});

tocList.appendChild(div);
items.push({ el: div, target: heading });
});

return;

}

const fallbackText = getResponseTocLabel(node);
if (!fallbackText) return;

const label = fallbackText.length > 42 ? fallbackText.slice(0, 42) + '…' : fallbackText;
const div = el('div', { cls: 'grp-toc-item grp-toc-ai', text: label });

div.addEventListener('click', () => {
items.forEach(item => item.el.classList.remove('active'));
div.classList.add('active');
smoothScrollTo(node);
});

tocList.appendChild(div);
items.push({ el: div, target: node });

});

  

if (items.length === 0) {

const empty = el('div', { text: '暂无标题' });

empty.style.cssText = 'padding:16px;color:#999;font-size:13px';

tocList.appendChild(empty);

return;

}

  

setupScrollHighlight(items);

}

  

function getResponseTocLabel(node) {

const candidates = [
node.querySelector('p'),
node.querySelector('li'),
node.querySelector('h3'),
node.querySelector('blockquote'),
node.querySelector('.markdown'),
node,
];

for (const candidate of candidates) {
const text = candidate?.textContent?.trim().replace(/\s+/g, ' ');
if (text) return text;
}

return '';

}

  

function getScrollContainer(target) {

let current = target?.parentElement || null;

while (current && current !== document.body) {

const style = window.getComputedStyle(current);
const overflowY = style.overflowY || '';

if (/(auto|scroll|overlay)/.test(overflowY) && current.scrollHeight > current.clientHeight + 4) {
return current;
}

current = current.parentElement;

}

return document.scrollingElement || document.documentElement;

}

  

function smoothScrollTo(target) {

if (!target) return;

const container = getScrollContainer(target);

const offset = 80;

if (container && container !== document.scrollingElement && container !== document.documentElement && container !== document.body) {

const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - offset;

container.scrollTo({ top, behavior: 'smooth' });

} else {

const top = target.getBoundingClientRect().top + window.scrollY - offset;

window.scrollTo({ top, behavior: 'smooth' });

}

}

  

function setupScrollHighlight(items) {

if (scrollObserver) scrollObserver.disconnect();

const rootContainer = items[0]?.target ? getScrollContainer(items[0].target) : null;
const observerRoot =
rootContainer && rootContainer !== document.scrollingElement && rootContainer !== document.documentElement && rootContainer !== document.body
? rootContainer
: null;

const io = new IntersectionObserver((entries) => {

entries.forEach(entry => {

if (entry.isIntersecting) {

const match = items.find(i => i.target === entry.target);

if (match) {

items.forEach(i => i.el.classList.remove('active'));

match.el.classList.add('active');

}

}

});

}, { root: observerRoot, threshold: 0.3, rootMargin: '-60px 0px -60% 0px' });

  

items.forEach(i => io.observe(i.target));

scrollObserver = io;

}

  

// ─── 设置面板 ─────────────────────────────────────────────────

function buildSettings() {

if (document.getElementById('grp-overlay')) return;

  

const overlay = el('div', { id: 'grp-overlay' });

overlay.style.display = 'none';

overlay.addEventListener('click', closeSettings);

document.body.appendChild(overlay);

  

const panel = el('div', { id: 'grp-settings' });

panel.style.display = 'none';

  

// 头部

const header = el('div', { cls: 'grp-s-header' }, [

el('span', { text: '阅读设置' }),

el('div', { cls: 'grp-s-close', text: '✕' }),

]);

header.querySelector('.grp-s-close').addEventListener('click', closeSettings);

panel.appendChild(header);

  

const body = el('div', { cls: 'grp-s-body' });

panel.appendChild(body);

  

// 主题

const themeRow = el('div', { cls: 'grp-s-row' }, [el('div', { cls: 'grp-s-label', text: '背景主题' })]);

const colorRow = el('div', { cls: 'grp-color-row' });

[

{ id: 'yellow', bg: '#f6f1e7' },

{ id: 'white', bg: '#ffffff', border: '1px solid #ddd' },

{ id: 'green', bg: '#cce8cf' },

{ id: 'dark', bg: '#242628' },

].forEach(c => {

const btn = el('div', { cls: 'grp-color-btn' + (cfg.theme === c.id ? ' active' : '') });

btn.style.background = c.bg;

if (c.border) btn.style.border = c.border;

btn.dataset.val = c.id;

btn.addEventListener('click', () => {

colorRow.querySelectorAll('.grp-color-btn').forEach(b => b.classList.remove('active'));

btn.classList.add('active');

cfg.theme = c.id; applyConfig(); saveCfg(cfg);

});

colorRow.appendChild(btn);

});

themeRow.appendChild(colorRow);

body.appendChild(themeRow);

  

// 字体

const fontRow = el('div', { cls: 'grp-s-row' }, [el('div', { cls: 'grp-s-label', text: '字体' })]);

const fontBtns = el('div', { cls: 'grp-font-row' });

[{ id: 'serif', name: '宋体' }, { id: 'sans', name: '黑体' }, { id: 'custom', name: '自定义' }].forEach(f => {

const btn = el('div', { cls: 'grp-font-btn' + (cfg.fontType === f.id ? ' active' : ''), text: f.name });

btn.dataset.val = f.id;

btn.addEventListener('click', () => {

fontBtns.querySelectorAll('.grp-font-btn').forEach(b => b.classList.remove('active'));

btn.classList.add('active');

cfg.fontType = f.id; applyConfig(); saveCfg(cfg);

customFontRow.style.display = f.id === 'custom' ? 'flex' : 'none';

});

fontBtns.appendChild(btn);

});

fontRow.appendChild(fontBtns);

  

const customFontRow = el('div', { cls: 'grp-s-row' });

customFontRow.style.display = cfg.fontType === 'custom' ? 'flex' : 'none';

customFontRow.style.flexDirection = 'column';

customFontRow.style.gap = '6px';

const cfName = el('input', { cls: 'grp-input', placeholder: '字体名称，如 LXGW WenKai' });

cfName.value = cfg.customFontName;

cfName.addEventListener('input', () => { cfg.customFontName = cfName.value; applyConfig(); saveCfg(cfg); });

const cfUrl = el('input', { cls: 'grp-input', placeholder: '字体 CSS URL（可选）' });

cfUrl.value = cfg.customFontUrl;

cfUrl.addEventListener('input', () => { cfg.customFontUrl = cfUrl.value; applyConfig(); saveCfg(cfg); });

customFontRow.append(cfName, cfUrl);

fontRow.appendChild(customFontRow);

body.appendChild(fontRow);

  

// 字体大小

body.appendChild(makeSlider('字体大小', 'fontSize', 14, 28, 1, (v) => {

cfg.fontSize = v; applyConfig(); saveCfg(cfg);

}));

  

// 行高

body.appendChild(makeSlider('行高', 'lineHeight', 1.2, 2.4, 0.1, (v) => {

cfg.lineHeight = v; applyConfig(); saveCfg(cfg);

}));

  

// 字间距

body.appendChild(makeSlider('字间距', 'letterSpacing', 0, 4, 0.5, (v) => {

cfg.letterSpacing = v; applyConfig(); saveCfg(cfg);

}));

  

// 阅读宽度

body.appendChild(makeSlider('阅读宽度', 'maxWidth', 600, 1400, 50, (v) => {

cfg.maxWidth = v; applyConfig(); saveCfg(cfg);

}));

  

// 公众号高亮

body.appendChild(makeSwitch('公众号风格高亮（加粗半覆盖）', 'publicStyle', (v) => {

cfg.publicStyle = v; applyConfig(); saveCfg(cfg);

}));

  

// 隐藏底部免责声明

body.appendChild(makeSwitch('隐藏底部免责声明', 'hideFooter', (v) => {

cfg.hideFooter = v; applyConfig(); saveCfg(cfg);

}));

  

document.body.appendChild(panel);

}

  

function makeSwitch(label, key, onChange) {

const row = el('div', { cls: 'grp-s-switch-row' }, [

el('span', { cls: 'grp-s-switch-label', text: label }),

]);

const toggle = el('label', { cls: 'grp-toggle' });

const input = el('input', { type: 'checkbox' });

input.checked = cfg[key];

input.addEventListener('change', () => onChange(input.checked));

const track = el('div', { cls: 'grp-toggle-track' });

const thumb = el('div', { cls: 'grp-toggle-thumb' });

toggle.append(input, track, thumb);

row.appendChild(toggle);

return row;

}

  

function makeSlider(label, key, min, max, step, onChange) {

const row = el('div', { cls: 'grp-s-row' }, [el('div', { cls: 'grp-s-label', text: label })]);

const sliderRow = el('div', { cls: 'grp-slider-row' });

const slider = el('input', { type: 'range' });

slider.min = min; slider.max = max; slider.step = step; slider.value = cfg[key];

const val = el('div', { cls: 'grp-slider-val', text: cfg[key] });

slider.addEventListener('input', () => {

const v = parseFloat(slider.value);

val.textContent = v;

onChange(v);

});

sliderRow.append(slider, val);

row.appendChild(sliderRow);

return row;

}

  

function openSettings() {

buildSettings();

const overlay = document.getElementById('grp-overlay');

const panel = document.getElementById('grp-settings');

if (overlay) overlay.style.display = 'block';

if (panel) panel.style.display = 'flex';

}

function closeSettings() {

const overlay = document.getElementById('grp-overlay');

const panel = document.getElementById('grp-settings');

if (overlay) overlay.style.display = 'none';

if (panel) panel.style.display = 'none';

}

const DEFAULT_NATIVE_ICON_CLASS =
'mat-icon notranslate gds-icon-l google-symbols mat-ligature-font mat-icon-no-color';

const NATIVE_ICON_STYLE_PROPS = [
'font-variation-settings',
'font-size',
'line-height',
'color',
];

function getNativeSidebarIconStyle(referenceBtn) {

const nativeIcon = referenceBtn?.querySelector('mat-icon');
const style = {
className: DEFAULT_NATIVE_ICON_CLASS,
inlineStyles: {},
};

if (!nativeIcon) return style;

const nativeClassName = nativeIcon.getAttribute('class');
if (nativeClassName && nativeClassName.trim()) {
style.className = nativeClassName.trim();
}

const computed = window.getComputedStyle(nativeIcon);
NATIVE_ICON_STYLE_PROPS.forEach((prop) => {
const value = computed.getPropertyValue(prop).trim();
if (value) style.inlineStyles[prop] = value;
});

return style;

}

function resetInjectedButtonOffsets() {

['grp-btn-toc', 'grp-btn-settings'].forEach((id) => {
const btn = document.getElementById(id);
if (!btn) return;
btn.style.transform = '';
btn.style.width = '';
btn.style.minWidth = '';
btn.style.justifyContent = 'center';
btn.style.paddingLeft = '';
btn.style.paddingRight = '';
btn.style.boxSizing = '';
});

}

function alignInjectedButtonsToNativeSettings() {

const actionList = document.querySelector('mat-action-list.desktop-controls');
const settingsBtn = actionList?.querySelector('[data-test-id="settings-and-help-button"]');
const nativeIcon = settingsBtn?.querySelector('mat-icon');

if (!nativeIcon) {
resetInjectedButtonOffsets();
return;
}

const nativeRect = nativeIcon.getBoundingClientRect();
const nativeCenterX = nativeRect.left + (nativeRect.width / 2);
const settingsRect = settingsBtn.getBoundingClientRect();
const iconLeftInset = Math.round(nativeRect.left - settingsRect.left);
const buttonWidth = Math.round(settingsRect.width);

['grp-btn-toc', 'grp-btn-settings'].forEach((id) => {
const btn = document.getElementById(id);
const icon = btn?.querySelector('mat-icon');
if (!btn || !icon) return;

btn.style.transform = '';
btn.style.boxSizing = 'border-box';
btn.style.width = `${buttonWidth}px`;
btn.style.minWidth = `${buttonWidth}px`;
btn.style.justifyContent = 'flex-start';
btn.style.paddingLeft = `${iconLeftInset}px`;
btn.style.paddingRight = '0';

const iconRect = icon.getBoundingClientRect();
const iconCenterX = iconRect.left + (iconRect.width / 2);
const deltaX = Math.round(nativeCenterX - iconCenterX);

if (Number.isFinite(deltaX) && deltaX !== 0) {
btn.style.transform = `translateX(${deltaX}px)`;
}
});

}

let alignButtonsRaf = 0;

function scheduleButtonAlignment() {

if (alignButtonsRaf) cancelAnimationFrame(alignButtonsRaf);
alignButtonsRaf = requestAnimationFrame(() => {
alignButtonsRaf = 0;
alignInjectedButtonsToNativeSettings();
});

}

function scheduleButtonAlignmentRetries() {

scheduleButtonAlignment();
setTimeout(scheduleButtonAlignment, 160);
setTimeout(scheduleButtonAlignment, 600);

}

  

// ─── 插入左下角按钮 ───────────────────────────────────────────

function injectButtons() {

const actionList = document.querySelector('mat-action-list.desktop-controls');

if (!actionList || document.getElementById('grp-btn-toc')) return;

const settingsBtn = actionList.querySelector('[data-test-id="settings-and-help-button"]');
const nativeIconStyle = getNativeSidebarIconStyle(settingsBtn);

  

// 用原生 button 样式，不套 Angular 组件（避免事件被拦截）

function makeNativeBtn(id, icon, ariaLabel, onClick, iconStyle) {

const btn = el('button', {

id,

cls: 'mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-ripple side-nav-action-collapsed-button explicit-gmat-override mat-unthemed',

'aria-label': ariaLabel,

title: ariaLabel,

});

btn.style.cssText = 'display:flex;align-items:center;justify-content:center;';

  

const iconEl = el('mat-icon', {

role: 'img',

cls: 'mat-icon notranslate gds-icon-l google-symbols mat-ligature-font mat-icon-no-color',

'aria-hidden': 'true',

'data-mat-icon-type': 'font',

text: icon,

});

iconEl.className = iconStyle.className || DEFAULT_NATIVE_ICON_CLASS;
Object.entries(iconStyle.inlineStyles || {}).forEach(([prop, value]) => {
iconEl.style.setProperty(prop, value);
});

  

btn.appendChild(iconEl);

// mousedown 比 click 更早，防止 Angular zone 拦截

btn.addEventListener('mousedown', (e) => {

e.preventDefault();

e.stopPropagation();

onClick();

});

return btn;

}

  

const btnToc = makeNativeBtn('grp-btn-toc', 'menu_book', '目录', toggleToc, nativeIconStyle);

const btnSettings = makeNativeBtn('grp-btn-settings', 'tune', '阅读设置', openSettings, nativeIconStyle);

  

// 插在 settings-and-help-button 之前

if (settingsBtn) {

actionList.insertBefore(btnToc, settingsBtn);

actionList.insertBefore(btnSettings, settingsBtn);

} else {

actionList.prepend(btnSettings);

actionList.prepend(btnToc);

}

scheduleButtonAlignmentRetries();

}

  

// ─── MutationObserver 监听对话更新 ───────────────────────────

function initObserver() {

const target = document.querySelector('#chat-history') || document.body;

let timer;

const obs = new MutationObserver(() => {

clearTimeout(timer);

timer = setTimeout(() => {

fixMarkdownRenderArtifacts(target);

if (tocOpen) refreshToc();

}, 800);

});

obs.observe(target, { childList: true, subtree: true });

}

  

// ─── 初始化 ───────────────────────────────────────────────────

async function init() {

try {

await waitFor('mat-action-list.desktop-controls', 15000);

} catch (e) {

console.warn('[GRP] sidebar not found, falling back');

}

  

applyConfig();

fixMarkdownRenderArtifacts(document);

injectButtons();

scheduleButtonAlignmentRetries();

initObserver();

window.addEventListener('resize', scheduleButtonAlignment);

  

// 路由变化时重新注入（SPA）

let lastUrl = location.href;

setInterval(() => {

if (location.href !== lastUrl) {

lastUrl = location.href;

setTimeout(() => {
fixMarkdownRenderArtifacts(document);
injectButtons();
scheduleButtonAlignmentRetries();
if (tocOpen) refreshToc();
}, 1000);

}

}, 500);

  

// 深色模式检测：监听 body.dark-theme

function syncDarkMode() {

const isDark = document.body.classList.contains('dark-theme');

document.body.classList.toggle('grp-dark', isDark);

}

syncDarkMode();

new MutationObserver(syncDarkMode).observe(document.body, {

attributes: true, attributeFilter: ['class']

});

  

console.log('[GRP] Gemini Reader Pro loaded');

}

  

init();

  

})();
