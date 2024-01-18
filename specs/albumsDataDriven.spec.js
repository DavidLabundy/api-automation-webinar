'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');

describe.only('Albums API Tests', () => {
  describe('Create', () => {
    it('should add a new album 1', () => {
        const newAlbum = {
            userId: 1,
            id: 110,
            title: 'New Album 1'
        };

        const response = chakram.post(api.url('albums'), newAlbum);
        return expect(response).to.have.status(201);
    });

    it('should add a new album 2', () => {
        const newAlbum = {
            userId: 2,
            id: 16,
            title: 'New Album 2'
        };

        const response = chakram.post(api.url('albums'), newAlbum);
        return expect(response).to.have.status(500); // Adjust the expected status code if needed
    });

    it('should not add a new album with existing ID', () => {
        const existingAlbum = {
            userId: 1,
            id: 110,
            title: 'Existing Album'
        };

        const response = chakram.post(api.url('albums'), existingAlbum);
        return expect(response).to.have.status(500); // Adjust the expected status code if needed
    });
});

    describe('Read', () => {
        it('should have albums', () => {
            const response = chakram.get(api.url('albums'));
            return expect(response).to.have.status(200);
        });

        it('should return an album by ID', () => {
            const albumId = 1;
            const response = chakram.get(api.url(`albums/${albumId}`));
            return expect(response).to.have.status(200);
        });

        it('should not return album for invalid ID', () => {
            const invalidAlbumId = 999;
            const response = chakram.get(api.url(`albums/${invalidAlbumId}`));
            return expect(response).to.have.status(404);
        });
    });

    describe('Update', () => {
        const albumsToUpdateData = [
            {
                albumId: 1,
                updatedAlbum: {
                    userId: 1,
                    title: 'Updated Album 1'
                }
            },
            {
                albumId: 2,
                updatedAlbum: {
                    userId: 2,
                    title: 'Updated Album 2'
                }
            },
        ];

        albumsToUpdateData.forEach(({ albumId, updatedAlbum }, index) => {
            it(`should update existing album ${index + 1} with given data`, () => {
                const response = chakram.put(api.url(`albums/${albumId}`), updatedAlbum);
                return expect(response).to.have.status(200);
            });
        });

        it('should throw error if the album does not exist', () => {
            const nonExistingAlbumId = 999;
            const updatedAlbum = {
                userId: 1,
                title: 'Updated Album'
            };

            const response = chakram.put(api.url(`albums/${nonExistingAlbumId}`), updatedAlbum);
            return expect(response).to.have.status(404);
        });
    });

    describe('Delete', () => {
        const albumsToDeleteData = [
            {
                albumId: 1
            },
            {
                albumId: 2
            },
        ];

        albumsToDeleteData.forEach(({ albumId }, index) => {
            it(`should delete album ${index + 1} by ID`, () => {
                const response = chakram.delete(api.url(`albums/${albumId}`));
                return expect(response).to.have.status(200);
            });
        });

        it('should throw error if the album does not exist', () => {
            const nonExistingAlbumId = 999;
            const response = chakram.delete(api.url(`albums/${nonExistingAlbumId}`));
            return expect(response).to.have.status(404);
        });
    });
});
