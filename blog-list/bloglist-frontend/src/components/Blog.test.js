import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'John Doe',
    url: 'example.com',
    likes: 13,
    user: {
      username: 'user1',
      name: 'Jane Doe'
    }
  }

  const user = {
    username: 'user1'
  }

  const mockHandler = jest.fn()

  let container

  beforeEach(() => {
    container = render(<Blog blog={blog} user={user} updateBlog={mockHandler} />).container
  })

  test('renders only main content', () => {
    const element = screen.getByText('Component testing is done with react-testing-library John Doe')
    const detailsDiv = container.querySelector('.details')
    expect(element).toBeDefined()
    expect(detailsDiv).toHaveStyle('display: none')
  })

  test('renders details if button is clicked', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)
    const detailsDiv = container.querySelector('.details')
    expect(detailsDiv).toHaveStyle('display: block')
  })

  test('renders details if button is clicked', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })

})