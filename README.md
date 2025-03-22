# CSS Component Generator

A CLI tool to generate CSS components from templates.

## Installation

```bash
npm install -g css-component-generator
```

## Usage

```bash
css-component-generator
```

The tool will prompt you for:
1. Component name (in kebab-case)
2. Template to use

## Available Templates

- `endpoint-middleware`: A template for creating endpoint middleware components
- `login`: A template for creating login components
- `basic`: print 'hello world' in the log

## Adding a new template 

Feel free to submit a pull request to add a new template to the repo!

## Development

```bash
# Clone the repository
git clone https://github.com/liquid-surf/css-component-generator

# Install dependencies
npm install

# Run tests
npm test
```

