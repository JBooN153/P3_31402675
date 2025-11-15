const { AppDataSource } = require('../config/databaseConfig');
const Producto = require("../models/Product");
const Tag = require("../models/Tag");
const Category = require("../models/Category");
const { In } = require('typeorm');

class ProductRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(Producto);
    this.tagRepo = AppDataSource.getRepository(Tag);
    this.categoryRepo = AppDataSource.getRepository(Category);
  }

  async findByIdWithRelations(id) {
    return this.repo.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
  }

  async findById(id) {
    return this.repo.findOneBy({ id });
  }

  async findBySlug(slug) {
    return this.repo.findOne({ where: { slug }, relations: ['category', 'tags'] });
  }

  create(data) {
    return this.repo.create(data);
  }

  async save(entity) {
    return this.repo.save(entity);
  }

  async saveWithRetry(entity, options = {}, maxRetries = 5) {
    let attempt = 0;
    while (true) {
      try {
        return await this.repo.save(entity);
      } catch (err) {
        attempt += 1;
        const canRetry = attempt <= maxRetries && typeof options.onConflict === 'function';
        if (canRetry) {
          const shouldContinue = await options.onConflict(err, attempt, entity);
          if (shouldContinue) continue;
        }
        throw err;
      }
    }
  }

  async remove(entity) {
    return this.repo.remove(entity);
  }

  async findTagsByIds(tagIds) {
    if (!Array.isArray(tagIds) || tagIds.length === 0) return [];
    if (typeof this.tagRepo.findByIds === 'function') {
      return this.tagRepo.findByIds(tagIds);
    }
    return this.tagRepo.findBy({ id: In(tagIds) });
  }

  async findCategoryById(id) {
    return this.categoryRepo.findOneBy({ id });
  }

  async existsSlug(slug) {
    const count = await this.repo.count({ where: { slug } });
    return count > 0;
  }

  async generateUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let suffix = 0;
    while (await this.existsSlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return slug;
  }
}

module.exports = new ProductRepository();
