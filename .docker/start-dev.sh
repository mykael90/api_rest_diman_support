#!/bin/bash

# Remover package-lock.json
rm package-lock.json

# Install latest puppeteer
npm i puppeteer@latest

# Instale as dependências do projeto
npm i

tail -f /dev/null