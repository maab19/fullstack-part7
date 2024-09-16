const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

const bcrypt = require('bcrypt')
const User = require('../models/user')
const { token } = require('morgan')

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }

    await User.deleteMany({})

    const username = 'root'
    const password = 'sekret'
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username: username, name: 'root', passwordHash })

    await user.save()
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('id is defined', async () => {
    const response = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    for(let b of response.body) {
      expect(b.id).toBeDefined()
    }
  })
})

describe('adding a blog', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }

    await User.deleteMany({})

    const username = 'root'
    const password = 'sekret'
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username: username, name: 'root', passwordHash })

    await user.save()

    const loginData = {
      username: username,
      password: password
    }
    helper.token = (await api.post('/api/login').send(loginData)).body.token

  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'John Doe',
      url: 'https://www.new-blog.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${helper.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsinDB()

    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
    const blogs_cleaned = blogs.map(b => {
      return {
        title: b.title,
        author: b.author,
        url: b.url,
        likes: b.likes
      }
    })
    expect(blogs_cleaned).toContainEqual(newBlog)
  })

  test('new blog without likes defaults to 0', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'John Doe',
      url: 'https://www.new-blog.com'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${helper.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsinDB()

    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
    const likes = blogs.map(b => {
      return b.likes
    })
    expect(likes).toContain(0)
  })

  test('new blog without title returns 400', async () => {
    const newBlog = {
      author: 'John Doe',
      url: 'https://www.new-blog.com',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${helper.token}`)
      .send(newBlog)
      .expect(400)

  })

  test('new blog without url returns 400', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'John Doe',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${helper.token}`)
      .send(newBlog)
      .expect(400)

  })

  test('returns 401 if no token is provided', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'John Doe',
      url: 'https://www.new-blog.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

})

describe('deletion of a blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const username = 'root'
    const password = 'sekret'
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username: username, name: 'root', passwordHash })
    const createdUser = await user.save()

    await Blog.deleteMany({})

    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog({ ...blog, user: createdUser.id })
      await blogObject.save()
    }
    const loginData = {
      username: username,
      password: password
    }
    helper.token = (await api.post('/api/login').send(loginData)).body.token

  })

  test('succeeds with status code 204 if id is valid', async () => {

    const blogsAtStart = await helper.blogsinDB()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${helper.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsinDB()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails with status code 400 if id is invalid', async () => {
    await api
      .delete('/api/blogs/invalid_id')
      .set('Authorization', `bearer ${helper.token}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsinDB()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

  })
})

describe('update of a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsinDB()
    const blogToUpdate = blogsAtStart[0]
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 100 })

    const blogsAtEnd = await helper.blogsinDB()
    const likes = blogsAtEnd.map(r => r.likes)

    expect(likes).toContain(100)
  })

  test('fails with status code 404 if id is not found', async () => {
    await api
      .put('/api/blogs/000000000000000000000000')
      .send({ likes: 100 })
      .expect(404)

  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'user1',
      name: 'John Doe',
      password: 'secure',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('all users are returned', async () => {
    const usersAtStart = await helper.usersInDb()
    const response = await api.get('/api/users').expect('Content-Type', /application\/json/)
    expect(response.body).toHaveLength(usersAtStart.length)
  })
})

describe('when an invalid user is created', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'root', passwordHash })

    await user.save()
  })

  test('creation fails with no username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'John Doe',
      password: 'secure',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if username not unique', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: usersAtStart[0].username,
      name: 'John Doe',
      password: 'secure',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if username length is lower than 3', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'JD',
      name: 'John Doe',
      password: 'secure',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with no password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'John Doe',
      username: 'user1'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if passsword length is lower than 3', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'user1',
      name: 'John Doe',
      password: 'pw',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})