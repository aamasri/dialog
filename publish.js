const packageJson = require('./package.json');
const version = packageJson.version;
const description = packageJson.versionDescription;

console.log(`releasing dialog ${version} - ${description}`);

// function to run bash commands
const execSync = require('child_process').execSync;
function runShell(command) {
    return execSync(command, { encoding: 'utf-8' });
}

console.info(`\n  installing npm dependencies...`);
runShell('npm install');

console.info(`\n  building browser dist folder...`);
runShell('npm run build-production');

console.info(`\n  git committing...`);
runShell(`git commit -a -m "Release version ${version} - ${description}"`);

console.info(`\n  git tagging...`);
runShell(`git tag ${version}`);
runShell(`git tag -f latest`);

console.info(`\n  git pushing...`);
runShell(`git push origin master :refs/tags/latest`);
runShell(`git push origin master --tags`);

console.info(`\n  publishing to npmjs...`);
runShell(`npm publish`);