// import pupReqMaterial from "../puppeteer/reqMaterial";

import pupMultReqMaterialReserve from '../puppeteer/reqMultMaterialReserve';

class ReqMaterialController {
  // GET
  // async index(req, res) {
  //   try {
  //     const reqMat = await pupReqMaterial(req.params.reqmat);
  //     // const reqMat = req.params.reqmat;
  //     console.log(reqMat);
  //     return res.json(reqMat);
  //   } catch (e) {
  //     return res.status(400).json({
  //       errors: e.errors.map((err) => err.message),
  //     });
  //   }
  // }

  async store(req, res) {
    try {
      console.log('user', req.body.user);
      const reqMat = await pupMultReqMaterialReserve(
        req.body.requisicoes,
        req.body.user,
      );
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
