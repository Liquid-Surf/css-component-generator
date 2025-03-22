import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the functions we want to test
import { getTemplates, isKebabCase, generateCaseVariations, scaffoldComponent } from '../bin/cli.mjs';

describe('CLI Functions', () => {
    describe('isKebabCase', () => {
        test('should return true for valid kebab-case strings', () => {
            expect(isKebabCase('my-component')).toBe(true);
            expect(isKebabCase('user-profile-card')).toBe(true);
            expect(isKebabCase('a-b-c')).toBe(true);
            expect(isKebabCase('a')).toBe(true);
        });

        test('should return false for invalid kebab-case strings', () => {
            expect(isKebabCase('myComponent')).toBe(false);
            expect(isKebabCase('MyComponent')).toBe(false);
            expect(isKebabCase('my_component')).toBe(false);
            expect(isKebabCase('my-component-')).toBe(false);
            expect(isKebabCase('-my-component')).toBe(false);
            expect(isKebabCase('-my-component-')).toBe(false);
            expect(isKebabCase('')).toBe(false);
        });
    });

    describe('generateCaseVariations', () => {
        test('should generate correct case variations', () => {
            const result = generateCaseVariations('my-component-name');
            
            expect(result).toEqual({
                pascalCase: 'MyComponentName',
                camelCase: 'myComponentName',
                kebabCase: 'my-component-name',
                snakeCase: 'my_component_name'
            });
        });

        test('should handle single word components', () => {
            const result = generateCaseVariations('button');
            
            expect(result).toEqual({
                pascalCase: 'Button',
                camelCase: 'button',
                kebabCase: 'button',
                snakeCase: 'button'
            });
        });
    });

    describe('getTemplates', () => {
        let mockTemplatesDir;

        beforeEach(() => {
            // Create a temporary directory for test templates
            mockTemplatesDir = path.join(__dirname, 'mock-templates');
            fs.mkdirSync(mockTemplatesDir, { recursive: true });
            
            // Create some mock template directories
            fs.mkdirSync(path.join(mockTemplatesDir, 'template1'));
            fs.mkdirSync(path.join(mockTemplatesDir, 'template2'));
            fs.writeFileSync(path.join(mockTemplatesDir, 'not-a-template.txt'), '');
        });

        afterEach(() => {
            // Clean up the temporary directory
            fs.removeSync(mockTemplatesDir);
        });

        test('should return only directory templates', () => {
            const templates = getTemplates(mockTemplatesDir);
            expect(templates).toContain('template1');
            expect(templates).toContain('template2');
            expect(templates).not.toContain('not-a-template.txt');
        });
    });

    describe('scaffoldComponent', () => {
        let mockSourceDir;
        let mockTargetDir;
        let mockTemplateContent;

        beforeEach(() => {
            // Create temporary directories for testing
            mockSourceDir = path.join(__dirname, 'mock-templates', 'mock-source');
            mockTargetDir = path.join(__dirname, 'mock-target');
            fs.mkdirSync(mockSourceDir, { recursive: true });
            fs.mkdirSync(mockTargetDir, { recursive: true });

            // Create a mock template file with placeholders
            mockTemplateContent = `
                import { TemplateName } from './template-name';
                const templateName = new TemplateName();
                const template_name = 'test';
            `;
            fs.writeFileSync(path.join(mockSourceDir, 'TemplateName.js'), mockTemplateContent);
        });

        afterEach(() => {
            // Clean up temporary directories
            fs.removeSync(path.join(__dirname, 'mock-templates'));
            fs.removeSync(mockTargetDir);
        });

        test('should copy and transform template files', () => {
            const mockTemplatesDir = path.join(__dirname, 'mock-templates');
            const componentTargetDir = path.join(mockTargetDir, 'my-test-component');

            scaffoldComponent('mock-source', 'my-test-component', {
                templatesDir: mockTemplatesDir,
                targetDir: componentTargetDir
            });

            const targetFile = path.join(componentTargetDir, 'MyTestComponent.js');
            const content = fs.readFileSync(targetFile, 'utf-8');

            expect(content).toContain('MyTestComponent');
            expect(content).toContain('myTestComponent');
            expect(content).toContain('my-test-component');
            expect(content).toContain('my_test_component');
        });
    });
}); 