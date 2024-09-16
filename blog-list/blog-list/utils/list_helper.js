const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.map(b => b.likes ? b.likes : 0).reduce((o, l) => o+l, 0)
}

const favouriteBlog = (blogs) => {
  if(blogs.length === 0) {
    return null
  }

  if(blogs.length === 1) {
    const { title, author, likes } = blogs[0]
    return { title, author, likes }
  }


  const favBlog = blogs.reduce((max, next) => {
    return next.likes > max.likes ? next : max
  }, blogs[0])


  const { title, author, likes } = favBlog
  return { title, author, likes }
}

const mostBlogs = (blogs) => {
  if(blogs.length === 0) {
    return null
  }
  return _.chain(blogs)
    .countBy('author')
    .map((value, key) => {
      return { author: key, blogs: value }
    })
    .maxBy('blogs')
    .value()
}

const mostLikes = (blogs) => {
  if(blogs.length === 0) {
    return null
  }
  return _.chain(blogs)
    .groupBy('author')
    .map((value, key) => {
      return {
        author: key,
        likes: _.chain(value).map(blog => {
          return blog.likes
        }).sum().value()
      }
    })
    .maxBy('likes')
    .value()
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}