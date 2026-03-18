require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')

if (!process.env.JWT_SECRET) {
  console.error('错误：环境变量 JWT_SECRET 未设置，服务器无法启动')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

// 连接数据库
connectDB()

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter')
app.use('/api/auth', authLimiter, require('./routes/auth'))
app.use('/api/works', apiLimiter, require('./routes/works'))
app.use('/api/users', apiLimiter, require('./routes/users'))

// 错误处理中间件
app.use(require('./middleware/errorHandler'))

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})

module.exports = app
