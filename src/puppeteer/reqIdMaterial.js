// REFERE-SE AO ID DO MATERIAL.

const pup = require('puppeteer');

const url = 'https://autenticacao.ufrn.br/sso-server/login?service=https%3A%2F%2Fsipac.ufrn.br%2Fsipac%2Flogin%2Fcas';

const target = 'https://sipac.ufrn.br/sipac/requisicoes/material/solicitacao_cadastro/busca_material.jsf';

const codigo = 304200006739;

const searchParam = `form=form&form%3AbuscaCodigo=on&form%3AcodigoMaterial=${codigo}&form%3AbtBuscarMaterial=Buscar&form%3ApaginaAtual=0&javax.faces.ViewState=j_id10`; // ESPECIFICAR O NUMERO E ANO DA REQUISIÇÃO. (REQ MATERIAL)

const username = process.env.USERNAMESIPAC;
const password = process.env.PASSWORDSIPAC;

const OSenvironment = process.env.OS_ENVIRONMENT;

const objPup = {
  headless: true,
  devtools: true,
  args: [
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
    '--no-sandbox',
    '--disabled-setupid-sandbox',
  ],
};

if (OSenvironment === 'linux') objPup.executablePath = '/usr/bin/chromium';

(async () => {
  const browser = await pup.launch(objPup);
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForSelector('#username');
  await page.waitForSelector('#password');

  await page.type('#username', username);
  await page.type('#password', password);

  await Promise.all(
    [
      page.waitForNavigation(),
      await page.click('.btn-primary'),

    ],

  );

  // await page.evaluate(() => alert('This message is inside an alert box'));

  const data = await page.evaluate(async (target, searchParam) => {
    let doc;
    const response = await fetch(target, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'include', // include, *same-origin, omit
      headers: {
        authority: 'sipac.ufrn.br',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: new URLSearchParams(searchParam), // body data type must match "Content-Type" header
    });
      // const arrayBuffer = await response.arrayBuffer();
    const text = await response.text();
    // const decoder = new TextDecoder('iso-8859-1');
    // const textBuffer = await decoder.decode(arrayBuffer);

    // const parser = new DOMParser();
    // doc = parser.parseFromString(textBuffer,"text/html");

    // EXTRAINDO AS INFORMACOES DA REQUISICAO (PODE UNIFICAR EM UMA UNICA LINHA)
    // const tableDados = doc.querySelector('tbody');

    return text;
  }, target, searchParam);

  console.log(data); // mostrando o ID do sipac

  await browser.close();
})();
