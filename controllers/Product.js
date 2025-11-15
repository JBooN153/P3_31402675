const { AppDataSource } = require('../config/databaseConfig');
const Producto = require("../models/Product");
const Category = require("../models/Category");
const Tag = require("../models/Tag");

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const productRepository = require('../repositories/ProductRepository');
const productQueryBuilder = require('../services/ProductQueryBuilder');

const productController = {
  async publicView(req, res) {
    let idParam = '';
    let urlSlug = '';
    if (req.params) {
      if (req.params.composite) {
        const comp = String(req.params.composite);
        const hyphenIndex = comp.indexOf('-');
        if (hyphenIndex >= 0) {
          idParam = comp.slice(0, hyphenIndex);
          urlSlug = comp.slice(hyphenIndex + 1);
        } else {
          idParam = comp;
        }
      } else {
        idParam = req.params.id ? String(req.params.id) : '';
        urlSlug = req.params.slug ? String(req.params.slug) : '';
      }
    }

    let id = Number(idParam);
    if (Number.isNaN(id)) {
      const m = idParam.match(/^\d+/);
      id = m ? Number(m[0]) : NaN;
    }

    if (Number.isNaN(id)) {
      return res.status(400).json({ status: "fail", message: "Invalid product id" });
    }

    try {
      const product = await productRepository.findByIdWithRelations(id);

      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      const correctSlug = product.slug ? String(product.slug) : slugify(product.name);

      const normalizedUrlSlug = slugify(urlSlug || '');
      const normalizedCorrect = slugify(correctSlug || '');

      if (normalizedUrlSlug !== normalizedCorrect) {
        const base = req.baseUrl || '';
        const canonical = `${base}/p/${product.id}-${correctSlug}`;
        return res.redirect(301, canonical);
      }

      return res.status(200).json({ status: "success", data: product });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async list(req, res) {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.max(Number(req.query.limit || 10), 1);
    const offset = (page - 1) * limit;

    const filters = {
      category: req.query.category,
      tags: req.query.tags,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      search: req.query.search,
      developer: req.query.developer,
      publisher: req.query.publisher,
      platform: req.query.platform,
      esrb: req.query.esrb,
      genre: req.query.genre,
      releaseDate: req.query.releaseDate,
    };

    const qb = productQueryBuilder.build(filters);
    qb.skip(offset).take(limit);

    try {
      const [items, total] = await qb.getManyAndCount();
      const totalPages = Math.max(Math.ceil(total / limit), 1);

      return res.status(200).json({
        status: "success",
        data: {
          items,
          meta: { total, page, limit, totalPages }
        }
      });
    } catch (err) {
      return res.status(400).json({ status: "fail", message: "Invalid filters", error: err.message });
    }
  },

  async getById(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ status: "fail", message: "Invalid product id" });
    try {
      const product = await productRepository.findByIdWithRelations(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }
      return res.status(200).json({ status: "success", data: product });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async create(req, res) {
    const body = req.body || {};
    if (!body.name) return res.status(400).json({ status: "fail", message: "Field 'name' is required" });
    if (body.price != null && Number.isNaN(Number(body.price))) {
      return res.status(400).json({ status: "fail", message: "Field 'price' must be a number" });
    }
    if (body.stock != null && Number.isNaN(Number(body.stock))) {
      return res.status(400).json({ status: "fail", message: "Field 'stock' must be a number" });
    }

    try {
      const { categoryId, tags } = body;
      const product = productRepository.create(body);

      const baseSlug = slugify(String(body.name));
      product.slug = await productRepository.generateUniqueSlug(baseSlug);

      if (categoryId) {
        const cat = await productRepository.findCategoryById(Number(categoryId));
        if (!cat) return res.status(404).json({ status: 'fail', message: 'Category not found' });
        product.category = cat;
      }

      if (tags) {
        const tagIds = Array.isArray(tags) ? tags : String(tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        product.tags = foundTags;
      }

      try {
        const savedProduct = await productRepository.saveWithRetry(product, {
          onConflict: async (err, attempt, ent) => {
            const msg = String(err && err.message || '').toLowerCase();
            if (msg.includes('slug') || /unique/i.test(msg)) {
              ent.slug = `${baseSlug}-${attempt}`;
              return true;
            }
            return false;
          }
        }, 6);
        return res.status(201).json({ status: "success", data: savedProduct });
      } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async update(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ status: "fail", message: "Invalid product id" });
    try {
      const existing = await productRepository.findByIdWithRelations(id);
      if (!existing) return res.status(404).json({ status: "fail", message: "Product not found" });

      const body = req.body || {};
      AppDataSource.getRepository(Producto).merge(existing, body);

      if (body.name) {
        const baseSlug = slugify(String(body.name));
        if (!existing.slug || existing.slug !== baseSlug) {
          existing.slug = await productRepository.generateUniqueSlug(baseSlug);
        }
      }

      if (body.categoryId) {
        const cat = await productRepository.findCategoryById(Number(body.categoryId));
        if (!cat) return res.status(404).json({ status: 'fail', message: 'Category not found' });
        existing.category = cat;
      }

      if (body.tags) {
        const tagIds = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        existing.tags = foundTags;
      }

      try {
        const base = slugify(String(existing.name));
        const saved = await productRepository.saveWithRetry(existing, {
          onConflict: async (err, attempt, ent) => {
            const msg = String(err && err.message || '').toLowerCase();
            if (msg.includes('slug') || /unique/i.test(msg)) {
              ent.slug = `${base}-${attempt}`;
              return true;
            }
            return false;
          }
        }, 6);
        return res.status(200).json({ status: "success", data: saved });
      } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async delete(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ status: "fail", message: "Invalid product id" });
    try {
      const product = await productRepository.findById(id);
      if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });

      await productRepository.remove(product);
      return res.status(200).json({ status: "success", message: "Product deleted" });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },
};

module.exports = productController;
