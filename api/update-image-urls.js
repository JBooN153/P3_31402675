const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

// Mapeo de slugs a nombres de archivos locales
const imageMapping = {
  'god-of-war-ragnarok': '/images/games/god-of-war-ragnarok.jpg',
  'elden-ring': '/images/games/elden-ring.jpg',
  'spiderman-miles-morales': '/images/games/spiderman-miles-morales.jpg',
  'horizon-forbidden-west': '/images/games/horizon-forbidden-west.jpg',
  'final-fantasy-vii-remake': '/images/games/final-fantasy-vii.jpg',
  'the-last-of-us-part-ii': '/images/games/the-last-of-us-part-ii.jpg',
  'bloodborne': '/images/games/bloodborne.jpg',
  'resident-evil-village': '/images/games/resident-evil-village.jpg',
  'ghost-of-tsushima': '/images/games/ghost-of-tsushima.jpg',
  'uncharted-4': '/images/games/uncharted-4.jpg',
  'ratchet-clank': '/images/games/ratchet-clank.jpg',
  'sackboy': '/images/games/sackboy.jpg'
};

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
    process.exit(1);
  }

  console.log('🔄 Actualizando URLs de imágenes en la base de datos...\n');

  try {
    for (const [slug, imageUrl] of Object.entries(imageMapping)) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE games SET imageUrl = ? WHERE slug = ?',
          [imageUrl, slug],
          function(err) {
            if (err) {
              console.error(`❌ Error actualizando ${slug}:`, err);
              reject(err);
            } else {
              console.log(`✅ ${slug} → ${imageUrl}`);
              resolve();
            }
          }
        );
      });
    }

    console.log('\n✨ ¡URLs de imágenes actualizadas exitosamente!');
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    db.close();
    process.exit(1);
  }
});
