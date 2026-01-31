require('reflect-metadata');
const { DataSource } = require('typeorm');
const Usuario = require('./models/usuario');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Tag = require('./models/Tag');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './database.sqlite',
  entities: [Usuario, Product, Category, Tag, Order, OrderItem],
  synchronize: true,
  logging: false,
});

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

async function updateImageUrls() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
    console.log('🔄 Actualizando URLs de imágenes...\n');

    const gameRepository = AppDataSource.getRepository('Game');

    for (const [slug, imageUrl] of Object.entries(imageMapping)) {
      await gameRepository.update({ slug }, { imageUrl });
      console.log(`✅ ${slug} → ${imageUrl}`);
    }

    console.log('\n✨ ¡URLs de imágenes actualizadas exitosamente!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateImageUrls();
