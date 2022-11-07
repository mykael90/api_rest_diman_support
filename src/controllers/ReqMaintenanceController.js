import pupMultReqMaintenance from '../puppeteer/reqMultMaintenance';

class ReqMaintenanceController {
  async store(req, res) {
    try {
      const reqMat = await pupMultReqMaintenance(req.body.requisicoes);
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

export default new ReqMaintenanceController();
