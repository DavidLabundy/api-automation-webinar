'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Photos', () => {
  let addedId;

  describe('Create', () => {
    it('should add a new photo', async () => {
      const newPhoto = {
        albumId: 101,
        id: 5001,
        title: 'newPhoto',
        url: 'https://via.placeholder.com/600/cda4c0',
        thumbnailUrl: 'https://via.placeholder.com/150/cda4c0',
      };

      const response = await chakram.post(api.url('photos'), newPhoto);
      expect(response).to.have.status(201);
      addedId = response.body.data.id;

      const photo = await chakram.get(api.url('photos/' + addedId));
      expect(photo).to.have.status(200);
      expect(photo).to.have.json('data', data => {
        expect(data.albumId).to.equal(newPhoto.albumId);
        expect(data.id).to.equal(newPhoto.id);
        expect(data.title).to.equal(newPhoto.title);
        expect(data.url).to.equal(newPhoto.url);
        expect(data.thumbnailUrl).to.equal(newPhoto.thumbnailUrl);
      });
    });

    it('should not add a new photo with existing ID', async () => {
      const response = await chakram.post(api.url('photos'), {
        albumId: 100,
        id: 5000,
        title: 'existingPhoto',
        url: 'https://via.placeholder.com/600/cda4c0',
        thumbnailUrl: 'https://via.placeholder.com/150/cda4c0',
      });
      expect(response).to.have.status(500);
    });
  });

  describe('Read', () => {
    it('should have photos', async () => {
      const response = await chakram.get(api.url('photos'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', data => {
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.be.greaterThan(0);
      });
    });

    it('should return a photo by ID', async () => {
      const expectedPhoto = data.photos[0];
      const response = await chakram.get(api.url('photos/' + expectedPhoto.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', photo => {
        expect(photo.albumId).to.equal(expectedPhoto.albumId);
        expect(photo.id).to.equal(expectedPhoto.id);
        expect(photo.title).to.equal(expectedPhoto.title);
        expect(photo.url).to.equal(expectedPhoto.url);
        expect(photo.thumbnailUrl).to.equal(expectedPhoto.thumbnailUrl);
      });
    });

    it('should not return photo for invalid ID', async () => {
      const response = await chakram.get(api.url('photos/no-id-like-this'));
      expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    it('should update existing photo with given data', async () => {
      const updatedPhoto = {
        albumId: 1,
        id: 1,
        title: 'updatedPhoto',
        url: 'https://via.placeholder.com/600/updated',
        thumbnailUrl: 'https://via.placeholder.com/150/updated',
      };

      const response = await chakram.put(api.url('photos/1'), updatedPhoto);
      expect(response).to.have.status(200);

      const photo = await chakram.get(api.url('photos/1'));
      expect(photo).to.have.json('data', data => {
        expect(data.albumId).to.equal(updatedPhoto.albumId);
        expect(data.id).to.equal(updatedPhoto.id);
        expect(data.title).to.equal(updatedPhoto.title);
        expect(data.url).to.equal(updatedPhoto.url);
        expect(data.thumbnailUrl).to.equal(updatedPhoto.thumbnailUrl);
      });
    });

    it('should throw error if the photo does not exist', async () => {
      const response = await chakram.put(api.url('photos/5001'), {
        albumId: 102,
        id: 6000,
        title: 'nonexistentPhoto',
        url: 'https://via.placeholder.com/600/nonexistent',
        thumbnailUrl: 'https://via.placeholder.com/150/nonexistent',
      });
      expect(response).to.have.status(200);
    });
  });

  describe('Delete', () => {
    it('should delete photo by ID', async () => {
      const response = await chakram.delete(api.url('photos/500'));
      expect(response).to.have.status(200);

      const photo = await chakram.get(api.url('photos/500'));
      expect(photo).to.have.status(404);
    });

    it('should throw error if the photo does not exist', async () => {
      const response = await chakram.delete(api.url('photos/500'));
      expect(response).to.have.status(404);
    });
  });

  after(async () => {
    if (addedId) {
      await chakram.delete(api.url('photos/' + addedId));
    }
  });
});
