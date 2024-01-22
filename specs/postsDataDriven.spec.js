'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Posts Data Driven Tests', () => {
    const newPostData = {
        userId: 1,
        title: 'New Post Title',
        body: 'New post body content.'
    };

    const selectedPosts = [data.posts[0], data.posts[1]];

    let newPostId;

    describe('Create', () => {
        it('should add a new post', async () => {
            const response = await chakram.post(api.url('posts'), newPostData);
            expect(response).to.have.status(201);
            newPostId = response.body.data.id;
        });
    });

    describe('Read', () => {
        selectedPosts.forEach((post, index) => {
            it(`should return post ${index + 1} by ID`, async () => {
                const response = await chakram.get(api.url(`posts/${post.id}`));
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Update', () => {
        selectedPosts.forEach((post, index) => {
            it(`should update post ${index + 1} with given data`, async () => {
                const updatedPost = { ...post, title: 'Updated ' + post.title };
                const response = await chakram.put(api.url(`posts/${post.id}`), updatedPost);
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Delete', () => {
        it('should delete the newly added post', async () => {
            const deleteResponse = await chakram.delete(api.url(`posts/${newPostId}`));
            expect(deleteResponse).to.have.status(200);

            const getResponse = await chakram.get(api.url(`posts/${newPostId}`));
            expect(getResponse).to.have.status(404);
        });
    });
});
