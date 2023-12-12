'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Users', () => {
    describe('Create', () => {
        let addedId;

        it('should add a new user', () => {
            return chakram
                .post(api.url('users'), {
                    id: 11,
                    name: 'newName',
                    username: 'username',
                    email: 'newname@gmail.com',
                })
                .then((response) => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const user = chakram.get(api.url('users/' + addedId));
                    expect(user).to.have.status(200);
                    expect(user).to.have.json('data.id', addedId);
                    expect(user).to.have.json('data.name', 'newName');
                    expect(user).to.have.json('data.username', 'username');
                    expect(user).to.have.json('data.email', 'newname@gmail.com');
                    return chakram.wait();
                });
        });

        it('should not add a new user with existing ID', () => {
            const response = chakram.post(api.url('users'), {
                id: 2,
                name: 'newNames',
                email: 'email@address.com',
                userId: 1,
            });
            expect(response).to.have.status(500);
            return chakram.wait();
        });

        after(() => {
            if (addedId) {
                return chakram.delete(api.url('users/' + addedId));
            }
        });
    });

    describe('Read', () => {
        it('should have users', () => {
            const response = chakram.get(api.url('users'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });

        it('should return a user by ID', () => {
            const expectedUser = data.users[0];

            const response = chakram.get(api.url('users/' + expectedUser.id));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', user => {
                expect(user).to.be.defined;
                expect(user.id).to.equal(expectedUser.id);
                expect(user.userId).to.equal(expectedUser.userId);
                expect(user.name).to.equal(expectedUser.name);
                expect(user.email).to.equal(expectedUser.email);
            });
            return chakram.wait();
        });

        it('should not return user for invalid ID', () => {
            const response = chakram.get(api.url('users/no-id-like-this'));
            return expect(response).to.have.status(404);
        });
    });

    describe('Update', () => {
        it('should update existing user with given data', () => {
            const response = chakram.put(api.url('users/1'), {
                name: 'updatedName',
                email: 'updated@email.com',
                id: 1,
            });
            expect(response).to.have.status(200);
            return response.then(data => {
                const user = chakram.get(api.url('users/1'));
                expect(user).to.have.json('data', data => {
                    expect(data.name).to.equal('updatedName');
                    expect(data.email).to.equal('updated@email.com');
                    expect(data.id).to.equal(1);
                });
                return chakram.wait();
            });
        });

        it('should throw error if the user does not exist', () => {
            const response = chakram.put(api.url('users/11'), {
                name: 'name',
                email: 'email',
                userId: 11,
            });
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe('Delete', () => {
        it('should delete user by ID', () => {
            const response = chakram.delete(api.url('users/1'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const user = chakram.get(api.url('users/1'));
                expect(user).to.have.status(404);
                return chakram.wait();
            });
        });

        it('should throw error if the user does not exist', () => {
            const response = chakram.delete(api.url('users/11'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });
});