'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Todos Data Driven Tests', () => {
    const selectedTodos = [data.todos[0], data.todos[1]];

    const newTodoData = {
        userId: 1,
        title: 'New Todo',
        completed: false
    };

    let newTodoId;

    describe('Create', () => {
        it('should add a new todo', async () => {
            const response = await chakram.post(api.url('todos'), newTodoData);
            expect(response).to.have.status(201);
            newTodoId = response.body.data.id;
        });
    });

    describe('Read', () => {
        selectedTodos.forEach((todo, index) => {
            it(`should return todo ${index + 1} by ID`, async () => {
                const response = await chakram.get(api.url(`todos/${todo.id}`));
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Update', () => {
        selectedTodos.forEach((todo, index) => {
            it(`should update todo ${index + 1} with given data`, async () => {
                const updatedTodo = { ...todo, title: 'Updated ' + todo.title };
                const response = await chakram.put(api.url(`todos/${todo.id}`), updatedTodo);
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Delete', () => {
        it('should delete the newly added todo', async () => {
            const deleteResponse = await chakram.delete(api.url(`todos/${newTodoId}`));
            expect(deleteResponse).to.have.status(200);

            const getResponse = await chakram.get(api.url(`todos/${newTodoId}`));
            expect(getResponse).to.have.status(404);
        });
    });
});
