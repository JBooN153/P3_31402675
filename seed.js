const { AppDataSource } = require('./config/databaseConfig');

// Imágenes en base64 de juegos populares PS4 (usando placeholders)
const gameImages = {
  godOfWar: 'https://images.unsplash.com/photo-1538481143235-a9d929624220?w=500&h=750&fit=crop',
  elden: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=750&fit=crop',
  spiderman: 'https://images.unsplash.com/photo-1559332007-8cc4645dc641?w=500&h=750&fit=crop',
  horizon: 'https://images.unsplash.com/photo-1552159740-1ff1c35167b7?w=500&h=750&fit=crop',
  ff7: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=750&fit=crop',
  lastOfUs: 'https://images.unsplash.com/photo-1533807666529-e13e36c1e1fb?w=500&h=750&fit=crop',
  bloodborne: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&h=750&fit=crop',
  resident: 'https://images.unsplash.com/photo-1552805881-82a6b0c2db34?w=500&h=750&fit=crop',
  ghost: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8b228?w=500&h=750&fit=crop',
  uncharted: 'https://images.unsplash.com/photo-1538481143235-a9d929624220?w=500&h=750&fit=crop',
  ratchet: 'https://images.unsplash.com/photo-1559332007-8cc4645dc641?w=500&h=750&fit=crop',
  sackboy: 'https://images.unsplash.com/photo-1552159740-1ff1c35167b7?w=500&h=750&fit=crop',
};

