import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'
import Togglable from './components/Togglable'
import CreateBlogForm from './components/CreateBlogForm'
import { useDispatch } from 'react-redux'
import { setNotification } from './reducers/notificationReducer'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const blogFormRef = useRef()

  const dispatch = useDispatch()

  const compareBlogsByLikes = (a, b) => {
    if (a.likes === b.likes) {
      return 0
    }
    else if (a.likes > b.likes) {
      return -1
    }
    else {
      return 1
    }
  }

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs.sort(compareBlogsByLikes) )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogAppUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      const newNotification = {
        message: 'Login successful',
        type: 'success'
      }
      dispatch(setNotification(newNotification, 5))
    } catch (exception) {
      const newNotification = {
        message: 'Wrong credentials',
        type: 'error'
      }
      dispatch(setNotification(newNotification, 5))
    }
  }

  const handleLogout = (event) => {
    event.preventDefault

    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    blogService.setToken(null)
  }

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const createdBlog = await blogService.create(blogObject)

      createdBlog.user = { id: createdBlog.user, name: user.name, username: user.username }
      setBlogs(blogs.concat(createdBlog).sort(compareBlogsByLikes))
      const newNotification = {
        message: `New blog "${createdBlog.title}" by ${createdBlog.author} added`,
        type: 'success'
      }

      dispatch(setNotification(newNotification, 5))
    } catch (exception) {
      const newNotification = {
        message: 'Error during blog creation',
        type: 'error'
      }
      dispatch(setNotification(newNotification, 5))
    }
  }

  const updateBlog = async (id, blogObject) => {
    try {
      const updatedBlog = await blogService.update(id, blogObject)

      const newBlogs = blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b)
      setBlogs(newBlogs.sort(compareBlogsByLikes))
      const newNotification = {
        message: `Blog "${updatedBlog.title}" updated`,
        type: 'success'
      }

      dispatch(setNotification(newNotification, 5))
    } catch (exception) {
      const newNotification = {
        message: 'Error during blog update',
        type: 'error'
      }
      dispatch(setNotification(newNotification, 5))
    }
  }

  const deleteBlog = async (blogToDelete) => {
    if(blogToDelete.user.username === user.username) {
      try {
        await blogService.remove(blogToDelete.id)

        const newBlogs = blogs.filter(b => b.id !== blogToDelete.id)
        setBlogs(newBlogs.sort(compareBlogsByLikes))
        const newNotification = {
          message: `Blog "${blogToDelete.title}" deleted`,
          type: 'success'
        }

        dispatch(setNotification(newNotification, 5))
      }
      catch (exception) {
        const newNotification = {
          message: 'Error during blog deletion',
          type: 'error'
        }
        dispatch(setNotification(newNotification, 5))
      }
    }
    else {
      const newNotification = {
        message: 'Deletion not possible! User did not create the blog!',
        type: 'error'
      }
      dispatch(setNotification(newNotification, 5))
    }
  }

  if (user === null) {
    return (
      <div>
        <Notification />
        <h2>Login to application</h2>
        <form id='login-form' onSubmit={handleLogin}>
          <div>
            username
            <input
              id='username'
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
              password
            <input
              id='password'
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button id='login-button' type="submit">login</button>
        </form>
      </div>
    )
  }
  else{
    return(
      <div>
        <Notification />
        <h2>blogs</h2>
        <p>{user.name} logged in.<button onClick={handleLogout}>logout</button></p>
        <h2>create new</h2>
        <Togglable buttonLabel='Add Blog' ref={blogFormRef}>
          <CreateBlogForm createBlog={addBlog} />
        </Togglable>
        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user = {user}/>
        )}
      </div>
    )
  }
}

export default App