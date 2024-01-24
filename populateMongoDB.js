const { MongoClient } = require('mongodb');
const data = require('./server/data.json');

const url = 'mongodb://localhost:27017';
const dbName = 'webAPINoSQL';

async function populateMongoDB() {
  try {
    const client = new MongoClient(url);
    await client.connect();

    const db = client.db(dbName);

    const albumsCollection = db.collection('albums');
    await albumsCollection.insertMany(data.albums);

    const usersCollection = db.collection('users');
    await usersCollection.insertMany(data.users);

    console.log('Data successfully imported into MongoDB.');

    client.close();
  } catch (err) {
    console.error('Error importing data into MongoDB:', err);
  }
}

populateMongoDB();