const games = [
  {
    name: 'God of War Ragnarök',
    description: 'Fimbulwinter is upon us. Kratos and Atreus must journey to each of the Nine Realms in search of answers as Asgardian forces prepare a final battle that will end the world.',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2022-11-09',
    price: 69.99,
    stock: 25,
    genre: 'Action-Adventure',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'RAGNAROK-PS4-001',
    slug: 'god-of-war-ragnarok',
    imageUrl: gameImages.godOfWar,
  },
  {
    name: 'Elden Ring',
    description: 'Rise, Tarnished, and let grace guide you. Experience a vast world full of mystery and danger with a rich story and deep gameplay.',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    releaseDate: '2022-02-25',
    price: 59.99,
    stock: 30,
    genre: 'Action RPG',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'ELDENRING-PS4-001',
    slug: 'elden-ring',
    imageUrl: gameImages.elden,
  },
  {
    name: 'Marvel\'s Spider-Man: Miles Morales',
    description: 'Miles Morales takes the mantle of Spider-Man in this explosive new adventure, utilizing incredible, high-tech gear and explosive powers.',
    developer: 'Insomniac Games',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2020-11-12',
    price: 49.99,
    stock: 20,
    genre: 'Action-Adventure',
    platform: 'PS4',
    esrb: 'T (Teen)',
    sku: 'SPIDERMAN-MM-PS4',
    slug: 'spiderman-miles-morales',
    imageUrl: gameImages.spiderman,
  },
  {
    name: 'Horizon Forbidden West',
    description: 'Join Aloy as she ventures far into the Forbidden West to brave a majestic, but dangerous frontier where machines are the top predators.',
    developer: 'Guerrilla Games',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2022-02-18',
    price: 69.99,
    stock: 22,
    genre: 'Action RPG',
    platform: 'PS4',
    esrb: 'T (Teen)',
    sku: 'HORIZON-FW-PS4',
    slug: 'horizon-forbidden-west',
    imageUrl: gameImages.horizon,
  },
  {
    name: 'Final Fantasy VII Remake',
    description: 'The world has fallen under the control of the Shinra Electric Power Company. Join Cloud and his allies as they work to save the planet.',
    developer: 'Square Enix',
    publisher: 'Square Enix',
    releaseDate: '2020-04-10',
    price: 59.99,
    stock: 18,
    genre: 'RPG',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'FF7R-PS4-001',
    slug: 'final-fantasy-vii-remake',
    imageUrl: gameImages.ff7,
  },
  {
    name: 'The Last of Us Part II',
    description: 'Ellie embarks on a cross-country journey to find the woman responsible for the pandemic. A journey of vengeance and mercy.',
    developer: 'Naughty Dog',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2020-06-19',
    price: 49.99,
    stock: 15,
    genre: 'Action-Adventure',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'TLOU2-PS4-001',
    slug: 'the-last-of-us-part-ii',
    imageUrl: gameImages.lastOfUs,
  },
  {
    name: 'Bloodborne',
    description: 'Embrace the Old Blood. Hunt for answers in the fog-laden streets of Yharnam. Discover the secrets of this cursed city.',
    developer: 'FromSoftware',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2015-03-24',
    price: 39.99,
    stock: 12,
    genre: 'Action RPG',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'BLOODBORNE-PS4',
    slug: 'bloodborne',
    imageUrl: gameImages.bloodborne,
  },
  {
    name: 'Resident Evil Village',
    description: 'Fear and isolation seep through the walls of an old, clandestine village. Uncover the secrets and survive the horrors.',
    developer: 'Capcom',
    publisher: 'Capcom',
    releaseDate: '2021-05-07',
    price: 59.99,
    stock: 17,
    genre: 'Survival Horror',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'RE8-PS4-001',
    slug: 'resident-evil-village',
    imageUrl: gameImages.resident,
  },
  {
    name: 'Ghost of Tsushima',
    description: 'From the creators of inFamous comes a epic tale of honor and sacrifice. Experience the way of the samurai on the island of Tsushima.',
    developer: 'Sucker Punch Productions',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2020-07-17',
    price: 49.99,
    stock: 19,
    genre: 'Action-Adventure',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'GHOST-TSUSHIMA-PS4',
    slug: 'ghost-of-tsushima',
    imageUrl: gameImages.ghost,
  },
  {
    name: 'Uncharted 4: A Thief\'s End',
    description: 'Nathan Drake and his brother are drawn into a massive heist. Uncover the truth about pirate Henry Avery and his legendary treasure.',
    developer: 'Naughty Dog',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2016-05-10',
    price: 39.99,
    stock: 10,
    genre: 'Action-Adventure',
    platform: 'PS4',
    esrb: 'M (Mature)',
    sku: 'UNCHARTED4-PS4',
    slug: 'uncharted-4-a-thiefs-end',
    imageUrl: gameImages.uncharted,
  },
  {
    name: 'Ratchet & Clank',
    description: 'From the makers of Spyro comes the explosive and hilarious story of Ratchet and Clank. Save the galaxy with an arsenal of powerful weapons.',
    developer: 'Insomniac Games',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2016-04-12',
    price: 39.99,
    stock: 14,
    genre: 'Action-Adventure',
    platform: 'PS4',
    esrb: 'T (Teen)',
    sku: 'RATCHET-CLANK-PS4',
    slug: 'ratchet-and-clank',
    imageUrl: gameImages.ratchet,
  },
  {
    name: 'Sackboy: A Big Adventure',
    description: 'Jump into a colorful 3D platformer with Sackboy. Experience dynamic gameplay, creative level design, and loads of personality.',
    developer: 'Sucker Punch Productions',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: '2020-11-12',
    price: 49.99,
    stock: 16,
    genre: 'Platformer',
    platform: 'PS4',
    esrb: 'E (Everyone)',
    sku: 'SACKBOY-PS4-001',
    slug: 'sackboy-a-big-adventure',
    imageUrl: gameImages.sackboy,
  },
];

const categories = [
  { name: 'Action-Adventure', description: 'Experience fast-paced action combined with engaging storytelling' },
  { name: 'Action RPG', description: 'Dynamic combat meets deep character progression' },
  { name: 'RPG', description: 'Explore vast worlds and develop your character' },
  { name: 'Survival Horror', description: 'Heart-pounding scares and intense survival mechanics' },
  { name: 'Platformer', description: 'Classic jumping and obstacle-course challenges' },
];

