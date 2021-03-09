module.exports = (app) => {
  const express = require('express')
  const jwt = require('jsonwebtoken')
  const assert = require('http-assert')
  const AdminUser = require('../../models/AdminUser')
  const router = express.Router({
    //合并url参数，使
    mergeParams: true
  })

  //新建资源,req.body就是客户端传过来的数据
  router.post('/', async (req, res) => {
    const model = await req.Model.create(req.body)
    res.send(model)
  })
  //更新资源接口
  router.put('/:id', async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
    res.send(model)
  })
  //删除资源接口
  router.delete('/:id', async (req, res) => {
    const model = await req.Model.findByIdAndDelete(req.params.id, req.body)
    res.send(model)
  })
  //请求资源数据
  router.get('/', async (req, res) => {
    //当模型为Category时，使用populate进行联合查询
    const queryOptions = {}
    if (req.Model.modelName === 'Category') {
      queryOptions.populate = 'parent'
    }
    const items = await req.Model.find().populate('parent')
    res.send(items)
  })
  //通过id找到那条数据
  router.get('/:id', async (req, res) => {
    const model = await req.Model.findById(req.params.id)
    res.send(model)
  })

  //登录校验中间件
  const authMiddleware = require('../../middleware/auth')

  const resourceMiddleware = require('../../middleware/resource')

  //资源请求路径
  app.use(
    '/admin/api/rest/:resource',
    authMiddleware(),
    resourceMiddleware(),
    router
  )
  const multer = require('multer')
  const upload = multer({ dest: __dirname + '/../../uploads' })

  //上传图片接口
  app.post(
    '/admin/api/upload',
    authMiddleware(),
    upload.single('file'),
    async (req, res) => {
      const file = req.file
      file.url = `http://localhost:3000/uploads/${file.filename}`
      res.send(file)
    }
  )

  //登录接口
  app.post('/admin/api/login', async (req, res) => {
    // req.body表示客户端传过来的所有数据
    const { username, password } = req.body
    //1、根据用户名找到用户
    const user = await AdminUser.findOne({ username }).select('+password')
    assert(user, 422, '用户不存在')

    //2、校验密码
    const isValid = require('bcrypt').compareSync(password, user.password)
    assert(isValid, 422, '密码错误')
    //3、返回token
    const token = jwt.sign({ id: user._id }, app.get('secret'))
    res.send({ token })
  })
  //错误处理函数
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message
    })
  })
}
//通用接口curd
// 步骤1、合并URL参数，mergeParams: true
// 步骤2、注册中间件，通过inflection将接口url传过来的模型名称对应到已有模型中
// 步骤3、将模型引用挂载到req，才能被router访问到
//       //模型名称用inflection插件转换，如categories-->>Category
//       const modelName = require('inflection').classify(req.params.resource)
//       //模型挂载在req上
//       req.Model = require(`../../models/${modelName}`)
