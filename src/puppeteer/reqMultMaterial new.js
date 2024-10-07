// REFERE-SE AO ID DA REQUISIÇÃO DE MATERIAL

// o valor da requisição total atendido não é apresentado nesse link. Depois faça uma função pra fazer essa soma.

import pup from "puppeteer";

const pupMultReqMaterial = async (codReq, user = null) => {
  try {
    if (codReq.constructor !== Array) return;

    const username = user?.username ?? process.env.USERNAMESIPAC;
    const password = user?.password ?? process.env.PASSWORDSIPAC;

    const OSenvironment = process.env.OS_ENVIRONMENT;

    const objPup = {
      headless: true,
      devtools: true,
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
        "--no-sandbox",
        "--disabled-setupid-sandbox",
      ],
    };

    if (OSenvironment === "linux") {
      objPup.executablePath = "/usr/bin/chromium";
    }

    const browser = await pup.launch(objPup);

    const page = await browser.newPage();

    await page.goto(
      "https://autenticacao.ufrn.br/sso-server/login?service=https%3A%2F%2Fsipac.ufrn.br%2Fsipac%2Flogin%2Fcas",
      {
        waitUntil: "networkidle2",
      }
    );

    await page.waitForSelector("#username");
    await page.type("#username", username);

    await page.waitForSelector("#password");
    await page.type("#password", password);

    await Promise.all([page.waitForNavigation(), page.click(".btn-primary")]);

    await page.waitForSelector("#info-sistema > span");

    // await page.goto('https://sipac.ufrn.br/sipac/portal_administrativo/index.jsf', {
    //   waitUntil: 'networkidle2',
    // });
    // inseri essa nova requisição apenas pq deu um bug no sipac no dia 27/10/22 que impedia o acesso direto, emitia um aviso de acesso bloqueado e era necessario fazer a requisição da url novamente para acessar. Depois que corrigirem o problema essa linha pode ser removida para permitir um retorno mais rápido dos dados.

    // eslint-disable-next-line max-len
    const Reqs = await page.evaluate(
      async (codReq) =>
        Promise.all(
          codReq.map(async (value) => {
            const numeroReq = value.split("/")[0];
            const anoReq = value.split("/")[1];

            const target = `https://sipac.ufrn.br/sipac/buscaRequisicao.do?requisicao.numero=${numeroReq}&requisicao.ano=${anoReq}&requisicao.tipo.id=1&popup=true`;

            const response = await fetch(target, {
              method: "GET", // *GET, POST, PUT, DELETE, etc.
              mode: "cors", // no-cors, *cors, same-origin
              cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
              credentials: "include", // include, *same-origin, omit
              headers: {
                authority: "sipac.ufrn.br",
                "Content-Type": "application/x-www-form-urlencoded",
              },
              redirect: "follow", // manual, *follow, error
              referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              // body: new URLSearchParams(searchParam), // body data type must match "Content-Type" header
            });
            const arrayBuffer = await response.arrayBuffer();
            const decoder = new TextDecoder("iso-8859-1");
            const textBuffer = await decoder.decode(arrayBuffer);

            const parser = new DOMParser();
            const doc = parser.parseFromString(textBuffer, "text/html");

            // VERIFICAR SE A REQUISIÇÃO É VÁLIDA
            const isInvalid = doc.querySelector(
              "#container-popup > table > tbody > tr:nth-child(1) > td.erro"
            );

            if (isInvalid) {
              return `Requisição de material nº ${value} não localizada`;
            }

            // EXTRAINDO AS INFORMACOES DA REQUISICAO (PODE UNIFICAR EM UMA UNICA LINHA)
            const tableDados = Array.from(
              doc.querySelector("table.formulario tbody").children
            );

            const dados = tableDados.map((e) =>
              e.innerText
                .replace(/[\n\t\r]/g, "")
                .trim()
                .split(":")
            );

            // VERIFICAR SE É RELACIONADA A MANUTENÇÃO
            console.log(dados[13][1]);
            if (!dados[13][1].includes("MANUTENÇÃO")) {
              return `Requisição de material nº ${value} alheia a manutenção`;
            }

            dados.length = 17; // REMOVER LINHAS DESNECESSARIAS

            // TABLE TO JSON (dados)
            const dadosJSON = {};

            for (const dado of dados) {
              dadosJSON[dado[0]] = dado[1].replace(/[\n\t\r]/g, "").trim();
            }

            // EXTRAINDO AS INFORMACOES DOS TITULOS DOS ITENS (PODE UNIFICAR EM UMA UNICA LINHA)
            const tableCampos = Array.from(
              doc.querySelector("table.formulario table thead tr").children
            );

            const campos = tableCampos.map((e) =>
              e.innerText.replace(/[\n\t\r]/g, "").trim()
            );

            // EXTRAINDO AS INFORMACOES DOS ITENS (PODE UNIFICAR EM UMA UNICA LINHA)
            const tableItens = Array.from(
              doc.querySelector("table.formulario table tbody").children
            );
            const itens = tableItens.map((e) =>
              Array.from(
                Array.from(e.children).map((i) =>
                  i.innerText.replace(/[\n\t\r]/g, "").trim()
                )
              )
            );

            // TABLE TO JSON (itens)
            const itensJSON = [];

            for (let c = 0; c < itens.length; c++) {
              const itemJSON = {};
              for (let i = 0; i < 11; i++) {
                itemJSON[campos[i]] = itens[c][i];
              }
              itensJSON.push(itemJSON);
            }

            // VERIFICAR SE O STATUS É FINALIZADA
            if (!dadosJSON["Status Atual"].includes("FINALIZADA")) {
              return `Requisição de material nº ${value} não finalizada`;
            }

            return { dadosJSON, itensJSON };
          })
        ),
      codReq
    );

    await browser.close();

    const errors = Reqs.filter((req) => typeof req === "string");
    const info = Reqs.filter((req) => typeof req !== "string");

    return { info, errors };
  } catch (e) {
    if (e.name === "TimeoutError") {
      return {
        errors: [
          "Verifique se o SIPAC está funcional e se as credenciais estão corretas",
        ],
      };
    }
    return { errors: [e.name] };
  }
};

export default pupMultReqMaterial;
