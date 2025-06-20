import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

/**
 * Parses art movements from Contemporary-Art-Criticism-EN.txt file
 * and seeds them to MongoDB database
 */
async function seedArtMovements() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ismism_machine_db');
    const collection = db.collection('artmovements');
    
    // Read the Contemporary-Art-Criticism-EN.txt file
    const filePath = path.join(process.cwd(), 'TTTEXTTT', 'Contemporary-Art-Criticism-EN.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Split content by paragraphs (each paragraph is a movement)
    const movementParagraphs = fileContent.split('\n').filter(paragraph => paragraph.trim().length > 0);
    
    // Process and extract data for each movement
    const artMovements = movementParagraphs.map(paragraph => {
      // Extract name (first part before colon)
      const colonIndex = paragraph.indexOf(':');
      if (colonIndex === -1) return null; // Skip if no proper format
      
      const name = paragraph.substring(0, colonIndex).trim();
      const fullText = paragraph.trim();
      
      // Extract description (full text for now)
      const description = paragraph.substring(colonIndex + 1).trim();
      
      // Extract theoretical foundation
      let theoreticalFoundation = '';
      const tfPattern = /The theoretical foundation merges ([^,]+(,\s*[^,]+)*),\s*forming a (framework|unique perspective|theoretical system)/i;
      const tfMatch = fullText.match(tfPattern);
      if (tfMatch) {
        theoreticalFoundation = tfMatch[0];
      }
      
      // Extract representative artists and works
      let representativeArtists = [];
      const artistPattern = /Representative (artists|works|projects) include ([^\.]+)/i;
      const artistMatch = fullText.match(artistPattern);
      if (artistMatch && artistMatch[2]) {
        const artistsText = artistMatch[2];
        // Try to identify individual artists and their works
        if (artistsText.includes("'s")) {
          // Format: "Artist's work, Another artist's other work"
          const artistWorkPairs = artistsText.split(', ');
          const artistMap = {};
          
          artistWorkPairs.forEach(pair => {
            const apostropheIndex = pair.indexOf("'s");
            if (apostropheIndex !== -1) {
              const artistName = pair.substring(0, apostropheIndex).trim();
              const work = pair.substring(apostropheIndex + 2).trim();
              
              if (!artistMap[artistName]) {
                artistMap[artistName] = [];
              }
              artistMap[artistName].push(work);
            }
          });
          
          representativeArtists = Object.keys(artistMap).map(name => ({
            name,
            works: artistMap[name]
          }));
        } else {
          // Just list the examples as works without specific artists
          const examples = artistsText.split(', ').map(ex => ex.trim());
          representativeArtists = [{
            name: 'Various Artists',
            works: examples
          }];
        }
      }
      
      // Extract forms/mediums
      let forms = '';
      const formsPatterns = [
        /Common forms include ([^\.]+)/i,
        /Representative works include ([^\.]+)/i,
        /Representative projects include ([^\.]+)/i,
        /These works often ([^\.]+)/i
      ];
      
      for (const pattern of formsPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          forms = match[0];
          break;
        }
      }
      
      // Extract characteristics
      const characteristics = [];
      const characteristicPatterns = [
        /works often (exhibit|feature|employ|have) ([^\.]+)/i,
        /often (exhibit|feature|employ|have) ([^\.]+)/i,
        /characterized by ([^\.]+)/i
      ];
      
      for (const pattern of characteristicPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          characteristics.push(match[0]);
        }
      }
      
      // Extract context or period if mentioned
      let context = '';
      const contextPatterns = [
        /In the (context|era|age|post-|backdrop) of ([^,]+)/i,
        /In response to ([^,]+)/i,
        /Against the backdrop of ([^,]+)/i,
        /Within the framework of ([^,]+)/i
      ];
      
      for (const pattern of contextPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          context = match[0];
          break;
        }
      }
      
      // Generate meaningful tags
      const commonWords = ['the', 'and', 'that', 'with', 'for', 'this', 'from'];
      const significantTerms = fullText
        .replace(/[^\w\s]/gi, ' ')  // Remove punctuation
        .split(/\s+/)              // Split by whitespace
        .filter(word => word.length > 3)  // Only significant words
        .filter(word => !commonWords.includes(word.toLowerCase()))  // Remove common words
        .map(word => word.toLowerCase());
      
      // Get unique tags
      const tags = [...new Set(significantTerms)].slice(0, 15); // Limit to 15 tags
      
      // Create the art movement object
      return {
        name,
        description,
        theoretical_foundation: theoreticalFoundation,
        forms,
        representative_artists: representativeArtists,
        characteristics,
        context,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }).filter(movement => movement !== null); // Remove any null entries
    
    // Remove any existing data in the collection
    await collection.deleteMany({});
    console.log('Cleared existing art movements data');
    
    // Insert the new art movements
    const result = await collection.insertMany(artMovements);
    console.log(`Successfully inserted ${result.insertedCount} art movements`);
    
    // Print the list of inserted movements
    console.log('\nArt Movements seeded to database:');
    artMovements.forEach((movement, index) => {
      console.log(`${index + 1}. ${movement.name}`);
    });
    
  } catch (err) {
    console.error('Error seeding art movements:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the seeding function
seedArtMovements().catch(console.error); 