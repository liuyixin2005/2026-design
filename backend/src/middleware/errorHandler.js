const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: '数据验证失败', errors })
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: '数据已存在，请勿重复提交' })
  }

  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误'
  })
}

module.exports = errorHandler
