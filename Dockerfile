# Usei a imagem direto do Node16 e não do Alpine pois estou tendo problema no multer/sharp de compatibilidae
FROM node:21-slim

# Install dependencies to puppeteer
RUN apt-get update && apt-get install -y \
ca-certificates \
fonts-liberation \
libasound2 \
libatk-bridge2.0-0 \
libatk1.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgbm1 \
libgcc1 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libnss3 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
lsb-release \
wget \
xdg-utils \
chromium

USER node

RUN mkdir /home/node/api_rest_diman_support/

# Defina o diretório de trabalho
WORKDIR /home/node/api_rest_diman_support/

# Comando para iniciar o aplicativo quando o container for inicializado
CMD ["/home/node/api_rest_diman_support/.docker/start-prod.sh"]