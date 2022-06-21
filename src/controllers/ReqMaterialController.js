import pupReqMaterial from '../puppeteer/reqMaterial';

class ReqMaterialController {
  // GET
  async index(req, res) {
    try {
      const reqMat = await pupReqMaterial(req.params.reqmat);
      console.log(reqMat);
      return res.json(reqMat);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }
}

export default new ReqMaterialController();
