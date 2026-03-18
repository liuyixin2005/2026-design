const express = require('express')
const router = express.Router()
const Work = require('../models/Work')
const authMiddleware = require('../middleware/auth')

// GET /api/works - 获取所有已发布作品
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const query = { status: 'published' }
    if (category) query.category = category

    const works = await Work.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)

    const total = await Work.countDocuments(query)

    res.json({ works, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// GET /api/works/:id - 获取单个作品
router.get('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id).populate('author', 'username email')
    if (!work) {
      return res.status(404).json({ message: '作品不存在' })
    }
    res.json(work)
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// POST /api/works - 创建作品（需认证）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body
    const work = new Work({
      title,
      description,
      imageUrl,
      category,
      author: req.user.userId
    })
    await work.save()
    res.status(201).json({ message: '作品创建成功', work })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// PUT /api/works/:id - 更新作品（需认证）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
    if (!work) {
      return res.status(404).json({ message: '作品不存在' })
    }
    if (work.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限修改此作品' })
    }

    const { title, description, imageUrl, category, status } = req.body
    if (title !== undefined) work.title = title
    if (description !== undefined) work.description = description
    if (imageUrl !== undefined) work.imageUrl = imageUrl
    if (category !== undefined) work.category = category
    if (status !== undefined) work.status = status
    await work.save()

    res.json({ message: '作品更新成功', work })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// DELETE /api/works/:id - 删除作品（需认证）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
    if (!work) {
      return res.status(404).json({ message: '作品不存在' })
    }
    if (work.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限删除此作品' })
    }

    await work.deleteOne()
    res.json({ message: '作品删除成功' })
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

module.exports = router
