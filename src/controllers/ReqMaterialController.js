class ReqMaterialController {
  // Store
  async store(req, res) {
    try {
      const data = req.body;
      return res.json(data.name);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }
}

export default new ReqMaterialController();
