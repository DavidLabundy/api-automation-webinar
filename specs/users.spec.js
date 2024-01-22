'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Users', () => {
    describe('Create', () => {
        let addedId;

        it('should add a new user', async () => {
            const response = await chakram.post(api.url('users'), {
                id: 11,
                name: 'newName',
                username: 'username',
                email: 'newname@gmail.com',
            });
            expect(response.response.statusCode).to.match(/^20/);
            expect(response.body.data.id).to.be.defined;

            addedId = response.body.data.id;
            const userResponse = await chakram.get(api.url('users/' + addedId));
            expect(userResponse).to.have.status(200);
            expect(userResponse).to.have.json('data.id', addedId);
            expect(userResponse).to.have.json('data.name', 'newName');
            expect(userResponse).to.have.json('data.username', 'username');
            expect(userResponse).to.have.json('data.email', 'newname@gmail.com');
        });

        it('should not add a new user with existing ID', async () => {
            const response = await chakram.post(api.url('users'), {
                id: 2,
                name: 'newNames',
                email: 'email@address.com',
                userId: 1,
            });
            expect(response).to.have.status(500);
        });

        after(async () => {
            if (addedId) {
                await chakram.delete(api.url('users/' + addedId));
            }
        });
    });

    describe('Read', () => {
        it('should have users', async () => {
            const response = await chakram.get(api.url('users'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', users => {
                expect(users).to.be.instanceof(Array);
                expect(users.length).to.be.greaterThan(0);
            });
        });

        it('should return a user by ID', async () => {
            const expectedUser = data.users[0];
            const response = await chakram.get(api.url('users/' + expectedUser.id));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', user => {
                expect(user).to.be.defined;
                expect(user.id).to.equal(expectedUser.id);
                expect(user.userId).to.equal(expectedUser.userId);
                expect(user.name).to.equal(expectedUser.name);
                expect(user.email).to.equal(expectedUser.email);
            });
        });

        it('should not return user for invalid ID', async () => {
            const response = await chakram.get(api.url('users/no-id-like-this'));
            expect(response).to.have.status(404);
        });
    });

    describe('Update', () => {
        it('should update existing user with given data', async () => {
            const response = await chakram.put(api.url('users/1'), {
                name: 'updatedName',
                email: 'updated@email.com',
                id: 1,
            });
            expect(response).to.have.status(200);

            const userResponse = await chakram.get(api.url('users/1'));
            expect(userResponse).to.have.json('data', user => {
                expect(user.name).to.equal('updatedName');
                expect(user.email).to.equal('updated@email.com');
                expect(user.id).to.equal(1);
            });
        });

        it('should throw error if the user does not exist', async () => {
            const response = await chakram.put(api.url('users/11'), {
                name: 'name',
                email: 'email',
                userId: 11,
            });
            expect(response).to.have.status(404);
        });
    });

    describe('Delete', () => {
        it('should delete user by ID', async () => {
            const response = await chakram.delete(api.url('users/1'));
            expect(response).to.have.status(200);

            const userResponse = await chakram.get(api.url('users/1'));
            expect(userResponse).to.have.status(404);
        });

        it('should throw error if the user does not exist', async () => {
            const response = await chakram.delete(api.url('users/11'));
            expect(response).to.have.status(404);
        });
    });
});
