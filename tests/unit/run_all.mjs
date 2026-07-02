#!/usr/bin/env node
// 白盒单元测试主入口：运行所有测试模块
import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(__dirname)
  .filter(f => f.endsWith('.test.mjs'))
  .map(f => join(__dirname, f));

console.log(`\n=== 白盒单元测试 ===`);
console.log(`找到 ${files.length} 个测试模块:\n`);
files.forEach(f => console.log(`  - ${f.split('\\').pop()}`));
console.log('');

const results = [];
for (const file of files) {
  const name = file.split('\\').pop().replace('.test.mjs', '');
  console.log(`\n--- 运行: ${name} ---`);
  const exitCode = await new Promise((resolve) => {
    const proc = spawn(process.execPath, ['--test', file], { stdio: 'inherit' });
    proc.on('close', resolve);
  });
  results.push({ name, passed: exitCode === 0, exitCode });
}

console.log('\n=== 测试汇总 ===');
let allPass = true;
results.forEach(r => {
  const status = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`  ${status}  ${r.name}`);
  if (!r.passed) allPass = false;
});

const total = results.length;
const passed = results.filter(r => r.passed).length;
console.log(`\n总计: ${passed}/${total} 模块通过`);
process.exit(allPass ? 0 : 1);
