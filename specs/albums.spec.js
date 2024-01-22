'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Albums', () => {
    describe('Create', () => {
        it('should add a new album', async () => {
            const newAlbum = {
                userId: 1,
                id: 110,
                title: 'New Album 1'
            };

            const response = await chakram.post(api.url('albums'), newAlbum);
            expect(response).to.have.status(201);
        });

        it('should add a new album', async () => {
            const newAlbum = {
                userId: 2,
                id: 16,
                title: 'New Album 2'
            };

            const response = await chakram.post(api.url('albums'), newAlbum);
            expect(response).to.have.status(500);
        });

        it('should not add a new album with existing ID', async () => {
            const existingAlbum = data.albums[0];

            const response = await chakram.post(api.url('albums'), existingAlbum);
            expect(response).to.have.status(500);
        });
    });

    describe('Read', () => {
        it('should have albums', async () => {
            const response = await chakram.get(api.url('albums'));
            expect(response).to.have.status(200);
        });

        it('should return an album by ID', async () => {
            const albumId = 1;
            const response = await chakram.get(api.url(`albums/${albumId}`));
            expect(response).to.have.status(200);
        });

        it('should not return album for invalid ID', async () => {
            const invalidAlbumId = 999;
            const response = await chakram.get(api.url(`albums/${invalidAlbumId}`));
            expect(response).to.have.status(404);
        });
    });

    describe('Update', () => {
        it('should update existing album with given data', async () => {
            const albumId = 1;
            const updatedAlbum = {
                userId: 1,
                title: 'Updated Album'
            };

            const response = await chakram.put(api.url(`albums/${albumId}`), updatedAlbum);
            expect(response).to.have.status(200);
        });

        it('should throw error if the album does not exist', async () => {
            const nonExistingAlbumId = 999;
            const updatedAlbum = {
                userId: 1,
                title: 'Updated Album'
            };

            const response = await chakram.put(api.url(`albums/${nonExistingAlbumId}`), updatedAlbum);
            expect(response).to.have.status(404);
        });
    });

    describe('Delete', () => {
        it('should delete album by ID', async () => {
            const albumId = 1;
            const response = await chakram.delete(api.url(`albums/${albumId}`));
            expect(response).to.have.status(200);
        });

        it('should throw error if the album does not exist', async () => {
            const nonExistingAlbumId = 999;
            const response = await chakram.delete(api.url(`albums/${nonExistingAlbumId}`));
            expect(response).to.have.status(404);
        });
    });
});