const tags = [
  { name: 'Exclusive' },
  { name: 'Multiplayer' },
  { name: 'Single-Player' },
  { name: 'Campaign' },
  { name: 'Co-op' },
  { name: 'Competitive' },
  { name: 'Story-Driven' },
  { name: 'Open-World' },
  { name: 'Indies' },
  { name: 'AAA' },
  { name: 'Singleplayer' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de base de datos...');

    // Inicializar conexión
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexión a base de datos establecida');
    }

    // Obtener repositorios
    const categoryRepo = AppDataSource.getRepository('Category');
    const tagRepo = AppDataSource.getRepository('Tag');
    const gameRepo = AppDataSource.getRepository('Game');
    const queryRunner = AppDataSource.createQueryRunner();

    // Limpiar datos existentes (deshabilitar restricciones)
    console.log('🗑️  Limpiando datos existentes...');
    try {
      // Deshabilitar restricciones de clave foránea
      await queryRunner.query('PRAGMA foreign_keys = OFF');
      
      // Limpiar tablas en orden inverso de dependencias
      await queryRunner.query('DELETE FROM "game_tags_tag"');
      await queryRunner.query('DELETE FROM "games"');
      await queryRunner.query('DELETE FROM "tags"');
      await queryRunner.query('DELETE FROM "categories"');
      
      // Reactivar restricciones
      await queryRunner.query('PRAGMA foreign_keys = ON');
      
      console.log('✅ Datos anteriores eliminados');
    } catch (err) {
      console.log('⚠️  No se encontraron datos previos para limpiar');
    }

    // Insertar categorías
    console.log('📁 Inserting categories...');
    const savedCategories = await categoryRepo.save(categories);
    console.log(`✅ ${savedCategories.length} categorías insertadas`);

    // Obtener referencias a repositorios nuevamente
    const categoryRepo2 = AppDataSource.getRepository('Category');
    const tagRepo2 = AppDataSource.getRepository('Tag');
    const gameRepo2 = AppDataSource.getRepository('Game');

    // Insertar tags
    console.log('🏷️  Inserting tags...');
    const savedTags = await tagRepo2.save(tags);
    console.log(`✅ ${savedTags.length} tags insertados`);

    // Insertar juegos
    console.log('🎮 Inserting games...');
    const gamesToSave = games.map((game, index) => ({
      ...game,
      category: savedCategories[index % savedCategories.length],
    }));

    const savedGames = await gameRepo2.save(gamesToSave);
    console.log(`✅ ${savedGames.length} juegos insertados`);

    // Asignar tags a juegos (algunos juegos con algunos tags)
    console.log('🔗 Linking tags to games...');
    const tagAssignments = [
      { gameIndex: 0, tagIndexes: [0, 6, 7] }, // God of War: Exclusive, Story-Driven, Open-World
      { gameIndex: 1, tagIndexes: [1, 6, 9] }, // Elden Ring: Multiplayer, Story-Driven, AAA
      { gameIndex: 2, tagIndexes: [0, 10, 9] }, // Spider-Man: Exclusive, Singleplayer, AAA
      { gameIndex: 3, tagIndexes: [6, 7, 9] }, // Horizon: Story-Driven, Open-World, AAA
      { gameIndex: 4, tagIndexes: [3, 6, 9] }, // FF7: Campaign, Story-Driven, AAA
      { gameIndex: 5, tagIndexes: [3, 6, 9] }, // Last of Us: Campaign, Story-Driven, AAA
      { gameIndex: 6, tagIndexes: [1, 6, 9] }, // Bloodborne: Multiplayer, Story-Driven, AAA
      { gameIndex: 7, tagIndexes: [10, 6, 9] }, // RE8: Singleplayer, Story-Driven, AAA
      { gameIndex: 8, tagIndexes: [0, 6, 7] }, // Ghost: Exclusive, Story-Driven, Open-World
      { gameIndex: 9, tagIndexes: [3, 6, 9] }, // Uncharted 4: Campaign, Story-Driven, AAA
      { gameIndex: 10, tagIndexes: [10, 9] }, // Ratchet & Clank: Singleplayer, AAA
      { gameIndex: 11, tagIndexes: [5, 10] }, // Sackboy: Competitive, Singleplayer
    ];

    for (const assignment of tagAssignments) {
      const game = savedGames[assignment.gameIndex];
      const assignedTags = assignment.tagIndexes.map(idx => savedTags[idx]);
      game.tags = assignedTags;
      await gameRepo2.save(game);
    }

    console.log('✅ Tags asignados a juegos');

    console.log('\n✨ ¡Seed completado exitosamente!');
    console.log(`📊 Estadísticas:`);
    console.log(`   - Categorías: ${savedCategories.length}`);
    console.log(`   - Tags: ${savedTags.length}`);
    console.log(`   - Juegos: ${savedGames.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

seedDatabase();
