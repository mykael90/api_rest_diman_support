import dotenv from 'dotenv';
import { resolve } from 'path';

import cors from 'cors';
import helmet from 'helmet';

import express from 'express';
import homeRoutes from './routes/homeRoutes';
import reqMaterialRoutes from './routes/reqMaterialRoutes';

dotenv.config();

const whiteList = [
  'https://react.mme.eng.br',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://192.168.0.25:3000',
  'http://10.1.159.210:3000',
  'http://10.1.156.199:3000',
];

const corsOptions = {
  origin(origin, callback) {
    if ((whiteList.indexOf(origin)) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors(corsOptions));
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static(resolve(__dirname, '..', 'uploads')));
  }

  routes() {
    // Rotas abertas
    this.app.use('/', homeRoutes);
    this.app.use('/reqmaterial/', reqMaterialRoutes);
    // this.app.use('/users/', userOpenedRoutes);

    // Middleware de autenticação
    // this.app.use(loginRequired); //abrir por enquanto
  }
}

export default new App().app;
