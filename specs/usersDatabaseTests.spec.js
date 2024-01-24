'use strict';

const { MongoClient } = require('mongodb');
const { expect } = require('chai');
const data = require('../server/data.json');

describe('Users', () => {
    let db;

    before(async () => {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        db = client.db('webAPINoSQL');
    });

    after(async () => {
        // Close the MongoDB connection
        if (db) {
            const client = db.client;
            await client.close();
        }
    });

    describe('Create', () => {
        let addedId;

        it('should add a new user', async () => {
            const userCollection = db.collection('users');
            const newUser = {
                id: 11,
                name: 'newName',
                username: 'username',
                email: 'newname@gmail.com',
            };
        
            try {
                const result = await userCollection.insertOne(newUser);
                console.log(`A document was inserted with the _id: ${result.insertedId}`);
                
                expect(result.insertedId).to.exist;
                addedId = result.insertedId;
        
                const user = await userCollection.findOne({ _id: addedId });
                expect(user).to.exist;
                expect(user.id).to.equal(newUser.id);
                expect(user.name).to.equal(newUser.name);
                expect(user.username).to.equal(newUser.username);
                expect(user.email).to.equal(newUser.email);
            } catch (error) {
                console.error('Error during user insertion:', error);
            }      
        });

        it('should not add a new user with an existing ID', async () => {
            const userCollection = db.collection('users');
            const duplicateUser = {
                id: 2,
                name: 'newNames',
                email: 'email@address.com',
                userId: 1,
            };
        
            // Check if a user with the same ID already exists
            const existingUser = await userCollection.findOne({ id: duplicateUser.id });
        
            if (!existingUser) {
                // Insert the user only if it doesn't already exist
                try {
                    await userCollection.insertOne(duplicateUser);
                } catch (error) {
                    // Check if the error is a duplicate key error
                    expect(error.code).to.equal(11000); // Duplicate key error
                }
            } else {
                // Handle the case where the user with the same ID already exists
                // You can add appropriate assertions or log a message here
            }
        });

        after(async () => {
            if (addedId) {
                const userCollection = db.collection('users');
                await userCollection.deleteOne({ _id: addedId });
            }
        });
        
    });

    describe('Read', () => {
        it('should have users', async () => {
            const userCollection = db.collection('users');
            const users = await userCollection.find({}).toArray();

            expect(users).to.be.an('array');
            expect(users).to.have.length.above(0);
        });

        it('should return a user by ID', async () => {
            const userCollection = db.collection('users');
            const expectedUser = data.users[5];

            const user = await userCollection.findOne({ id: expectedUser.id });

            expect(user).to.exist;
            expect(user.id).to.equal(expectedUser.id);
            expect(user.name).to.equal(expectedUser.name);
            expect(user.username).to.equal(expectedUser.username);
            expect(user.email).to.equal(expectedUser.email);
        });

        it('should not return a user for an invalid ID', async () => {
            const userCollection = db.collection('users');
            const invalidUserId = 'nonexistent-user-id';

            const user = await userCollection.findOne({ id: invalidUserId });

            expect(user).to.be.null;
        });
    });

    describe('Update', () => {
        it('should update an existing user with given data', async () => {
            const userCollection = db.collection('users');
            const existingUser = data.users[3];
            const updatedData = {
                name: 'updatedName',
                email: 'updated@email.com',
            };

            const result = await userCollection.updateOne({ id: existingUser.id }, { $set: updatedData });

            const updatedUser = await userCollection.findOne({ id: existingUser.id });
            expect(updatedUser).to.exist;
            expect(updatedUser.name).to.equal(updatedData.name);
            expect(updatedUser.email).to.equal(updatedData.email);
        });

        it('should throw an error if the user does not exist', async () => {
            const userCollection = db.collection('users'); // Replace with your collection name
            const nonExistentUserId = 'nonexistent-user-id'; // Replace with a non-existent user ID
            const updatedData = {
                name: 'updatedName',
                email: 'updated@email.com',
            };

            const result = await userCollection.updateOne({ id: nonExistentUserId }, { $set: updatedData });

            expect(result.matchedCount).to.equal(0);
            expect(result.modifiedCount).to.equal(0);
        });
    });

    describe('Delete', () => {
        it('should delete a user by ID', async () => {
            const userCollection = db.collection('users'); // Replace with your collection name
            const userToDelete = data.users[0]; // Replace with a user to delete

            const result = await userCollection.deleteOne({ id: userToDelete.id });

            const deletedUser = await userCollection.findOne({ id: userToDelete.id });
            expect(deletedUser).to.be.null;
        });

        it('should throw an error if the user does not exist', async () => {
            const userCollection = db.collection('users'); // Replace with your collection name
            const nonExistentUserId = 'nonexistent-user-id'; // Replace with a non-existent user ID

            const result = await userCollection.deleteOne({ id: nonExistentUserId });

            expect(result.deletedCount).to.equal(0);
        });
    });
});
