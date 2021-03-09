const express = require('express')

const app = express()

app.set('secret', '123adawqrqw213')
app.use(express.json())
app.use(require('cors')())
//静态文件托管
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use('/admin', express.static(__dirname + '/admin'))
require('./plugins/db')(app)
require('./routes/admin')(app)
app.listen(3000, () => {
  console.log('http://localhost:3000')
})
