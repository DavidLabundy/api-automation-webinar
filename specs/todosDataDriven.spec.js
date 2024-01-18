'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Todos', () => {

  describe('Create', () => {
    let addedId;

    const createTestData = [
      {
        userId: 1,
        id: 300,
        title: 'newTitle',
        completed: false,
        expectStatus: 201,
      },
      {
        userId: 10,
        id: 200,
        title: 'newTitle',
        completed: true,
        expectStatus: 500,
      },
    ];

    createTestData.forEach((test, index) => {
      it(`should ${index === 0 ? 'add' : 'not add'} a new todo`, () => {
        return chakram.post(api.url('todos'), test)
          .then((response) => {
            expect(response.response.statusCode).to.equal(test.expectStatus);

            if (index === 0) {
              expect(response.body.data.id).to.be.defined;
              addedId = response.body.data.id;
            }

            if (index === 0) {
              const todo = chakram.get(api.url('todos/' + addedId));
              expect(todo).to.have.status(200);
              expect(todo).to.have.json('data.userId', test.userId);
              expect(todo).to.have.json('data.id', test.id);
              expect(todo).to.have.json('data.title', test.title);
              expect(todo).to.have.json('data.completed', test.completed);
              return chakram.wait();
            }

            return chakram.wait();
          });
      });
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url('todos/' + addedId));
      }
    });
  });

  describe('Read', () => {
    it('should have todos', () => {
      const response = chakram.get(api.url('todos'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', data => {
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.be.greaterThan(0);
      });
      return chakram.wait();
    });

    it('should return a todo by ID', () => {
      const expectedTodo = data.todos[0];

      const response = chakram.get(api.url('todos/' + expectedTodo.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', todo => {
        expect(todo).to.be.defined;
        expect(todo.userId).to.equal(expectedTodo.userId);
        expect(todo.id).to.equal(expectedTodo.id);
        expect(todo.title).to.equal(expectedTodo.title);
        expect(todo.completed).to.equal(expectedTodo.completed);
      });
      return chakram.wait();
    });

    it('should not return todo for invalid ID', () => {
      const response = chakram.get(api.url('todos/no-id-like-this'));
      return expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    const updateTestData = [
      {
        todoId: 10,
        updateData: {
          userId: 1,
          id: 10,
          title: 'illo est ratione doloremque quia maiores aut',
          completed: false,
        },
        expectStatus: 200,
      },
      {
        todoId: 250,
        updateData: {
          id: 250,
        },
        expectStatus: 404,
      },
    ];

    updateTestData.forEach((test) => {
      it('should update existing todo with given data', () => {
        const response = chakram.put(api.url(`todos/${test.todoId}`), test.updateData);
        expect(response).to.have.status(test.expectStatus);

        if (test.expectStatus === 200) {
          return response.then(() => {
            const todo = chakram.get(api.url(`todos/${test.todoId}`));
            expect(todo).to.have.json('data', data => {
              expect(data.userId).to.equal(test.updateData.userId);
              expect(data.id).to.equal(test.updateData.id);
              expect(data.title).to.equal(test.updateData.title);
              expect(data.completed).to.equal(test.updateData.completed);
            });

            return chakram.wait();
          });
        }

        return chakram.wait();
      });
    });
  });

  describe('Delete', () => {
    const deleteTestData = [
      {
        todoId: 5,
        expectStatus: 200,
        expectNotFoundStatus: 404,
      },
      {
        todoId: 5,
        expectStatus: 404,
      },
    ];

    deleteTestData.forEach((test) => {
      it('should delete todo by ID', () => {
        const response = chakram.delete(api.url(`todos/${test.todoId}`));
        expect(response).to.have.status(test.expectStatus);

        if (test.expectStatus === 200) {
          return response.then(() => {
            const todo = chakram.get(api.url(`todos/${test.todoId}`));
            expect(todo).to.have.status(test.expectNotFoundStatus);
            return chakram.wait();
          });
        }

        return chakram.wait();
      });
    });
  });
});
