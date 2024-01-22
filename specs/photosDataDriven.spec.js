'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

describe('Photos Data Driven Tests', () => {
    const selectedPhotos = [data.photos[0], data.photos[1]];

    const newPhotoData = {
        albumId: 1,
        title: 'New Photo',
        url: 'https://via.placeholder.com/600/new',
        thumbnailUrl: 'https://via.placeholder.com/150/new'
    };

    let newPhotoId;

    describe('Create', () => {
        it('should add a new photo', async () => {
            const response = await chakram.post(api.url('photos'), newPhotoData);
            expect(response).to.have.status(201);
            newPhotoId = response.body.data.id;
        });
    });

    describe('Read', () => {
        selectedPhotos.forEach((photo, index) => {
            it(`should return photo ${index + 1} by ID`, async () => {
                const response = await chakram.get(api.url(`photos/${photo.id}`));
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Update', () => {
        selectedPhotos.forEach((photo, index) => {
            it(`should update photo ${index + 1} with given data`, async () => {
                const updatedPhoto = { ...photo, title: 'Updated ' + photo.title };
                const response = await chakram.put(api.url(`photos/${photo.id}`), updatedPhoto);
                expect(response).to.have.status(200);
            });
        });
    });

    describe('Delete', () => {
        it('should delete the newly added photo', async () => {
            const deleteResponse = await chakram.delete(api.url(`photos/${newPhotoId}`));
            expect(deleteResponse).to.have.status(200);

            const getResponse = await chakram.get(api.url(`photos/${newPhotoId}`));
            expect(getResponse).to.have.status(404);
        });
    });
});
