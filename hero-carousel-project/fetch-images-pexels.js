const https = require('https');
const fs = require('fs');
const path = require('path');

// To use this script:
// 1. Get a free API key from https://www.pexels.com/api/
// 2. Set environment variable: export PEXELS_API_KEY="your-key-here"
// 3. Run: node fetch-images-pexels.js

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: PEXELS_API_KEY environment variable not set');
  console.log('\nTo use this script:');
  console.log('1. Get a free API key from https://www.pexels.com/api/');
  console.log('2. Set environment variable: export PEXELS_API_KEY="your-key-here"');
  console.log('3. Run: node fetch-images-pexels.js\n');
  process.exit(1);
}

// Event images configuration
const eventImages = [
  {
    filename: 'assets/images/events/luminary-tour.jpg',
    query: 'concert stage lighting indie music',
    description: 'The Luminary Tour 2025'
  },
  {
    filename: 'assets/images/events/championship-hockey.jpg',
    query: 'ice hockey goalie action',
    description: 'Championship Hockey Night'
  },
  {
    filename: 'assets/images/events/late-night-comedy.jpg',
    query: 'stand up comedian stage',
    description: 'Comedy Live: Late Night Laughs'
  },
  {
    filename: 'assets/images/events/fall-indie-fest.jpg',
    query: 'outdoor music festival autumn',
    description: 'Fall Indie Fest 2025'
  },
  {
    filename: 'assets/images/events/pro-basketball-showdown.jpg',
    query: 'basketball game arena',
    description: 'Pro Basketball Showdown'
  },
  {
    filename: 'assets/images/events/symphony-modern-classics.jpg',
    query: 'orchestra symphony performance',
    description: 'Symphony Nights: Modern Classics'
  }
];

// Hero carousel images
const heroImages = [
  {
    filename: 'assets/images/hero/image1.jpg',
    query: 'concert crowd stage lights',
    description: 'Hero Slide 1'
  },
  {
    filename: 'assets/images/hero/image2.jpg',
    query: 'sports stadium arena',
    description: 'Hero Slide 2'
  },
  {
    filename: 'assets/images/hero/image3.jpg',
    query: 'theater performance stage',
    description: 'Hero Slide 3'
  }
];

const allImages = [...eventImages, ...heroImages];

function searchPexels(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      headers: {
        'Authorization': API_KEY
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          if (json.photos && json.photos.length > 0) {
            resolve(json.photos[0].src.large);
          } else {
            reject(new Error('No photos found'));
          }
        } else {
          reject(new Error(`API returned ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function fetchAndSaveImage(config) {
  try {
    console.log(`Fetching: ${config.description}...`);

    // Search for image
    const imageUrl = await searchPexels(config.query);
    console.log(`  Found: ${imageUrl}`);

    // Download image
    const imageBuffer = await downloadImage(imageUrl);

    // Ensure directory exists
    const dir = path.dirname(config.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(config.filename, imageBuffer);
    console.log(`✓ Saved: ${config.filename}\n`);

    // Delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`✗ Failed to fetch ${config.description}:`, error.message, '\n');
  }
}

async function downloadAll() {
  console.log(`Starting download of ${allImages.length} images...\n`);

  for (const config of allImages) {
    await fetchAndSaveImage(config);
  }

  console.log('✓ All images processed!');
  console.log('\nNext step: Update HTML to change .svg extensions to .jpg');
}

downloadAll();
