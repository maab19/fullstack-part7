import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreateBlogForm from './CreateBlogForm'
import userEvent from '@testing-library/user-event'

test('<CreateBlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = jest.fn()
  const user = userEvent.setup()

  render(<CreateBlogForm createBlog={createBlog} />)

  const titleInput = screen.getByPlaceholderText('enter title')
  const authorInput = screen.getByPlaceholderText('enter author')
  const urlInput = screen.getByPlaceholderText('enter url')
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'New Blog')
  await user.type(authorInput, 'Goethe')
  await user.type(urlInput, 'blog.not')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('New Blog')
  expect(createBlog.mock.calls[0][0].author).toBe('Goethe')
  expect(createBlog.mock.calls[0][0].url).toBe('blog.not')
})