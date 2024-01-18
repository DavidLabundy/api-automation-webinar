'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe.only('Posts', () => {
    describe('Create', () => {
        let addedId;

        const testData = [
            {
                title: 'title',
                body: 'body',
                userId: 1,
                expectStatus: 201,
            },
            {
                id: 50,
                title: 'title',
                body: 'body',
                userId: 1,
                expectStatus: 500,
            },
        ];

        testData.forEach((test, index) => {
            it(`should ${index === 0 ? 'add' : 'not add'} a new post`, () => {
                return chakram.post(api.url('posts'), test)
                    .then(response => {
                        expect(response.response.statusCode).to.equal(test.expectStatus);

                        if (index === 0) {
                            expect(response.body.data.id).to.be.defined;
                            addedId = response.body.data.id;
                        }

                        return chakram.wait();
                    });
            });
        });

        after(() => {
            if (addedId) {
                return chakram.delete(api.url('posts/' + addedId));
            }
        });
    });

    describe('Read', () => {
        it('should have posts', () => {
            const response = chakram.get(api.url('posts'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });
    });

    describe('Update', () => {
        const updateTestData = [
            {
                postId: 50,
                updateData: {
                    title: 'title',
                    body: 'body',
                    userId: 111,
                },
                expectStatus: 200,
            },
            {
                postId: 111,
                updateData: {
                    title: 'title',
                    body: 'body',
                    userId: 111,
                },
                expectStatus: 404,
            },
        ];

        updateTestData.forEach((test) => {
            it('should update existing post with given data', () => {
                const response = chakram.put(api.url(`posts/${test.postId}`), test.updateData);
                expect(response).to.have.status(test.expectStatus);

                if (test.expectStatus === 200) {
                    return response.then(() => {
                        const post = chakram.get(api.url(`posts/${test.postId}`));
                        expect(post).to.have.json('data', data => {
                            expect(data.title).to.equal(test.updateData.title);
                            expect(data.body).to.equal(test.updateData.body);
                            expect(data.userId).to.equal(test.updateData.userId);
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
                postId: 50,
                expectStatus: 200,
                expectNotFoundStatus: 404,
            },
            {
                postId: 111,
                expectStatus: 404,
            },
        ];

        deleteTestData.forEach((test) => {
            it('should delete post by ID', () => {
                const response = chakram.delete(api.url(`posts/${test.postId}`));
                expect(response).to.have.status(test.expectStatus);

                if (test.expectStatus === 200) {
                    return response.then(() => {
                        const post = chakram.get(api.url(`posts/${test.postId}`));
                        expect(post).to.have.status(test.expectNotFoundStatus);
                        return chakram.wait();
                    });
                }

                return chakram.wait();
            });
        });
    });
});
