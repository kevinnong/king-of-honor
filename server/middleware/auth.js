module.exports = (options) => {
  const jwt = require('jsonwebtoken')
  const assert = require('http-assert')
  const AdminUser = require('../models/AdminUser')

  return async (req, res, next) => {
    //前端传过来的token
    const token = String(req.headers.authorization || '')
      .split(' ') //用空格分隔字符串，变成数据
      .pop() //删除数组最后一个元素并返回他
    assert(token, 401, '请先登录')
    //解密这个token
    const { id } = jwt.verify(token, req.app.get('secret'))
    assert(id, 401, '请先登录')
    //查找这个token对应的用户，挂载到req
    req.user = await AdminUser.findById(id)
    assert(req.user, 401, '请先登录')
    await next()
  }
}
