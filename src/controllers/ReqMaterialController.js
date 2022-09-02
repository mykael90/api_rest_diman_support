import pupReqMaterial from '../puppeteer/reqMaterial';

import pupMultReqMaterial from '../puppeteer/reqMultMaterial';

class ReqMaterialController {
  // GET
  async index(req, res) {
    try {
      const reqMat = await pupReqMaterial(req.params.reqmat);
      // const reqMat = req.params.reqmat;
      console.log(reqMat);
      return res.json(reqMat);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async store(req, res) {
    try {
      const reqMat = await pupMultReqMaterial(req.body.requisicoes);
      // const reqMat = req.body.requisicoes;
      console.log(reqMat);
      return res.json(reqMat);
    } catch (e) {
      return res.status(400).json({
        errors: [e.message],
      });
    }
  }
}

export default new ReqMaterialController();
