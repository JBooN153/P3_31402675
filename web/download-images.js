import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de juegos con URLs de imágenes de alta calidad
const gameImages = {
  'god-of-war-ragnarok': {
    url: 'https://images.unsplash.com/photo-1545349293-03e76f5fb5b4?w=400&h=600&fit=crop',
    filename: 'god-of-war-ragnarok.jpg'
  },
  'elden-ring': {
    url: 'https://images.unsplash.com/photo-1538481143235-a9d929624220?w=400&h=600&fit=crop',
    filename: 'elden-ring.jpg'
  },
  'spiderman-miles-morales': {
    url: 'https://images.unsplash.com/photo-1578282055871-ce772257ac6e?w=400&h=600&fit=crop',
    filename: 'spiderman-miles-morales.jpg'
  },
  'horizon-forbidden-west': {
    url: 'https://images.unsplash.com/photo-1566024215671-d3e2ff68ff73?w=400&h=600&fit=crop',
    filename: 'horizon-forbidden-west.jpg'
  },
  'final-fantasy-vii-remake': {
    url: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8b228?w=400&h=600&fit=crop',
    filename: 'final-fantasy-vii.jpg'
  },
  'the-last-of-us-part-ii': {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
    filename: 'the-last-of-us-part-ii.jpg'
  },
  'bloodborne': {
    url: 'https://images.unsplash.com/photo-1552805881-82a6b0c2db34?w=400&h=600&fit=crop',
    filename: 'bloodborne.jpg'
  },
  'resident-evil-village': {
    url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65b?w=400&h=600&fit=crop',
    filename: 'resident-evil-village.jpg'
  },
  'ghost-of-tsushima': {
    url: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=400&h=600&fit=crop',
    filename: 'ghost-of-tsushima.jpg'
  },
  'uncharted-4-a-thiefs-end': {
    url: 'https://images.unsplash.com/photo-1552159740-1ff1c35167b7?w=400&h=600&fit=crop',
    filename: 'uncharted-4.jpg'
  },
  'ratchet-and-clank': {
    url: 'https://images.unsplash.com/photo-1578282055871-ce772257ac6e?w=400&h=600&fit=crop',
    filename: 'ratchet-clank.jpg'
  },
  'sackboy-a-big-adventure': {
    url: 'https://images.unsplash.com/photo-1513381794177-d06c78d62a7d?w=400&h=600&fit=crop',
    filename: 'sackboy.jpg'
  }
};

const downloadDir = path.join(__dirname, '../public/images/games');

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(downloadDir, filename);
    
    // Crear stream de escritura
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ ${filename} descargada`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Eliminar archivo si hay error
      reject(err);
    });
  });
}

async function downloadAllImages() {
  try {
    console.log('📥 Descargando imágenes de juegos...\n');
    
    // Crear directorio si no existe
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    const downloads = Object.entries(gameImages).map(([slug, data]) =>
      downloadImage(data.url, data.filename)
    );
    
    await Promise.all(downloads);
    
    console.log('\n✨ ¡Todas las imágenes descargadas exitosamente!');
    console.log(`📁 Ubicación: ${downloadDir}`);
    
  } catch (error) {
    console.error('❌ Error descargando imágenes:', error);
    process.exit(1);
  }
}

downloadAllImages();
