'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Users', () => {

  describe('Create', () => {
    let addedId;

    const createTestData = [
      {
        id: 11,
        name: 'newName',
        username: 'username',
        email: 'newname@gmail.com',
        expectStatus: 201,
      },
      {
        id: 2,
        name: 'newNames',
        email: 'email@address.com',
        userId: 1,
        expectStatus: 500,
      },
    ];

    createTestData.forEach((test, index) => {
      it(`should ${index === 0 ? 'add' : 'not add'} a new user`, () => {
        return chakram.post(api.url('users'), test)
          .then((response) => {
            expect(response.response.statusCode).to.equal(test.expectStatus);

            if (index === 0) {
              expect(response.body.data.id).to.be.defined;
              addedId = response.body.data.id;
            }

            if (index === 0) {
              const user = chakram.get(api.url('users/' + addedId));
              expect(user).to.have.status(200);
              expect(user).to.have.json('data.id', test.id);
              expect(user).to.have.json('data.name', test.name);
              expect(user).to.have.json('data.username', test.username);
              expect(user).to.have.json('data.email', test.email);
              return chakram.wait();
            }

            return chakram.wait();
          });
      });
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
    const updateTestData = [
      {
        userId: 1,
        updateData: {
          name: 'updatedName',
          email: 'updated@email.com',
          id: 1,
        },
        expectStatus: 200,
      },
      {
        userId: 11,
        updateData: {
          name: 'name',
          email: 'email',
          userId: 11,
        },
        expectStatus: 404,
      },
    ];

    updateTestData.forEach((test) => {
      it('should update existing user with given data', () => {
        const response = chakram.put(api.url(`users/${test.userId}`), test.updateData);
        expect(response).to.have.status(test.expectStatus);

        if (test.expectStatus === 200) {
          return response.then(() => {
            const user = chakram.get(api.url(`users/${test.userId}`));
            expect(user).to.have.json('data', data => {
              expect(data.name).to.equal(test.updateData.name);
              expect(data.email).to.equal(test.updateData.email);
              expect(data.id).to.equal(test.updateData.id);
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
        userId: 1,
        expectStatus: 200,
        expectNotFoundStatus: 404,
      },
      {
        userId: 11,
        expectStatus: 404,
      },
    ];

    deleteTestData.forEach((test) => {
      it('should delete user by ID', () => {
        const response = chakram.delete(api.url(`users/${test.userId}`));
        expect(response).to.have.status(test.expectStatus);

        if (test.expectStatus === 200) {
          return response.then(() => {
            const user = chakram.get(api.url(`users/${test.userId}`));
            expect(user).to.have.status(test.expectNotFoundStatus);
            return chakram.wait();
          });
        }

        return chakram.wait();
      });
    });
  });
});
