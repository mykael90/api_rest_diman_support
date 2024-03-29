import dotenv from 'dotenv';
import { resolve } from 'path';

import cors from 'cors';
import helmet from 'helmet';

import express from 'express';
import homeRoutes from './routes/homeRoutes';
import reqMaterialRoutes from './routes/reqMaterialRoutes';
import reqMaintenanceRoutes from './routes/reqMaintenanceRoutes';

dotenv.config();

const whiteList = [
  'https://react.mme.eng.br',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://192.168.0.25',
  'https://192.168.0.25',
  'http://192.168.0.25:3000',
  'http://192.168.0.25:3001',
  'http://10.1.156.199:3000',
  'http://10.1.158.162:3000',
  'http://10.1.156.199:3001',
  'http://10.1.158.162:3001',
  'https://10.1.156.199',
  'https://10.1.158.162',
  'https://sisman.infra.ufrn.br',
  'https://sisman.infra.ufrn.br:3000',
  'https://sisman.infra.ufrn.br:3001',
  'https://sisman.infra.ufrn.br:3002',

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
    this.app.use('/reqmaintenance/', reqMaintenanceRoutes);
    // this.app.use('/users/', userOpenedRoutes);

    // Middleware de autenticação
    // this.app.use(loginRequired); //abrir por enquanto
  }
}

export default new App().app;
