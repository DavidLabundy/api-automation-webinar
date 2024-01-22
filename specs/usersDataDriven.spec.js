'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('@dataDriven Users Data Driven Tests', () => {
    const selectedUsers = [data.users[0], data.users[1]];

    const newUserData = {
        name: 'New User',
        username: 'NewUsername',
        email: 'newuser@example.com',
        address: {
            street: '123 New St',
            suite: 'Apt 100',
            city: 'New City',
            zipcode: '10001',
            geo: {
                lat: '-37.3159',
                lng: '81.1496'
            }
        },
        phone: '123-456-7890',
        website: 'newuser.org',
        company: {
            name: 'NewUser Inc.',
            catchPhrase: 'Empowering New Users',
            bs: 'revolutionize user experiences'
        }
    };

    let newUserId;

    describe('Create', () => {
        it('should add a new user', async () => {
            const response = await chakram.post(api.url('users'), newUserData);
            expect(response).to.have.status(201);
            newUserId = response.body.data.id;
        });
    });

    describe('Read', () => {
        selectedUsers.forEach((user, index) => {
            it(`should return user ${index + 1} by ID`, async () => {
                const response = await chakram.get(api.url(`users/${user.id}`));
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Update', () => {
        selectedUsers.forEach((user, index) => {
            it(`should update user ${index + 1} with given data`, async () => {
                const updatedUser = { ...user, name: 'Updated ' + user.name };
                const response = await chakram.put(api.url(`users/${user.id}`), updatedUser);
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Delete', () => {
        it('should delete the newly added user', async () => {
            const deleteResponse = await chakram.delete(api.url(`users/${newUserId}`));
            expect(deleteResponse).to.have.status(200);

            const getResponse = await chakram.get(api.url(`users/${newUserId}`));
            expect(getResponse).to.have.status(404);
        });
    });
});
