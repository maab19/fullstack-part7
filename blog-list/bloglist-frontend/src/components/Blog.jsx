import { useState } from 'react'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {setShowDetails(!showDetails)}

  const showWhenVisible = showDetails ? { display: '' } : { display: 'none' }

  const showDelete = user.username === blog.user.username ? '' : 'none'

  const buttonLabel = showDetails ? 'hide' : 'view'

  const deleteButtonStyle = {
    backgroundColor: 'blue',
    color: 'white',
    display: showDelete
  }

  const handleLike = () => {
    const id = blog.id
    const blogToUpdate = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      user: blog.user.id,
      likes: blog.likes+1
    }
    updateBlog(id, blogToUpdate)
  }

  const handleDelete = () => {
    const result = window.confirm(`Remove blog "${blog.title}" by ${blog.author}`)
    if (result) {
      deleteBlog(blog)
    }
  }

  return (
    <div className='blog' style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleDetails}>{buttonLabel}</button>
      </div>
      <div className="details" style={showWhenVisible}>
        <div>{blog.url}</div>
        <div className="likes">
          likes: {blog.likes}
          <button className='likeButton' onClick={handleLike}>like</button>
        </div>
        <div>{blog.user.name}</div>
        <button
          style={deleteButtonStyle}
          onClick={handleDelete}>
          delete
        </button>
      </div>
    </div>
  )

}

export default Blog