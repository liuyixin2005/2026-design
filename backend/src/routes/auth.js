const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST /api/auth/register - 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' })
    }

    const user = new User({ username, email, password })
    await user.save()

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// POST /api/auth/login - 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: '登录成功',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

module.exports = router
