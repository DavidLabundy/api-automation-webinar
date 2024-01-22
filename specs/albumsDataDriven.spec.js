'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Albums Data Driven Tests', () => {
    const selectedAlbums = [data.albums[0], data.albums[1]];

    const newAlbumData = {
        userId: 1,
        title: 'New Album'
    };

    let newAlbumId;

    describe('Create', () => {
        it('should add a new album', async () => {
            const response = await chakram.post(api.url('albums'), newAlbumData);
            expect(response).to.have.status(201);
            newAlbumId = response.body.data.id;
        });
    });

    describe('Read', () => {
        selectedAlbums.forEach((album, index) => {
            it(`should return album ${index + 1} by ID`, async () => {
                const response = await chakram.get(api.url(`albums/${album.id}`));
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Update', () => {
        selectedAlbums.forEach((album, index) => {
            it(`should update album ${index + 1} with given data`, async () => {
                const updatedAlbum = { ...album, title: 'Updated ' + album.title };
                const response = await chakram.put(api.url(`albums/${album.id}`), updatedAlbum);
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Delete', () => {
        it('should delete the newly added album', async () => {
            const deleteResponse = await chakram.delete(api.url(`albums/${newAlbumId}`));
            expect(deleteResponse).to.have.status(200);

            const getResponse = await chakram.get(api.url(`albums/${newAlbumId}`));
            expect(getResponse).to.have.status(404);
        });
    });
});
