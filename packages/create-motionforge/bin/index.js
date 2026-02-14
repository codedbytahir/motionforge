#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('create-motionforge')
  .description('Bootstrap a new MotionForge project')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .option('-t, --template <type>', 'Template type (hello-world, blank)')
  .option('--tailwind', 'Use Tailwind CSS')
  .option('--no-tailwind', 'Do not use Tailwind CSS')
  .option('-g, --guidelines <types>', 'AI guidelines to include (comma-separated: google,zai)')
  .action(async (projectName, options) => {
    console.log(chalk.bold.hex('#10b981')('\n🚀 Welcome to MotionForge!\n'));
    console.log(chalk.gray('Let\'s set up your new programmatic video project.\n'));

    const questions = [];

    if (!projectName) {
      questions.push({
        type: 'input',
        name: 'name',
        message: 'What is your project named?',
        default: 'my-motionforge-video',
      });
    }

    if (!options.template) {
      questions.push({
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: [
          { name: 'Hello World (Recommended - shows animations)', value: 'hello-world' },
          { name: 'Blank (Minimal setup)', value: 'blank' },
        ],
      });
    }

    if (options.tailwind === undefined) {
      questions.push({
        type: 'confirm',
        name: 'tailwind',
        message: 'Would you like to use Tailwind CSS?',
        default: true,
      });
    }

    if (!options.guidelines) {
      questions.push({
        type: 'checkbox',
        name: 'guidelines',
        message: 'Which AI Agent Guidelines would you like to include?',
        choices: [
          { name: 'Google Gemini', value: 'google' },
          { name: 'Z.ai GLM', value: 'zai' },
        ],
        default: ['google'],
      });
    }

    const answers = await inquirer.prompt(questions);

    const targetName = projectName || answers.name;
    const selectedTemplate = options.template || answers.template;
    const useTailwind = options.tailwind !== undefined ? options.tailwind : answers.tailwind;
    const selectedGuidelines = options.guidelines ? options.guidelines.split(',') : (answers.guidelines || []);
    const targetPath = path.join(process.cwd(), targetName);

    if (fs.existsSync(targetPath)) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Directory ${chalk.cyan(targetName)} already exists. Overwrite?`,
          default: false,
        },
      ]);
      if (!confirm) process.exit(0);
      await fs.remove(targetPath);
    }

    const spinner = ora('Creating project...').start();

    try {
      await fs.ensureDir(targetPath);
      await fs.ensureDir(path.join(targetPath, 'src/app'));

      const templatesRoot = path.join(__dirname, '../../../templates');

      // 1. Copy shared files
      await fs.copy(path.join(templatesRoot, 'shared/tsconfig.json'), path.join(targetPath, 'tsconfig.json'));

      // 2. Generate package.json
      const packageJsonTemplate = await fs.readFile(path.join(templatesRoot, 'shared/package.json.template'), 'utf-8');
      let packageJson = packageJsonTemplate.replace('{{name}}', targetName);

      if (useTailwind) {
        const pkg = JSON.parse(packageJson);
        pkg.devDependencies = {
          ...pkg.devDependencies,
          "tailwindcss": "^3.4.1",
          "postcss": "^8.4.35",
          "autoprefixer": "^10.4.18",
          "tailwindcss-animate": "^1.0.7"
        };
        packageJson = JSON.stringify(pkg, null, 2);
      }
      await fs.writeFile(path.join(targetPath, 'package.json'), packageJson);

      // 3. Copy Layout & Globals
      await fs.copy(path.join(templatesRoot, 'shared/layout.tsx.template'), path.join(targetPath, 'src/app/layout.tsx'));
      await fs.copy(path.join(templatesRoot, 'shared/globals.css.template'), path.join(targetPath, 'src/app/globals.css'));

      // 4. Copy Template specific Page
      const pageTemplate = await fs.readFile(path.join(templatesRoot, selectedTemplate, 'page.tsx.template'), 'utf-8');
      let pageContent = pageTemplate;

      if (!useTailwind) {
        // Simple regex to remove className attributes if tailwind is not used
        pageContent = pageContent.replace(/className="[^"]*"/g, '');
      }
      await fs.writeFile(path.join(targetPath, 'src/app/page.tsx'), pageContent);

      // 5. Copy AI Guidelines
      if (selectedGuidelines.includes('google')) {
        await fs.copy(path.join(templatesRoot, 'shared/GOOGLE-AI-GUIDELINES.md'), path.join(targetPath, 'GOOGLE-AI-GUIDELINES.md'));
      }
      if (selectedGuidelines.includes('zai')) {
        await fs.copy(path.join(templatesRoot, 'shared/GLM-AI-GUIDELINES.md'), path.join(targetPath, 'GLM-AI-GUIDELINES.md'));
      }

      // 6. Tailwind Config if needed
      if (useTailwind) {
        await fs.writeFile(path.join(targetPath, 'tailwind.config.ts'), `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22',
        }
      }
    },
  },
  plugins: [],
};
export default config;`);
        await fs.writeFile(path.join(targetPath, 'postcss.config.mjs'), `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;`);
      }

      spinner.succeed(chalk.green(`Project ${chalk.bold(targetName)} created successfully!`));

      console.log('\nNext steps:');
      console.log(chalk.cyan(`  cd ${targetName}`));
      console.log(chalk.cyan('  bun install'));
      console.log(chalk.cyan('  bun dev\n'));

      console.log(chalk.hex('#10b981')('Happy motion forging! 🎬\n'));

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project.'));
      console.error(error);
    }
  });

// Add custom emerald color to chalk
// @ts-ignore
chalk.emerald = chalk.hex('#10b981');

program.parse();
