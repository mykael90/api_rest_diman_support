import pup from 'puppeteer';

const pupReqMaterial = async (codReq) => {
  const target = 'https://sipac.ufrn.br/sipac/buscaListaReq.do';

  const numeroReq = codReq.slice(0, -4);
  const anoReq = codReq.slice(-4);

  const searchParam = `tipoReq.id=1&buscaNumAno=true&numero=${numeroReq}&ano=${anoReq}`; // ESPECIFICAR O NUMERO E ANO DA REQUISIÇÃO. (REQ MATERIAL)

  const username = process.env.USERNAMESIPAC;
  const password = process.env.PASSWORDSIPAC;

  const browser = await pup.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://autenticacao.ufrn.br/sso-server/login?service=https%3A%2F%2Fsipac.ufrn.br%2Fsipac%2Flogin%2Fcas');

  await page.waitForSelector('#username');
  await page.waitForSelector('#password');

  await page.type('#username', username);
  await page.type('#password', password);

  await Promise.all(
    [
      page.waitForNavigation(),
      await page.click('.btn-login'),

    ],

  );

  // await page.evaluate(() => alert('This message is inside an alert box'));

  const idReq = await page.evaluate(async (target, searchParam) => {
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
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const textBuffer = await decoder.decode(arrayBuffer);

    const parser = new DOMParser();
    doc = parser.parseFromString(textBuffer, 'text/html');

    // EXTRAINDO AS INFORMACOES DA REQUISICAO (PODE UNIFICAR EM UMA UNICA LINHA)
    const tableDados = doc.querySelector('tbody');
    // if (tableDados.children.lenght != 1) return null;
    return tableDados.childNodes[1].children[11].children[0].value;
  }, target, searchParam);

  const Req = await page.evaluate(async (idReq) => {
    let doc;
    // alert('id='+idReq+'&acao=200');
    const response = await fetch('https://sipac.ufrn.br/sipac/acompanharReqMaterial.do', {
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
      body: new URLSearchParams(`id=${idReq}&acao=200`), // body data type must match "Content-Type" header
    });
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const textBuffer = await decoder.decode(arrayBuffer);

    const parser = new DOMParser();
    doc = parser.parseFromString(textBuffer, 'text/html');

    // EXTRAINDO AS INFORMACOES DA REQUISICAO (PODE UNIFICAR EM UMA UNICA LINHA)
    const tableDados = Array.from(doc.querySelector('table.formulario tbody').children);
    const dados = tableDados.map((e) => e.innerText.replace(/[\n\t\r]/g, '').trim().split(':'));
    dados.splice(-3, 3); // REMOVER ULTIMAS 3 LINHAS DESNECESSARIAS

    // TABLE TO JSON (dados)
    const dadosJSON = {};
    for (const dado of dados) {
      dadosJSON[dado[0]] = dado[1].replace(/[\n\t\r]/g, '').trim();
    }

    // EXTRAINDO AS INFORMACOES DOS TITULOS DOS ITENS (PODE UNIFICAR EM UMA UNICA LINHA)
    const tableCampos = Array.from(doc.querySelector('table.formulario table thead tr').children);
    const campos = tableCampos.map((e) => e.innerText.replace(/[\n\t\r]/g, '').trim());

    // EXTRAINDO AS INFORMACOES DOS ITENS (PODE UNIFICAR EM UMA UNICA LINHA)
    const tableItens = Array.from(doc.querySelector('table.formulario table tbody').children);
    const itens = tableItens.map((e) => Array.from(Array.from(e.children).map((i) => i.innerText.replace(/[\n\t\r]/g, '').trim())));

    // TABLE TO JSON (itens)
    const itensJSON = [];

    for (let c = 0; c < itens.length; c++) {
      const itemJSON = {};
      for (let i = 0; i < 11; i++) {
        itemJSON[campos[i]] = itens[c][i];
      }
      itensJSON.push(itemJSON);
    }

    return { dadosJSON, itensJSON };
  }, idReq);

  await browser.close();

  return (Req);
};

export default pupReqMaterial;
