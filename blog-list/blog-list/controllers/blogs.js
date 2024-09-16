const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const allBlogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(allBlogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user
  let blog = null
  if(!request.body.likes){
    blog = new Blog({ ...request.body, likes: 0, user: user.id })
  }
  else {
    blog = new Blog({ ...request.body, user: user.id })
  }
  logger.info(blog)

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const userid = request.user.id
  const id = request.params.id
  const blog = await Blog.findById(id)
  if (!blog.user || userid.toString() !== blog.user.toString()) {
    return response.status(401).json({ error: 'Not creator of the blog' })
  }
  const result = await Blog.findByIdAndDelete(id)
  if (!result) {
    response.status(404).send({ error: 'blog not found' })
  }
  else {
    response.status(204).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id,
    blog,
    { new: true, runValidators: true, context: 'query' }).populate('user', { username: 1, name: 1 })

  if (!updatedBlog) {
    response.status(404).send({ error: 'Blog not found' })
  }
  else {
    response.json(updatedBlog)
  }

})

module.exports = blogsRouter