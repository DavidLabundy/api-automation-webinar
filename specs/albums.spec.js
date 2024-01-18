'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Albums API Tests', () => {
    describe('Create', () => {
        it('should add a new album', () => {
            const newAlbum = {
                userId: 1,
                id: 110,
                title: 'New Album 1'
            };

            const response = chakram.post(api.url('albums'), newAlbum);
            return expect(response).to.have.status(201);
        });

        it('should add a new album', () => {
            const newAlbum = {
                userId: 2,
                id: 16,
                title: 'New Album 2'
            };

            const response = chakram.post(api.url('albums'), newAlbum);
            return expect(response).to.have.status(500);
        });

        it('should not add a new album with existing ID', () => {
            const existingAlbum = data.albums[0];

            const response = chakram.post(api.url('albums'), existingAlbum);
            return expect(response).to.have.status(500);
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
        it('should update existing album with given data', () => {
            const albumId = 1;
            const updatedAlbum = {
                userId: 1,
                title: 'Updated Album'
            };

            const response = chakram.put(api.url(`albums/${albumId}`), updatedAlbum);
            return expect(response).to.have.status(200);
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
        it('should delete album by ID', () => {
            const albumId = 1;
            const response = chakram.delete(api.url(`albums/${albumId}`));
            return expect(response).to.have.status(200);
        });

        it('should throw error if the album does not exist', () => {
            const nonExistingAlbumId = 999;
            const response = chakram.delete(api.url(`albums/${nonExistingAlbumId}`));
            return expect(response).to.have.status(404);
        });
    });
});
