#!/usr/bin/env node

/**
 * Script de configuração para CI/CD
 * Configura dependências e valida a estrutura do projeto para os workflows do GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function checkPackageScripts(packagePath, requiredScripts) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    let allPresent = true;
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        log(`  ✅ Script '${script}' encontrado`, 'green');
      } else {
        log(`  ❌ Script '${script}' não encontrado`, 'red');
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    log(`❌ Erro ao ler ${packagePath}: ${error.message}`, 'red');
    return false;
  }
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} concluído`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro em ${description}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Configurando CI/CD para FinManage', 'cyan');
  log('=====================================', 'cyan');
  
  // Verificar estrutura do projeto
  log('\n📁 Verificando estrutura do projeto...', 'yellow');
  
  const requiredFiles = [
    { path: 'package.json', desc: 'package.json raiz' },
    { path: 'packages/core/package.json', desc: 'package.json do core' },
    { path: 'packages/product-personal/package.json', desc: 'package.json do product-personal' },
    { path: 'packages/product-diarista/package.json', desc: 'package.json do product-diarista' },
    { path: 'packages/product-mei/package.json', desc: 'package.json do product-mei' },
    { path: '.github/workflows/ci.yml', desc: 'Workflow CI' },
    { path: '.github/workflows/test-coverage.yml', desc: 'Workflow de cobertura' },
    { path: '.github/workflows/nightly-tests.yml', desc: 'Workflow de testes noturnos' },
    { path: '.github/workflows/pr-validation.yml', desc: 'Workflow de validação de PR' }
  ];
  
  let structureValid = true;
  requiredFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      structureValid = false;
    }
  });
  
  if (!structureValid) {
    log('\n❌ Estrutura do projeto incompleta. Verifique os arquivos em falta.', 'red');
    process.exit(1);
  }
  
  // Verificar scripts necessários
  log('\n📋 Verificando scripts necessários...', 'yellow');
  
  const requiredScripts = ['test', 'test:unit', 'test:integration', 'build', 'lint'];
  
  const packages = [
    { path: 'packages/core/package.json', name: 'Core' },
    { path: 'packages/product-personal/package.json', name: 'Product Personal' },
    { path: 'packages/product-diarista/package.json', name: 'Product Diarista' },
    { path: 'packages/product-mei/package.json', name: 'Product MEI' }
  ];
  
  let scriptsValid = true;
  packages.forEach(pkg => {
    log(`\n🔍 Verificando ${pkg.name}:`, 'blue');
    if (!checkPackageScripts(pkg.path, requiredScripts)) {
      scriptsValid = false;
    }
  });
  
  if (!scriptsValid) {
    log('\n⚠️ Alguns scripts necessários estão em falta. Os workflows podem falhar.', 'yellow');
  }
  
  // Verificar dependências de desenvolvimento
  log('\n🔧 Verificando dependências de desenvolvimento...', 'yellow');
  
  const devDependencies = ['vitest', '@vitest/coverage-v8', 'eslint'];
  let depsValid = true;
  
  packages.forEach(pkg => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(pkg.path, 'utf8'));
      const devDeps = packageJson.devDependencies || {};
      
      log(`\n🔍 Verificando dependências de ${pkg.name}:`, 'blue');
      devDependencies.forEach(dep => {
        if (devDeps[dep]) {
          log(`  ✅ ${dep} encontrado`, 'green');
        } else {
          log(`  ⚠️ ${dep} não encontrado`, 'yellow');
        }
      });
    } catch (error) {
      log(`❌ Erro ao verificar dependências de ${pkg.name}`, 'red');
      depsValid = false;
    }
  });
  
  // Executar instalação e testes
  log('\n🔄 Executando verificações finais...', 'yellow');
  
  const commands = [
    { cmd: 'npm run install:all', desc: 'Instalação de dependências' },
    { cmd: 'npm run build:core', desc: 'Build do core' },
    { cmd: 'npm run lint:all', desc: 'Linting de todos os packages' }
  ];
  
  let commandsSuccessful = true;
  commands.forEach(command => {
    if (!runCommand(command.cmd, command.desc)) {
      commandsSuccessful = false;
    }
  });
  
  // Executar testes (opcional, pode ser demorado)
  const runTests = process.argv.includes('--with-tests');
  if (runTests) {
    log('\n🧪 Executando testes...', 'yellow');
    runCommand('npm run test:all', 'Execução de todos os testes');
  }
  
  // Resumo final
  log('\n📊 Resumo da Configuração', 'cyan');
  log('==========================', 'cyan');
  
  log(`Estrutura do projeto: ${structureValid ? '✅ Válida' : '❌ Inválida'}`, structureValid ? 'green' : 'red');
  log(`Scripts necessários: ${scriptsValid ? '✅ Completos' : '⚠️ Incompletos'}`, scriptsValid ? 'green' : 'yellow');
  log(`Dependências: ${depsValid ? '✅ Verificadas' : '⚠️ Verificar manualmente'}`, depsValid ? 'green' : 'yellow');
  log(`Comandos CI: ${commandsSuccessful ? '✅ Funcionando' : '❌ Com problemas'}`, commandsSuccessful ? 'green' : 'red');
  
  if (structureValid && commandsSuccessful) {
    log('\n🎉 Configuração do CI/CD concluída com sucesso!', 'green');
    log('\n📝 Próximos passos:', 'blue');
    log('1. Faça commit dos workflows criados', 'blue');
    log('2. Configure secrets no GitHub (se necessário)', 'blue');
    log('3. Substitua SEU_USUARIO nos badges por seu username', 'blue');
    log('4. Adicione badges ao README.md principal', 'blue');
    log('5. Faça push para ativar os workflows', 'blue');
  } else {
    log('\n⚠️ Configuração concluída com avisos. Verifique os problemas acima.', 'yellow');
  }
  
  if (!runTests) {
    log('\n💡 Dica: Execute com --with-tests para incluir execução de testes', 'cyan');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkFile, checkPackageScripts, runCommand };