'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Comments', () => {
  describe('Create', () => {
    let testData = {
      validComment: {
        name: 'name',
        body: 'body',
        userId: 1,
      },
      invalidComment: {
        id: 50,
        name: 'name',
        body: 'body',
        userId: 1,
      },
    };
    let addedId;

    it('should add a new comment', () => {
      return chakram
        .post(api.url('comments'), testData.validComment)
        .then((response) => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;

          addedId = response.body.data.id;

          const comment = chakram.get(api.url('comments/' + addedId));
          expect(comment).to.have.status(200);
          expect(comment).to.have.json('data.id', addedId);
          expect(comment).to.have.json('data.name', testData.validComment.name);
          expect(comment).to.have.json('data.body', testData.validComment.body);
          expect(comment).to.have.json('data.userId', testData.validComment.userId);
          return chakram.wait();
        });
    });

    it('should not add a new comment with existing ID', () => {
      const response = chakram.post(api.url('comments'), testData.invalidComment);
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url('comments/' + addedId));
      }
    });
  });

  describe('Read', () => {
    it('should have comments', () => {
      const response = chakram.get(api.url('comments'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', (comments) => {
        expect(comments).to.be.instanceof(Array);
        expect(comments.length).to.be.greaterThan(0);
      });
      return chakram.wait();
    });

    it('should return a comment by ID', () => {
      const expectedComment = data.comments[0];

      const response = chakram.get(api.url('comments/' + expectedComment.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', (comment) => {
        expect(comment).to.be.defined;
        expect(comment.id).to.equal(expectedComment.id);
        expect(comment.userId).to.equal(expectedComment.userId);
        expect(comment.name).to.equal(expectedComment.name);
        expect(comment.body).to.equal(expectedComment.body);
      });
      return chakram.wait();
    });

    it('should not return comment for invalid ID', () => {
      const response = chakram.get(api.url('comments/no-id-like-this'));
      return expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    let testData = {
      validUpdate: {
        name: 'name',
        body: 'body',
        userId: 111,
      },
      invalidUpdate: {
        name: 'name',
        body: 'body',
        userId: 111,
      },
    };

    it('should update existing comment with given data', () => {
      const response = chakram.put(api.url('comments/50'), testData.validUpdate);
      expect(response).to.have.status(200);
      return response.then((updatedData) => {
        const comment = chakram.get(api.url('comments/50'));
        expect(comment).to.have.json('data', (data) => {
          expect(data.name).to.equal(testData.validUpdate.name);
          expect(data.body).to.equal(testData.validUpdate.body);
          expect(data.userId).to.equal(testData.validUpdate.userId);
        });
        return chakram.wait();
      });
    });

    it('should throw error if the comment does not exist', () => {
      const response = chakram.put(api.url('comments/501'), testData.invalidUpdate);
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe('Delete', () => {
    it('should delete comment by ID', () => {
      const response = chakram.delete(api.url('comments/10'));
      expect(response).to.have.status(200);
      return response.then(() => {
        const comment = chakram.get(api.url('comments/10'));
        expect(comment).to.have.status(404);
        return chakram.wait();
      });
    });

    it('should throw error if the comment does not exist', () => {
      const response = chakram.delete(api.url('comments/10'));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
