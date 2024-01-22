'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Todos', () => {
  describe('Create', () => {
    let addedId;

    it('should add a new todo', async () => {
      const response = await chakram.post(api.url('todos'), {
        userId: 1,
        id: 300,
        title: 'newTitle',
        completed: false,
      });
      expect(response.response.statusCode).to.match(/^20/);
      expect(response.body.data.id).to.be.defined;

      addedId = response.body.data.id;

      const todo = await chakram.get(api.url('todos/' + addedId));
      expect(todo).to.have.status(200);
      expect(todo).to.have.json('data.userId', 1);
      expect(todo).to.have.json('data.id', 300);
      expect(todo).to.have.json('data.title', 'newTitle');
      expect(todo).to.have.json('data.completed', false);
    });

    it('should not add a new todo with existing ID', async () => {
      const response = await chakram.post(api.url('todos'), {
        userId: 10,
        id: 200,
        title: 'newTitle',
        completed: true,
      });
      expect(response).to.have.status(500);
    });

    after(async () => {
      if (addedId) {
        await chakram.delete(api.url('todos/' + addedId));
      }
    });
  });

  describe('Read', () => {
    it('should have todos', async () => {
      const response = await chakram.get(api.url('todos'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', todos => {
        expect(todos).to.be.instanceof(Array);
        expect(todos.length).to.be.greaterThan(0);
      });
    });

    it('should return a todo by ID', async () => {
      const expectedTodo = data.todos[0];
      const response = await chakram.get(api.url('todos/' + expectedTodo.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', todo => {
        expect(todo).to.be.defined;
        expect(todo.userId).to.equal(expectedTodo.userId);
        expect(todo.id).to.equal(expectedTodo.id);
        expect(todo.title).to.equal(expectedTodo.title);
        expect(todo.completed).to.equal(expectedTodo.completed);
      });
    });

    it('should not return todo for invalid ID', async () => {
      const response = await chakram.get(api.url('todos/no-id-like-this'));
      expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    it('should update existing todo with given data', async () => {
      const updateResponse = await chakram.put(api.url('todos/10'), {
        userId: 1,
        id: 10,
        title: 'illo est ratione doloremque quia maiores aut',
        completed: false,
      });
      expect(updateResponse).to.have.status(200);

      const todoResponse = await chakram.get(api.url('todos/10'));
      expect(todoResponse).to.have.json('data', todo => {
        expect(todo.userId).to.equal(1);
        expect(todo.id).to.equal(10);
        expect(todo.title).to.equal('illo est ratione doloremque quia maiores aut');
        expect(todo.completed).to.equal(false);
      });
    });

    it('should throw error if the todo does not exist', async () => {
      const response = await chakram.put(api.url('todos/250'), {
        id: 250,
      });
      expect(response).to.have.status(404);
    });
  });

  describe('Delete', () => {
    it('should delete todo by ID', async () => {
      const deleteResponse = await chakram.delete(api.url('todos/5'));
      expect(deleteResponse).to.have.status(200);

      const todoResponse = await chakram.get(api.url('todos/5'));
      expect(todoResponse).to.have.status(404);
    });

    it('should throw error if the todo does not exist', async () => {
      const response = await chakram.delete(api.url('todos/5'));
      expect(response).to.have.status(404);
    });
  });
});