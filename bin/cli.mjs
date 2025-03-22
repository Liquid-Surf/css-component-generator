#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { TEMPLATE_PLACEHOLDERS } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getTemplates(templatesDir = path.join(__dirname, '../templates')) {
    return fs.readdirSync(templatesDir).filter(file => {
        const templatePath = path.join(templatesDir, file);
        return fs.statSync(templatePath).isDirectory();
    });
}

export function isKebabCase(str) {
    const kebabCasePattern = /^[a-z]+(-[a-z]+)*$/;
    return kebabCasePattern.test(str);
}

export function generateCaseVariations(name) {
    const camelCase = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    const kebabCase = name.toLowerCase();
    const snakeCase = name.replace(/-/g, '_');
    return { pascalCase, camelCase, kebabCase, snakeCase };
}

export function scaffoldComponent(templateName, componentName, options = {}) {
    const {
        templatesDir = path.join(__dirname, '../templates'),
        targetDir = path.join(process.cwd(), componentName)
    } = options;

    const sourceDir = path.join(templatesDir, templateName);

    fs.copySync(sourceDir, targetDir);

    const caseVariations = generateCaseVariations(componentName);

    function processDirectory(dir) {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                processDirectory(fullPath);
            } else {
                let content = fs.readFileSync(fullPath, 'utf-8');
                let newFileName = item;

                // Replace source patterns with destination patterns
                Object.entries(caseVariations).forEach(([caseType, sourceValue]) => {
                    const destinationValue = caseVariations[caseType];
                    const placeholder = TEMPLATE_PLACEHOLDERS[caseType];
                    const placeholderRegex = new RegExp(placeholder, 'g');
                    content = content.replace(placeholderRegex, destinationValue);
                    newFileName = newFileName.replace(placeholderRegex, destinationValue);
                });

                fs.writeFileSync(fullPath, content, 'utf-8');
                if (newFileName !== item) {
                    fs.renameSync(fullPath, path.join(dir, newFileName));
                }
            }
        });
    }

    processDirectory(targetDir);
}

const currentFileRealPath = fs.realpathSync(fileURLToPath(import.meta.url));
if (process.argv[1] && fs.realpathSync(process.argv[1]) === currentFileRealPath) {
    const templates = getTemplates();

    inquirer.prompt([
        {
            type: 'input',
            name: 'componentName',
            message: 'Enter the component name (in kebab-case):',
            validate: input => isKebabCase(input) ? true : 'Component name must be in kebab-case (e.g., my-component-name).'
        },
        {
            type: 'list',
            name: 'templateName',
            message: 'Select a template:',
            choices: templates
        }
    ]).then(answers => {
        scaffoldComponent(answers.templateName, answers.componentName);
        console.log(`Component '${answers.componentName}' has been created using the '${answers.templateName}' template.`);
    });
}
