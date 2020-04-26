const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const { execSync } = require('child_process');

const basePath = path.join(__dirname, '..');
const showdownPath = path.join(basePath, 'pokemon-showdown');
if (fs.existsSync(showdownPath)) { rimraf.sync(showdownPath); }
execSync('git clone https://github.com/smogon/pokemon-showdown.git', { cwd: basePath });
execSync('git reset --hard c7431fb', { cwd: showdownPath });
execSync('node ./build', { cwd: showdownPath });
