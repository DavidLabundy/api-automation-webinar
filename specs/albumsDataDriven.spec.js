'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Albums', () => {
  const albumsTestData = [
    {
      id: 110,
      userId: 1,
      title: 'new added album',
    },
    {
      id: 16,
      userId: 2,
      title: 'voluptatem aut maxime inventore autem magnam atque repellat',
    },
  ];

  let addedId;

  describe('Create', () => {
    albumsTestData.forEach((albumData, index) => {
        it(`should add a new album - Test Case ${index + 1}`, () => {
            return chakram
              .post(api.url('albums'), albumData)
              .then((response) => {
                expect(response.response.statusCode).to.equal(500);
                expect(response.body.data && response.body.data.id).to.be.defined;
          
                addedId = response.body.data.id;
          
                // Additional assertions for the created album
                const todo = chakram.get(api.url('albums/' + addedId));
                expect(todo).to.have.status(200);
                expect(todo).to.have.json('data.userId', albumData.userId);
                expect(todo).to.have.json('data.id', albumData.id);
                expect(todo).to.have.json('data.title', albumData.title);
          
                return chakram.wait();
              });
          });
    });

    it('should not add a new album with existing ID', () => {
      const response = chakram.post(api.url('albums'), albumsTestData[1]);
      expect(response).to.have.status(500);
      return chakram.wait();
    });

    after(() => {
      if (addedId) {
        return chakram.delete(api.url('albums/' + addedId));
      }
    });
  });

  describe('Read', () => {
    it('should have albums', () => {
      const response = chakram.get(api.url('albums'));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', data => {
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.be.greaterThan(0);
      });
      return chakram.wait();
    });

    it('should return an album by ID', () => {
      const expectedAlbum = data.albums[0];

      const response = chakram.get(api.url('albums/' + expectedAlbum.id));
      expect(response).to.have.status(200);
      expect(response).to.have.json('data', album => {
        expect(album).to.be.defined;
        expect(album.userId).to.equal(expectedAlbum.userId);
        expect(album.id).to.equal(expectedAlbum.id);
        expect(album.title).to.equal(expectedAlbum.title);
      });
      return chakram.wait();
    });

    it('should not return album for invalid ID', () => {
      const response = chakram.get(api.url('albums/no-id-like-this'));
      return expect(response).to.have.status(404);
    });
  });

  describe('Update', () => {
    it('should update existing album with given data', () => {
      const response = chakram.put(api.url('albums/30'), {
        userId: 3,
        id: 30,
        title: 'updated title',
      });
      expect(response).to.have.status(200);
      return response.then((data) => {
        const todo = chakram.get(api.url('albums/30'));
        expect(todo).to.have.json('data', data => {
          expect(data.userId).to.equal(3);
          expect(data.id).to.equal(30);
          expect(data.title).to.equal('updated title');
        });
        return chakram.wait();
      });
    });

    it('should throw an error if the album does not exist', () => {
      const response = chakram.put(api.url('albums/333'), {
        userId: 1,
        id: 333,
        title: 'not existing album',
      });
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });

  describe('Delete', () => {
    it('should delete album by ID', () => {
      const response = chakram.delete(api.url('albums/90'));
      expect(response).to.have.status(200);
      return response.then(data => {
        const user = chakram.get(api.url('albums/90'));
        expect(user).to.have.status(404);
        return chakram.wait();
      });
    });

    it('should throw an error if the album does not exist', () => {
      const response = chakram.delete(api.url('albums/90'));
      expect(response).to.have.status(404);
      return chakram.wait();
    });
  });
});
