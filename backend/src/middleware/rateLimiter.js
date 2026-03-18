const rateLimit = require('express-rate-limit')

// 认证接口限速：每15分钟最多10次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '请求过于频繁，请稍后再试' }
})

// 普通 API 限速：每分钟最多60次
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '请求过于频繁，请稍后再试' }
})

module.exports = { authLimiter, apiLimiter }
