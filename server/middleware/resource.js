module.exports = (options) => {
  return async (req, res, next) => {
    //模型名称用inflection插件转换，如categories-->>Category
    const modelName = require('inflection').classify(req.params.resource)
    //模型挂载在req上
    req.Model = require(`../models/${modelName}`)
    next()
  }
}
