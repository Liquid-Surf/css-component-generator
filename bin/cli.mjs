#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

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

                Object.entries(caseVariations).forEach(([caseType, caseValue]) => {
                    let placeholder;
                    switch (caseType) {
                        case 'pascalCase':
                            placeholder = 'TemplateName';
                            break;
                        case 'camelCase':
                            placeholder = 'templateName';
                            break;
                        case 'snakeCase':
                            placeholder = 'template_name';
                            break;
                        default:
                            placeholder = 'template-name';
                    }

                    const placeholderRegex = new RegExp(placeholder, 'g');
                    content = content.replace(placeholderRegex, caseValue);
                    newFileName = newFileName.replace(placeholderRegex, caseValue);
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
console.log("ok")
// Only run the CLI if this file is being run directly
console.log(process.argv[1])
console.log(fileURLToPath(import.meta.url))

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
