'use strict';

const { MongoClient } = require('mongodb');
const { expect } = require('chai');
const data = require('../server/data.json');

describe.only('Albums', () => {
    let db;

    before(async () => {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        db = client.db('webAPINoSQL');
    });

    after(async () => {
        if (db) {
            const client = db.client;
            await client.close();
        }
    });

    describe('Create', () => {
        let newAlbumId;
        const newAlbumData = {
            userId: 2,
            title: 'voluptas rerum iure ut enim'
        };

        it('should add a new album', async () => {
            const albumCollection = db.collection('albums');
            const result = await albumCollection.insertOne(newAlbumData);

            expect(result.insertedId).to.exist;
            newAlbumId = result.insertedId;
        });

        after(async () => {
            if (newAlbumId) {
                const albumCollection = db.collection('albums');
                await albumCollection.deleteOne({ _id: newAlbumId });
            }
        });
    });

    describe('Read', () => {
        it('should return the specific album by ID', async () => {
            const albumCollection = db.collection('albums');
            const expectedAlbum = data.albums.find(album => album.id === 30);

            const album = await albumCollection.findOne({ id: expectedAlbum.id });

            expect(album).to.exist;
            expect(album.id).to.equal(expectedAlbum.id);
            expect(album.userId).to.equal(expectedAlbum.userId);
            expect(album.title).to.equal(expectedAlbum.title);
        });
    });

    describe('Update', () => {
        it('should update a specific album with given data', async () => {
            const albumCollection = db.collection('albums');
            const albumToUpdate = data.albums.find(album => album.id === 21);
            const updatedData = {
                title: 'Updated Title'
            };

            const result = await albumCollection.updateOne({ id: albumToUpdate.id }, { $set: updatedData });

            const updatedAlbum = await albumCollection.findOne({ id: albumToUpdate.id });
            expect(updatedAlbum.title).to.equal(updatedData.title);
        });
    });

    describe('Delete', () => {
        let albumToRestore;

        before(async () => {
            // Fetch or set up the album to delete
            albumToRestore = data.albums.find(album => album.id === 27);
        });
    
        it('should delete a specific album by ID', async () => {
            const albumCollection = db.collection('albums');
            const albumToDelete = data.albums.find(album => album.id === 27);
            const result = await albumCollection.deleteOne({ id: albumToDelete.id });

            const deletedAlbum = await albumCollection.findOne({ id: albumToDelete.id });
            expect(deletedAlbum).to.be.null;
        });

        after(async () => {
            // Reinsert the deleted album
            if (albumToRestore) {
                await db.collection('albums').insertOne(albumToRestore);
            }
        });
    });
});
