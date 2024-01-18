'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Photos', () => {
  describe('Create', () => {
    let testData = {
      validPhoto: {
        albumId: 101,
        id: 5001,
        title: 'newPhoto',
        url: 'https://via.placeholder.com/600/cda4c0',
        thumbnailUrl: 'https://via.placeholder.com/150/cda4c0',
      },
      invalidPhoto: {
        albumId: 100,
        id: 5000,
        title: 'asperiores exercitationem voluptates qui amet quae necessitatibus facere',
        url: 'https://via.placeholder.com/600/cda4c0',
        thumbnailUrl: 'https://via.placeholder.com/150/cda4c0',
      },
    };
    let addedId;

    it('should add a new photo', () => {
      return chakram
        .post(api.url('photos'), testData.validPhoto)
        .then((response) => {
          expect(response.response.statusCode).to.match(/^20/);
          expect(response.body.data.id).to.be.defined;

          addedId = response.body.data.id;

          const photo = chakram.get(api.url('photos/' + addedId));
          expect(photo).to.have.status(200);
          expect(photo).to.have.json('data.albumId', testData.validPhoto.albumId);
          expect(photo).to.have.json('data.id', testData.validPhoto.id);
          expect(photo).to.have.json('data.title', testData.validPhoto.title);
          expect(photo).to.have.json('data.url', testData.validPhoto.url);
          expect(photo).to.have.json('data.thumbnailUrl', testData.validPhoto.thumbnailUrl);
          return chakram.wait();
        });
    });

    it('should not add a new photo with existing ID', () => {
      const response = chakram.post(api.url('photos'), testData.invalidPhoto);
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url('photos/' + addedId));
      }
    });
  });

  describe('Read', () => {
    it('should have photos', () => {
      const response = chakram.get(api.url('photos'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', (photos) => {
        expect(photos).to.be.instanceof(Array);
        expect(photos.length).to.be.greaterThan(0);
      });
      return chakram.wait();
    });

    it('should return a photo by ID', () => {
      const expectedPhoto = data.photos[0];

      const response = chakram.get(api.url('photos/' + expectedPhoto.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', (photo) => {
        expect(photo).to.be.defined;
        expect(photo.albumId).to.equal(expectedPhoto.albumId);
        expect(photo.id).to.equal(expectedPhoto.id);
        expect(photo.title).to.equal(expectedPhoto.title);
        expect(photo.url).to.equal(expectedPhoto.url);
        expect(photo.thumbnailUrl).to.equal(expectedPhoto.thumbnailUrl);
      });
      return chakram.wait();
    });

    it('should not return photo for invalid ID', () => {
      const response = chakram.get(api.url('photos/no-id-like-this'));
      return expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    let testData = {
      validUpdate: {
        albumId: 1,
        id: 1,
        title: 'updatedPhoto',
        url: 'https://via.placeholder.com/600/cda4c0',
        thumbnailUrl: 'https://via.placeholder.com/150/cda4c0',
      },
      invalidUpdate: {
        albumId: 102,
        id: 6000,
        title: 'asperiores exercitationem voluptates qui aamet quae necessitatibus facere',
        url: 'https://via.placeholder.com/600/cda4c0',
        thumbnailUrl: 'https://via.placeholder.com/150/cda4c0',
      },
    };

    it('should update existing photo with given data', () => {
      const response = chakram.put(api.url('photos/1'), testData.validUpdate);
      expect(response).to.have.status(200);
      return response.then((updatedData) => {
        const photo = chakram.get(api.url('photos/1'));
        expect(photo).to.have.json('data', (data) => {
          expect(data.albumId).to.equal(testData.validUpdate.albumId);
          expect(data.id).to.equal(testData.validUpdate.id);
          expect(data.title).to.equal(testData.validUpdate.title);
        });
        return chakram.wait();
      });
    });

    it('should throw error if the photo does not exist', () => {
      const response = chakram.put(api.url('photos/5001'), testData.invalidUpdate);
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe('Delete', () => {
    it('should delete photo by ID', () => {
      const response = chakram.delete(api.url('photos/500'));
      expect(response).to.have.status(200);
      return response.then(() => {
        const photo = chakram.get(api.url('photos/500'));
        expect(photo).to.have.status(404);
        return chakram.wait();
      });
    });

    it('should throw error if the photos does not exist', () => {
      const response = chakram.delete(api.url('photos/500'));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
