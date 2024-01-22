'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Comments Data Driven Tests', () => {
    const selectedComments = [data.comments[0], data.comments[1]];

    const newCommentData = {
        postId: 1,
        name: 'New Comment',
        email: 'new@comment.com',
        body: 'This is a new comment'
    };

    let newCommentId;

    describe('Create', () => {
        it('should add a new comment', async () => {
            const response = await chakram.post(api.url('comments'), newCommentData);
            expect(response).to.have.status(201);
            newCommentId = response.body.data.id;
        });
    });

    describe('Read', () => {
        selectedComments.forEach((comment, index) => {
            it(`should return comment ${index + 1} by ID`, async () => {
                const response = await chakram.get(api.url(`comments/${comment.id}`));
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Update', () => {
        selectedComments.forEach((comment, index) => {
            it(`should update comment ${index + 1} with given data`, async () => {
                const updatedComment = { ...comment, name: 'Updated ' + comment.name };
                const response = await chakram.put(api.url(`comments/${comment.id}`), updatedComment);
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Delete', () => {
        it('should delete the newly added comment', async () => {
            const deleteResponse = await chakram.delete(api.url(`comments/${newCommentId}`));
            expect(deleteResponse).to.have.status(200);

            const getResponse = await chakram.get(api.url(`comments/${newCommentId}`));
            expect(getResponse).to.have.status(404);
        });
    });
});
