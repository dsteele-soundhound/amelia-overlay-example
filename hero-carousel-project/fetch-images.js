const https = require('https');
const fs = require('fs');
const path = require('path');

// Event images configuration based on HTML data-prompt attributes
const eventImages = [
  {
    filename: 'assets/images/events/luminary-tour.jpg',
    query: 'concert stage lighting indie music performer teal amber',
    description: 'The Luminary Tour 2025'
  },
  {
    filename: 'assets/images/events/championship-hockey.jpg',
    query: 'professional ice hockey goalie action arena',
    description: 'Championship Hockey Night'
  },
  {
    filename: 'assets/images/events/late-night-comedy.jpg',
    query: 'stand up comedian stage spotlight club',
    description: 'Comedy Live: Late Night Laughs'
  },
  {
    filename: 'assets/images/events/fall-indie-fest.jpg',
    query: 'outdoor autumn music festival golden hour crowd',
    description: 'Fall Indie Fest 2025'
  },
  {
    filename: 'assets/images/events/pro-basketball-showdown.jpg',
    query: 'professional basketball game arena action players',
    description: 'Pro Basketball Showdown'
  },
  {
    filename: 'assets/images/events/symphony-modern-classics.jpg',
    query: 'symphony orchestra performance blue lighting concert hall',
    description: 'Symphony Nights: Modern Classics'
  }
];

// Hero carousel images
const heroImages = [
  {
    filename: 'assets/images/hero/image1.jpg',
    query: 'live concert crowd stage lights music festival',
    description: 'Hero Slide 1'
  },
  {
    filename: 'assets/images/hero/image2.jpg',
    query: 'sports stadium crowd arena event',
    description: 'Hero Slide 2'
  },
  {
    filename: 'assets/images/hero/image3.jpg',
    query: 'theater performance stage dramatic lighting',
    description: 'Hero Slide 3'
  }
];

const allImages = [...eventImages, ...heroImages];

// Unsplash API (no key required for public access)
function fetchUnsplashImage(query, orientation = 'landscape') {
  return new Promise((resolve, reject) => {
    const url = `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;

    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        https.get(res.headers.location, (imgRes) => {
          if (imgRes.statusCode === 200) {
            const chunks = [];
            imgRes.on('data', chunk => chunks.push(chunk));
            imgRes.on('end', () => resolve(Buffer.concat(chunks)));
            imgRes.on('error', reject);
          } else {
            reject(new Error(`Failed to fetch image: ${imgRes.statusCode}`));
          }
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      } else {
        reject(new Error(`Failed to fetch image: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadImage(config) {
  try {
    console.log(`Fetching: ${config.description}...`);
    const imageBuffer = await fetchUnsplashImage(config.query);

    // Ensure directory exists
    const dir = path.dirname(config.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(config.filename, imageBuffer);
    console.log(`✓ Saved: ${config.filename}`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`✗ Failed to fetch ${config.description}:`, error.message);
  }
}

async function downloadAll() {
  console.log(`Starting download of ${allImages.length} images...\n`);

  for (const config of allImages) {
    await downloadImage(config);
  }

  console.log('\n✓ All images downloaded!');
  console.log('\nNote: Update the HTML file to change .svg extensions to .jpg');
}

downloadAll();
