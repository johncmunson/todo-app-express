const { Todo } = require('../../models')

describe('[copy] GET /todos', () => {
  it('[copy] returns a list of todos', async () => {
    const { body: todos } = await request(app).get('/todos')
    todos.forEach(todo => {
      expect(() => Todo.fromJson(todo)).not.toThrow()
    })
  })
})

describe('[copy] POST /todos', () => {
  it('[copy] creates a new todo', async () => {
    const todo = { title: 'Setup for the party' }
    const { body: newTodo, status: newTodoStatus } =
      await request(app).post('/todos').send(todo)
    const { body: fetchedTodo, status: fetchedTodoStatus } =
      await request(app).get(`/todos/${newTodo.id}`)
    expect(newTodoStatus).toEqual(201)
    expect(fetchedTodoStatus).toEqual(200)
    expect(() => Todo.fromJson(newTodo)).not.toThrow()
    expect(() => Todo.fromJson(fetchedTodo)).not.toThrow()
    expect(newTodo).toEqual(fetchedTodo)
  })
  it('[copy] returns error when given invalid todo', async () => {
    const { body: error, status } =
      await request(app).post('/todos').send({})
    expect(status).toEqual(400)
    expect(error.type).toEqual('ModelValidation')
  })
})

describe('[copy] DELETE /todos/:id', () => {
  it('[copy] deletes a todo', async () => {
    const todo = { title: 'Return some videotapes' }
    const { body: newTodo, status: newTodoStatus } =
      await request(app).post('/todos').send(todo)
    const { status: deletedStatus } =
      await request(app).delete(`/todos/${newTodo.id}`)
    expect(deletedStatus).toEqual(204)
  })
  it('[copy] returns error when deleting a todo that does not exist', async () => {
    const { body: error, status } =
      await request(app).delete('/todos/ry7634y8r374')
    expect(status).toEqual(404)
    expect(error.type).toEqual('NotFound')
  })
})

describe('[copy] PATCH /todos/:id', () => {
  const todoTitles = ['Lift some weights', 'Buy some flowers']
  let newTodo
  let newTodoStatus
  beforeEach(async () => {
    if (todoTitles.length) {
      const { body, status } = await request(app)
        .post('/todos')
        .send({ title: todoTitles.shift() })
      newTodo = body
      newTodoStatus = status
    }
  })
  it('[copy] edits a todo', async () => {
    const { body: patchedTodo, status: patchedTodoStatus } =
      await request(app)
        .patch(`/todos/${newTodo.id}`)
        .send({ complete: true })
    expect(patchedTodoStatus).toEqual(200)
    expect(patchedTodo.complete).toEqual(true)
    expect(patchedTodo.id).toEqual(newTodo.id)
    expect(() => Todo.fromJson(patchedTodo)).not.toThrow()
  })
  it('[copy] returns error when given invalid todo', async () => {
    const { body: error, status } =
      await request(app)
        .patch(`/todos/${newTodo.id}`)
        .send({ asdf: 'asdf' })
    expect(status).toEqual(500)
    expect(error.type).toEqual('UnknownDatabaseError')
  })
  it('[copy] returns error when editing a todo that does not exist', async () => {
    const { body: error, status } =
      await request(app).patch('/todos/783y4f87y38sf').send({ complete: true })
    expect(status).toEqual(404)
    expect(error.type).toEqual('NotFound')
  })
})

describe('[copy] PUT /todos/:id', () => {
  const todoTitles = ['Wash the car', 'Read a book']
  let newTodo
  let newTodoStatus
  beforeEach(async () => {
    if (todoTitles.length) {
      const { body, status } = await request(app)
        .post('/todos')
        .send({ title: todoTitles.shift() })
      newTodo = body
      newTodoStatus = status
    }
  })
  it('[copy] replaces a todo', async () => {
    const { body: replacedTodo, status: replacedTodoStatus } =
      await request(app)
        .put(`/todos/${newTodo.id}`)
        .send({ title: 'Get an oil change' })
    expect(replacedTodoStatus).toEqual(200)
    expect(replacedTodo.title).toEqual('Get an oil change')
    expect(replacedTodo.id).toEqual(newTodo.id)
    expect(() => Todo.fromJson(replacedTodo)).not.toThrow()
  })
  it('[copy] returns error when given invalid todo', async () => {
    const { body: error, status } =
      await request(app)
        .put(`/todos/${newTodo.id}`)
        .send({ qwerty: 'qwerty' })
    expect(status).toEqual(400)
    expect(error.type).toEqual('ModelValidation')
  })
  it('[copy] returns error when replacing a todo that does not exist', async () => {
    const { body: error, status } =
      await request(app)
        .put('/todos/s7d8h8wf87s')
        .send({ title: 'Drink some water' })
    expect(status).toEqual(404)
    expect(error.type).toEqual('NotFound')
  })
})
