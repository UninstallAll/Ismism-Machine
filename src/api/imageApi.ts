import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017/ismism_machine_db';
const client = new MongoClient(uri);

export async function getImageById(imageId: string) {
  try {
    await client.connect();
    const db = client.db('ismism_machine_db');
    const collection = db.collection('images');
    
    const image = await collection.findOne({ _id: new ObjectId(imageId) });
    return image;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function getAllImages() {
  try {
    await client.connect();
    const db = client.db('ismism_machine_db');
    const collection = db.collection('images');
    
    const images = await collection.find({}).toArray();
    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function saveImage(imageData: any) {
  try {
    await client.connect();
    const db = client.db('ismism_machine_db');
    const collection = db.collection('images');
    
    const result = await collection.insertOne(imageData);
    return result;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  } finally {
    await client.close();
  }
} 