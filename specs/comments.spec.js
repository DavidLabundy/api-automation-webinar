'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Comments', () => {
  let addedId;

  describe('Create', () => {
    it('should add a new comment', async () => {
      const newComment = {
        name: 'name',
        body: 'body',
        userId: 1,
      };

      const response = await chakram.post(api.url('comments'), newComment);
      expect(response).to.have.status(201);
      addedId = response.body.data.id;

      const comment = await chakram.get(api.url('comments/' + addedId));
      expect(comment).to.have.status(200);
      expect(comment).to.have.json('data', data => {
        expect(data.id).to.equal(addedId);
        expect(data.name).to.equal(newComment.name);
        expect(data.body).to.equal(newComment.body);
        expect(data.userId).to.equal(newComment.userId);
      });
    });

    it('should not add a new comment with existing ID', async () => {
      const response = await chakram.post(api.url('comments'), {
        id: 50,
        name: 'name',
        body: 'body',
        userId: 1,
      });
      expect(response).to.have.status(500);
    });
  });

  describe('Read', () => {
    it('should have comments', async () => {
      const response = await chakram.get(api.url('comments'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', data => {
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.be.greaterThan(0);
      });
    });

    it('should return a comment by ID', async () => {
      const expectedComment = data.comments[0];
      const response = await chakram.get(api.url('comments/' + expectedComment.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', comment => {
        expect(comment.id).to.equal(expectedComment.id);
        expect(comment.userId).to.equal(expectedComment.userId);
        expect(comment.name).to.equal(expectedComment.name);
        expect(comment.body).to.equal(expectedComment.body);
      });
    });

    it('should not return comment for invalid ID', async () => {
      const response = await chakram.get(api.url('comments/no-id-like-this'));
      expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    it('should update existing comment with given data', async () => {
      const updatedComment = {
        name: 'updated name',
        body: 'updated body',
        userId: 111,
      };

      const response = await chakram.put(api.url('comments/50'), updatedComment);
      expect(response).to.have.status(200);

      const comment = await chakram.get(api.url('comments/50'));
      expect(comment).to.have.json('data', data => {
        expect(data.name).to.equal(updatedComment.name);
        expect(data.body).to.equal(updatedComment.body);
        expect(data.userId).to.equal(updatedComment.userId);
      });
    });

    it('should throw error if the comment does not exist', async () => {
      const response = await chakram.put(api.url('comments/501'), {
        name: 'name',
        body: 'body',
        userId: 111,
      });
      expect(response).to.have.status(404);
    });
  });

  describe('Delete', () => {
    it('should delete comment by ID', async () => {
      const response = await chakram.delete(api.url('comments/10'));
      expect(response).to.have.status(200);

      const comment = await chakram.get(api.url('comments/10'));
      expect(comment).to.have.status(404);
    });

    it('should throw error if the comment does not exist', async () => {
      const response = await chakram.delete(api.url('comments/10'));
      expect(response).to.have.status(404);
    });
  });

  after(async () => {
    if (addedId) {
      await chakram.delete(api.url('comments/' + addedId));
    }
  });
});
