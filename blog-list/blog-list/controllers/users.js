const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
// const logger = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
  const allUsers = await User
    .find({}).populate('blogs', { url: 1, title: 1, author:1 })
  response.json(allUsers)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if(!password || password.length < 3) {
    return response.status(400).json({ error: 'Invalid password' })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

/*
blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  const result = await Blog.findByIdAndDelete(id)
  if (!result) {
    response.status(404).send({ error: 'blog not found' })
  }
  else {
    response.status(204).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body
  console.log(likes)
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id,
    { likes: likes },
    { new: true, runValidators: true, context: 'query' })

  if (!updatedBlog) {
    response.status(404).send({ error: 'Blog not found' })
  }
  else {
    response.json(updatedBlog)
  }

})
*/

module.exports = usersRouter