const { AppDataSource } = require('../config/databaseConfig');
const Game = require('../models/Product');

class ProductQueryBuilder {
  constructor() {}

  /**
   * Build a QueryBuilder for games according to filters.
   * filters: { category, tags, price_min, price_max, search, developer, publisher, platform, esrb, genre, releaseDate }
   */
  build(filters = {}) {
    const repo = AppDataSource.getRepository(Game);
    const qb = repo.createQueryBuilder('game')
      .leftJoinAndSelect('game.category', 'category')
      .leftJoinAndSelect('game.tags', 'tags');

    const {
      category,
      tags,
      price_min,
      price_max,
      search,
      developer,
      publisher,
      platform,
      esrb,
      genre,
      releaseDate,
    } = filters;

    if (category) {
      if (!Number.isNaN(Number(category))) {
        qb.andWhere('category.id = :catId', { catId: Number(category) });
      } else {
        qb.andWhere('LOWER(category.name) = :catName', { catName: String(category).toLowerCase() });
      }
    }

    if (tags) {
      let tagIds = [];
      if (Array.isArray(tags)) tagIds = tags.map(t => Number(t));
      else tagIds = String(tags).split(',').map(t => Number(t));
      tagIds = tagIds.filter(n => !Number.isNaN(n));
      if (tagIds.length > 0) {
        qb.andWhere('tags.id IN (:...tagIds)', { tagIds });
      }
    }

    if (price_min && !Number.isNaN(Number(price_min))) {
      qb.andWhere('game.price >= :pmin', { pmin: Number(price_min) });
    }
    if (price_max && !Number.isNaN(Number(price_max))) {
      qb.andWhere('game.price <= :pmax', { pmax: Number(price_max) });
    }

    if (search) {
      const s = `%${String(search).toLowerCase()}%`;
      qb.andWhere('(LOWER(game.name) LIKE :s OR LOWER(game.description) LIKE :s OR LOWER(game.genre) LIKE :s)', { s });
    }

    if (developer) qb.andWhere('LOWER(game.developer) = :developer', { developer: String(developer).toLowerCase() });
    if (publisher) qb.andWhere('LOWER(game.publisher) = :publisher', { publisher: String(publisher).toLowerCase() });
    if (platform) qb.andWhere('LOWER(game.platform) = :platform', { platform: String(platform).toLowerCase() });
    if (esrb) qb.andWhere('LOWER(game.esrb) = :esrb', { esrb: String(esrb).toLowerCase() });
    if (genre) qb.andWhere('LOWER(game.genre) = :genre', { genre: String(genre).toLowerCase() });
    if (releaseDate) qb.andWhere('game.releaseDate = :rdate', { rdate: String(releaseDate) });

    qb.orderBy('game.id', 'DESC');

    return qb;
  }
}

module.exports = new ProductQueryBuilder();
