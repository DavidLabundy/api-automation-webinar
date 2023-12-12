'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Todos', () => {

  describe('Create', () => {
    let addedId;

    it('should add a new todo', () => {
      return chakram
        .post(api.url('todos'), {
          userId: 1,
          id: 300,
          title: 'newTitle',
          completed: false,
        })
        .then((response) => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;

          addedId = response.body.data.id;

          const todo = chakram.get(api.url('todos/' + addedId));
          expect(todo).to.have.status(200);
          expect(todo).to.have.json('data.userId', 1);
          expect(todo).to.have.json('data.id', 300);
          expect(todo).to.have.json('data.title', 'newTitle');
          expect(todo).to.have.json('data.completed', false);
          return chakram.wait();
        });
    });

    it('should not add a new todo with existing ID', () => {
      const response = chakram.post(api.url('todos'), {
        userId: 10,
        id: 200,
        title: 'newTitle',
        completed: true,
      });
      expect(response).to.have.status(500);
      return chakram.wait();
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
    it('should update existing todo with given data', () => {
      const response = chakram.put(api.url('todos/10'), {
        userId: 1,
        id: 10,
        title: 'illo est ratione doloremque quia maiores aut',
        completed: false,
      });
      expect(response).to.have.status(200);
      return response.then((data) => {
        const todo = chakram.get(api.url('todos/10'));
        expect(todo).to.have.json('data', data => {
          expect(data.userId).to.equal(1);
          expect(data.id).to.equal(10);
          expect(data.title).to.equal('illo est ratione doloremque quia maiores aut');
          expect(data.completed).to.equal(false);
        });
        return chakram.wait();
      });
    });

    it('should throw error if the todo does not exist', () => {
      const response = chakram.put(api.url('todos/250'), {
        id: 250,
      });
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe('Delete', () => {
    it('should delete todo by ID', () => {
      const response = chakram.delete(api.url('todos/5'));
      expect(response).to.have.status(200);
      return response.then(data => {
        const user = chakram.get(api.url('todos/5'));
        expect(user).to.have.status(404);
        return chakram.wait();
      });
    });

    it('should throw error if the todo does not exist', () => {
      const response = chakram.delete(api.url('todos/5'));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});