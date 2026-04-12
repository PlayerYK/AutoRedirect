#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 读取 manifest.json 获取版本号
function getVersion() {
  try {
    const manifestPath = path.join(__dirname, 'src', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return manifest.version;
  } catch (error) {
    console.error('❌ 无法读取 src/manifest.json 文件:', error.message);
    process.exit(1);
  }
}

// 检查是否安装了 zip 命令
function checkZipCommand() {
  try {
    execSync('which zip', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 创建 dist 目录
function ensureDistDirectory() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 创建 dist 目录');
  }
}

// 创建打包
function createPackage() {
  const version = getVersion();
  const zipName = `AutoRedirect-${version}.zip`;
  const distDir = path.join(__dirname, 'dist');
  const zipPath = path.join(distDir, zipName);
  
  console.log(`📦 开始打包 AutoRedirect v${version}...`);
  
  // 检查 zip 命令
  if (!checkZipCommand()) {
    console.error('❌ 系统未安装 zip 命令，请先安装 zip 工具');
    console.log('💡 在 macOS 上，zip 命令通常已预装');
    console.log('💡 如果没有，可以通过 brew install zip 安装');
    process.exit(1);
  }
  
  // 确保 dist 目录存在
  ensureDistDirectory();
  
  // 删除已存在的 zip 文件
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    console.log(`🗑️  删除已存在的 ${zipName}`);
  }
  
  try {
    // 切换到 src 目录进行打包
    const srcDir = path.join(__dirname, 'src');
    
    console.log('🔄 执行打包命令...');
    console.log(`📂 打包源目录: ${srcDir}`);
    console.log(`📦 输出文件: ${zipPath}`);
    
    // 使用 zip 命令打包 src 目录的所有内容（排除系统文件）
    const zipCommand = `cd "${srcDir}" && zip -r "${zipPath}" . -x "*.DS_Store" -x "__MACOSX/*" -x "*.swp" -x "*~"`;
    execSync(zipCommand, { stdio: 'inherit' });
    
    // 检查文件是否创建成功
    if (fs.existsSync(zipPath)) {
      const stats = fs.statSync(zipPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`✅ 打包完成！`);
      console.log(`📁 文件名: ${zipName}`);
      console.log(`📏 文件大小: ${fileSizeInMB} MB`);
      console.log(`📍 文件位置: ${zipPath}`);
      
      // 显示包含的文件列表
      console.log('\n📋 包含的文件:');
      try {
        const listCommand = `unzip -l "${zipPath}"`;
        execSync(listCommand, { stdio: 'inherit' });
      } catch (error) {
        console.log('💡 可以使用 unzip -l ' + zipPath + ' 查看包含的文件');
      }
      
    } else {
      console.error('❌ 打包失败，未找到生成的 zip 文件');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 打包过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 主函数
function main() {
  console.log('🚀 AutoRedirect 扩展打包工具');
  console.log('================================');
  
  createPackage();
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { getVersion, createPackage }; 