#!/usr/bin/env node

// --这种用法是为了防止操作系统用户没有将node装在默认的/usr/bin路径里。当系统看到这一行的时候，
// 首先会到env设置里查找node的安装路径，再调用对应路径下的解释器程序完成操作。
const path = require('path');
const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const handlebars = require('handlebars');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

const { common } = require('../template');

program
  .version(require('../package').version, '-v, --version')
  .command('init <name>')
  .action(async (name = 'demo') => {
    if (fs.existsSync(name)) {
      return console.log(symbols.error, chalk.red('项目已存在'));
    }
    const answers = await inquirer.prompt([
      {
        name: 'projectName',
        message: `请输入项目名,默认为(${name}):`,
      },
      {
        name: 'projectDescription',
        message: `请输入项目简介:`,
        default: 'project created by cfe-cli',
      },
      {
        name: 'author',
        message: '请输入作者名称',
      },
    ]);
    const projectName = answers.projectName;

    const spinner = ora('正在下载模板...');
    spinner.start();
    download('direct:'+common, name, { clone: true }, (err) => {
      if (!err) {
        spinner.succeed();
        const meta = {
          name,
          description: answers.projectDescription,
          author: answers.author,
        };
        const fileName = `${projectName}/package.json`;
        if (fs.existsSync(fileName)) {
          const content = fs.readFileSync(fileName).toString();
          const result = handlebars.compile(content)(meta);
          fs.writeFileSync(fileName, result);
        }
        console.log(symbols.success, chalk.green('项目初始化完成'));
      } else {
        spinner.fail();
        console.log(symbols.error, chalk.red(`拉取远程仓库失败${err}`));
      }
    });
  });
//解析命令行
program.parse(process.argv);
