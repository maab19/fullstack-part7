describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    cy.createUser({ name: 'John Doe', username: 'user1', password: 'sekret' })
    cy.createUser({ name: 'Jane Doe', username: 'user2', password: 'sekret' })
    cy.visit('')
  })

  it('Login form is shown', function() {
    cy.get('#login-form')
  })

  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('user1')
      cy.get('#password').type('sekret')
      cy.get('#login-button').click()
      cy.get('.success').contains('Login successful')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('user1')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()
      cy.get('.error')
        .should('contain', 'Wrong credentials')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'user1', password: 'sekret' })
    })

    it('A blog can be created', function() {
      cy.contains('Add Blog').click()
      cy.get('#title').type('Blog 1')
      cy.get('#author').type('John Doe')
      cy.get('#url').type('blog.not')
      cy.get('#create-blog-button').click()

      cy.contains('Blog 1 John Doe')
    })
  })

  describe('When logged in and a blog exists', function() {
    beforeEach(function() {
      cy.login({ username: 'user1', password: 'sekret' })
      cy.createBlog({ title: 'Blog 1', author: 'John Doe', url: 'blog.not' })
    })

    it('A blog can be liked', function() {
      cy.contains('view').click()
      cy.get('.blog').find('.likeButton').click()

      cy.get('.blog').should('contain', 'likes: 1')
    })

    it('A blog can be deleted by its creator', function() {
      cy.contains('view').click()
      cy.contains('delete').click()

      cy.contains('Blog 1 John Doe').should('not.exist')
    })

    it('A blog cannot be deleted by a different user than its creator', function() {
      cy.logout()
      cy.login({ username: 'user2', password: 'sekret' })
      cy.contains('view').click()
      cy.contains('delete').should('have.css', 'display', 'none')
    })
  })

  describe('When logged in and multiple blogs exists', function() {
    beforeEach(function() {
      cy.login({ username: 'user1', password: 'sekret' })
      cy.createBlog({ title: 'Blog least likes', author: 'John Doe', url: 'blog.not' })
      cy.createBlog({ title: 'Blog most likes', author: 'John Doe', url: 'blog.not' })
      cy.createBlog({ title: 'Blog medium likes', author: 'John Doe', url: 'blog.not' })
    })

    it('blogs are ordered by likes', function() {
      cy.contains('Blog medium likes John Doe').contains('view').click()
      cy.contains('Blog medium likes John Doe').parent().find('.likeButton').click()

      cy.contains('Blog most likes John Doe').contains('view').click()
      cy.contains('Blog most likes John Doe').parent().find('.likeButton').click()
      cy.contains('Blog most likes John Doe').parent().should('contain', 'likes: 1')
      cy.contains('Blog most likes John Doe').parent().find('.likeButton').click()

      cy.get('.blog').eq(0).should('contain', 'Blog most likes John Doe')
      cy.get('.blog').eq(1).should('contain', 'Blog medium likes John Doe')
      cy.get('.blog').eq(2).should('contain', 'Blog least likes John Doe')
    })
  })

})