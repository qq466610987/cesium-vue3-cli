#! /usr/bin/env node
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const isObject = (val) => val && typeof val === 'object';
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]));
/**
 * Recursively merge the content of the new object to the existing one
 * @param {Object} target the existing object
 * @param {Object} obj the new object
 */
function deepMerge(target, obj) {
    for (const key of Object.keys(obj)) {
        const oldVal = target[key];
        const newVal = obj[key];
        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            target[key] = mergeArrayWithDedupe(oldVal, newVal);
        }
        else if (isObject(oldVal) && isObject(newVal)) {
            target[key] = deepMerge(oldVal, newVal);
        }
        else {
            target[key] = newVal;
        }
    }
    return target;
}

function sortDependencies(packageJson) {
    const sorted = {};
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    for (const depType of depTypes) {
        if (packageJson[depType]) {
            sorted[depType] = {};
            Object.keys(packageJson[depType])
                .sort()
                .forEach((name) => {
                sorted[depType][name] = packageJson[depType][name];
            });
        }
    }
    return Object.assign(Object.assign({}, packageJson), sorted);
}

// #! 符号的名称叫 Shebang，用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 cli.js 实现修改
console.log('my cli init');
inquirer.prompt([
    {
        type: 'input',
        name: 'projectName',
        message: 'projectName',
        default: 'my-node-cli',
        validate: (val) => {
            if (!val) {
                return 'please enter projectName';
            }
            return true;
        }
    }
]).then(answers => {
    // const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    path.join(__dirname, 'template');
    const projectName = answers.projectName;
    const cwdUrl = process.cwd();
    const root = path.join(cwdUrl, projectName);
    // 是否存在路径
    if (fs.existsSync(root)) {
        return;
    }
    else {
        fs.mkdirSync(root);
    }
    console.log(`\nScaffolding project in ${root}...`);
    const pkg = { name: projectName, version: '0.0.0' };
    fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(pkg, null, 2));
    const templateRoot = path.resolve(__dirname, 'template');
    function render(templateName) {
        const templateDir = path.resolve(templateRoot, templateName);
        renderTemplate(templateDir, root);
    }
    // render base templates
    render('base');
});
function renderTemplate(src, dest, callbacks) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        // skip node_module
        if (path.basename(src) === 'node_modules') {
            return;
        }
        // if it's a directory, render its subdirectories and files recursively
        fs.mkdirSync(dest, { recursive: true });
        console.log(fs.readdirSync(src));
        for (const file of fs.readdirSync(src)) {
            renderTemplate(path.resolve(src, file), path.resolve(dest, file));
        }
        return;
    }
    const filename = path.basename(src);
    if (filename === 'package.json' && fs.existsSync(dest)) {
        // merge instead of overwriting
        const existing = JSON.parse(fs.readFileSync(dest, 'utf8'));
        const newPackage = JSON.parse(fs.readFileSync(src, 'utf8'));
        const pkg = sortDependencies(deepMerge(existing, newPackage));
        fs.writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n');
        return;
    }
    fs.copyFileSync(src, dest);
}
