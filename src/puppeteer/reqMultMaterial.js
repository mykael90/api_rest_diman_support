// REFERE-SE AO ID DA REQUISIÇÃO DE MATERIAL

import pup from 'puppeteer';

const pupMultReqMaterial = async (codReq) => {
  try {
    if (codReq.constructor !== Array) return;

    const target = 'https://sipac.ufrn.br/sipac/buscaListaReq.do';

    const username = process.env.USERNAMESIPAC;
    const password = process.env.PASSWORDSIPAC;

    const isLinux = process.env?.LINUX_ENVIRONMENT ?? false;

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

    if (isLinux) objPup.executablePath = '/usr/bin/chromium-browser';

    const browser = await pup.launch(objPup);

    const page = await browser.newPage();

    await page.goto('https://autenticacao.ufrn.br/sso-server/login?service=https%3A%2F%2Fsipac.ufrn.br%2Fsipac%2Flogin%2Fcas', {
      waitUntil: 'networkidle2',
    });

    await page.waitForSelector('#username');
    await page.type('#username', username);

    await page.waitForSelector('#password');
    await page.type('#password', password);

    await Promise.all(
      [
        page.waitForNavigation(),
        page.click('.btn-login'),

      ],

    );

    await page.goto('https://sipac.ufrn.br/sipac/portal_administrativo/index.jsf', {
      waitUntil: 'networkidle2',
    }); // inseri essa nova requisição apenas pq deu um bug no sipac no dia 27/10/22 que impedia o acesso direto, emitia um aviso de acesso bloqueado e era necessario fazer a requisição da url novamente para acessar. Depois que corrigirem o problema essa linha pode ser removida para permitir um retorno mais rápido dos dados.

    // eslint-disable-next-line max-len
    const idReqs = await page.evaluate(async (target, codReq) => Promise.all(codReq.map(async (value) => {
      const numeroReq = value.split('/')[0];
      const anoReq = value.split('/')[1];
      const searchParam = `tipoReq.id=1&buscaNumAno=true&numero=${numeroReq}&ano=${anoReq}`;

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
      const doc = parser.parseFromString(textBuffer, 'text/html');

      // EXTRAINDO AS INFORMACOES DA REQUISICAO (PODE UNIFICAR EM UMA UNICA LINHA)
      const tableDados = doc.querySelector('tbody.listagem');

      console.dir(tableDados);

      if (!tableDados) return `Requisição de material nº ${value} não localizada`;
      if (tableDados.childNodes[1].children[6].innerText.trim() !== 'ALMOXARIFADO DE MATERIAIS DE MANUTENÇÃO DE IMÓVEIS') return `Requisição de material nº ${value} alheia a manutenção`;
      if (!tableDados.childNodes[1].children[7].innerText.trim().include('FINALIZADA')) return `Requisição de material nº ${value} não finalizada`;

      return tableDados.childNodes[1].children[11].children[0].value;
    })), target, codReq);

    const Reqs = await page.evaluate(async (idReqs) => Promise.all(idReqs.map(async (idReq) => {
      if (!idReq) return idReq; // retorna o string de erro criado no lugar do id
      if (!idReq.match(/^[0-9]+$/)) return idReq; // retorna o string de erro criado no lugar do id

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
      const doc = parser.parseFromString(textBuffer, 'text/html');

      // EXTRAINDO AS INFORMACOES DA REQUISICAO (PODE UNIFICAR EM UMA UNICA LINHA)
      const tableDados = Array.from(doc.querySelector('table.formulario tbody').children);
      const dados = tableDados.map((e) => e.innerText.replace(/[\n\t\r]/g, '').trim().split(':'));
      dados.length = 17; // REMOVER LINHAS DESNECESSARIAS

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
    })), idReqs);

    await browser.close();

    const errors = Reqs.filter((req) => (typeof req === 'string'));
    const info = Reqs.filter((req) => (typeof req !== 'string'));

    return ({ info, errors });
  } catch (e) {
    return ({ errors: [e.message] });
  }
};

export default pupMultReqMaterial;
