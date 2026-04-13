#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, 'dist');
const SRC_DIR = path.join(__dirname, 'src');
const MANIFEST_PATH = path.join(SRC_DIR, 'manifest.json');
const PACKAGE_PATH = path.join(__dirname, 'package.json');

const EXCLUDE_PATTERNS = ['.DS_Store', '__MACOSX', '.swp', '~'];

// ── helpers ──

function getVersion() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')).version;
  } catch (error) {
    console.error('❌ 无法读取 src/manifest.json:', error.message);
    process.exit(1);
  }
}

/**
 * 递增版本号并同步写入 manifest.json 和 package.json
 * @param {'major'|'minor'|'patch'} [part='patch']
 * @returns {string} 新版本号
 */
function bumpVersion(part) {
  part = part || 'patch';
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));

  const old = manifest.version;
  const segs = old.split('.').map(Number);

  switch (part) {
    case 'major': segs[0]++; segs[1] = 0; segs[2] = 0; break;
    case 'minor': segs[1]++; segs[2] = 0; break;
    default:      segs[2]++; break;
  }

  const next = segs.join('.');
  manifest.version = next;
  pkg.version = next;

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  console.log(`🔖 版本号 ${old} → ${next}  (${part})`);
  return next;
}

function shouldExclude(name) {
  return EXCLUDE_PATTERNS.some(p => name.includes(p));
}

/** 递归删除目录 */
function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDir(full); else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
}

/** 递归复制目录，跳过排除文件 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (shouldExclude(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function checkZipCommand() {
  try { execSync('which zip', { stdio: 'ignore' }); return true; }
  catch { return false; }
}

// ── commands ──

/**
 * build：bump 版本 → 清空 dist → 复制 src 到 dist/
 * 输出目录固定为 dist/，不带版本号子目录，方便直接加载调试。
 */
function build(options) {
  options = options || {};
  bumpVersion(options.bumpPart || 'patch');

  const version = getVersion();

  console.log(`🔨 Build v${version}`);

  if (fs.existsSync(DIST_DIR)) {
    rmDir(DIST_DIR);
    console.log('🗑️  已清空 dist/');
  }

  copyDir(SRC_DIR, DIST_DIR);

  const count = execSync(`find "${DIST_DIR}" -type f | wc -l`).toString().trim();
  console.log(`✅ 已输出 ${count} 个文件到 dist/`);
}

/**
 * package：bump 版本 → 清空 dist → 复制 src 到 dist/ → 打带版本号的 zip
 */
function pack(options) {
  options = options || {};

  build(options);

  const version = getVersion();
  const zipName = `AutoRedirect-${version}.zip`;
  const zipPath = path.join(DIST_DIR, zipName);

  if (!checkZipCommand()) {
    console.error('❌ 系统未安装 zip 命令');
    process.exit(1);
  }

  console.log(`📦 打包 ${zipName}...`);
  execSync(`cd "${DIST_DIR}" && zip -r "${zipPath}" . -x "*.DS_Store" -x "__MACOSX/*" -x "AutoRedirect-*.zip"`, { stdio: 'inherit' });

  if (!fs.existsSync(zipPath)) {
    console.error('❌ 打包失败');
    process.exit(1);
  }

  const size = (fs.statSync(zipPath).size / 1024).toFixed(1);
  console.log(`✅ ${zipName}  (${size} KB)`);
  console.log(`📍 ${zipPath}`);
}

// ── CLI ──

function main() {
  const args = process.argv.slice(2);
  const cmd = args.find(a => !a.startsWith('-')) || '';

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AutoRedirect 构建工具

命令:
  node build.js              编译：bump 版本 + 清空 dist + 复制 src 到 dist/
  node build.js package      发布：编译 + 打 AutoRedirect-<version>.zip

选项:
  --patch     递增补丁版本 x.y.Z（默认）
  --minor     递增次版本 x.Y.0
  --major     递增主版本 X.0.0

npm scripts:
  npm run build              等同 node build.js
  npm run package            等同 node build.js package
`);
    return;
  }

  console.log('🚀 AutoRedirect 构建工具');
  console.log('================================');

  const options = {};
  if (args.includes('--major')) options.bumpPart = 'major';
  else if (args.includes('--minor')) options.bumpPart = 'minor';

  if (cmd === 'package' || cmd === 'pack') {
    pack(options);
  } else {
    build(options);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getVersion, bumpVersion, build, pack };
