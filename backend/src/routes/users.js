const express = require('express')
const router = express.Router()
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

// GET /api/users/profile - 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// PUT /api/users/profile - 更新当前用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    if (username) user.username = username
    await user.save()

    res.json({ message: '用户信息更新成功', user: { id: user._id, username: user.username, email: user.email } })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

module.exports = router
