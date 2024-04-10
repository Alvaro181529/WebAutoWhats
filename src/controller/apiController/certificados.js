const { apiExterno } = require("../../database/api");

exports.certificadoController = async(req,res)=>{
    const api = await apiExterno();
    res.json(api);
}