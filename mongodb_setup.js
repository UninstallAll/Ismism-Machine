import { MongoClient } from 'mongodb';

async function setupDatabase() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ismism_machine_db');
    
    await db.createCollection('users');
    console.log('Created users collection');
    
    await db.createCollection('projects');
    console.log('Created projects collection');
    
    await db.createCollection('items');
    console.log('Created items collection');

    const admin = await db.command({
      createUser: 'ismism_admin',
      pwd: 'secure_password',
      roles: [{ role: 'readWrite', db: 'ismism_machine_db' }]
    });
    console.log('Created admin user');

    return 'Database setup completed!';
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

setupDatabase()
  .then(console.log)
  .catch(console.error); 