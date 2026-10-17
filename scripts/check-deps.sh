#!/usr/bin/env bash
# Check source cleanup and retained upstream attribution during the Rust transition.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node --input-type=module <<'JS'
import fs from 'node:fs';
import path from 'node:path';

const attribution = [
  'third_party/RTCPilot/LICENSE',
  'third_party/RTCPilot/UPSTREAM.md',
  'third_party/RTCPilot/3rdparty/libuv/AUTHORS',
  'third_party/RTCPilot/3rdparty/libuv/LICENSE',
  'third_party/RTCPilot/3rdparty/libuv/LICENSE-docs',
  'third_party/RTCPilot/3rdparty/libuv/LICENSE-extra',
  'third_party/RTCPilot/3rdparty/yaml-cpp/LICENSE',
  'third_party/RTCPilot/3rdparty/yaml-cpp/test/googletest-1.13.0/LICENSE',
];
const ignored = new Set(['.git', '.agents', 'node_modules', 'build', 'out', 'dist', 'target', '.xmake']);
const nativeExtensions = new Set([
  '.c', '.cc', '.cpp', '.cxx', '.c++', '.h', '.hh', '.hpp', '.hxx', '.h++',
  '.ipp', '.tpp', '.inl', '.ixx', '.cppm', '.cuh', '.cu', '.cmake',
  '.sln', '.vcxproj', '.filters', '.a', '.lib', '.so', '.dylib', '.dll', '.exe',
  '.o', '.obj', '.node',
]);
const failures = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name) && !entry.name.startsWith('cmake-build-')) walk(file);
    } else if (entry.name === 'CMakeLists.txt' || nativeExtensions.has(path.extname(entry.name).toLowerCase())) {
      failures.push(`Retired native file remains: ${file}`);
    }
  }
}
for (const file of attribution) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
    failures.push(`Missing upstream attribution: ${file}`);
  }
}
walk('.');
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log('Native source/build/artifact cleanup and upstream attribution checks passed.');
console.log('Rust application dependencies and runtime are not implemented by this cleanup.');
JS
