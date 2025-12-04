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
  /**
   * GET /p/:id-:slug
   * Endpoint de búsqueda pública con "Self-Healing URL"
   */
  async publicView(req, res) {
    try {
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

      // Validar que el ID sea un número válido
      let id = Number(idParam);
      if (Number.isNaN(id)) {
        const m = idParam.match(/^\d+/);
        id = m ? Number(m[0]) : NaN;
      }

      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      // Buscar el producto por ID
      const product = await productRepository.findByIdWithRelations(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      // Obtener el slug correcto
      const correctSlug = product.slug ? String(product.slug) : slugify(product.name);
      const normalizedUrlSlug = slugify(urlSlug || '');
      const normalizedCorrect = slugify(correctSlug || '');

      // Self-Healing: Si el slug no coincide, redirigir 301 a la URL canónica
      if (normalizedUrlSlug && normalizedUrlSlug !== normalizedCorrect) {
        const base = req.baseUrl || '';
        const canonical = `${base}/p/${product.id}-${correctSlug}`;
        return res.redirect(301, canonical);
      }

      return res.status(200).json({ status: "success", data: product });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  /**
   * GET /products
   * Endpoint de listado avanzado público
   */
  async list(req, res) {
    try {
      // Delegar TODO al QueryBuilder: validación y construcción de query
      const result = await productQueryBuilder.buildAndExecute(req.query);

      // Si la validación falló, retornar errores
      if (!result.success) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid filters",
          errors: result.errors,
        });
      }

      // Retornar resultados paginados en formato JSend
      const { items, total, page, limit, totalPages } = result.data;
      return res.status(200).json({
        status: "success",
        data: {
          items,
          meta: { total, page, limit, totalPages }
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error retrieving products",
        error: error.message,
      });
    }
  },

  /**
   * GET /products/:id
   * Obtener un producto específico por ID
   */
  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      const product = await productRepository.findByIdWithRelations(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      return res.status(200).json({ status: "success", data: product });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  /**
   * POST /products
   * Crear un nuevo producto
   */
  async create(req, res) {
    try {
      const body = req.body || {};

      // Validar campos requeridos
      if (!body.name || String(body.name).trim() === '') {
        return res.status(400).json({ status: "fail", message: "Field 'name' is required" });
      }
      
      // Price es opcional, pero si se proporciona debe ser válido
      if (body.price !== undefined && body.price !== null) {
        if (Number.isNaN(Number(body.price))) {
          return res.status(400).json({ status: "fail", message: "Field 'price' must be a valid number" });
        }
        if (Number(body.price) < 0) {
          return res.status(400).json({ status: "fail", message: "Field 'price' cannot be negative" });
        }
      }

      // Stock es opcional, pero si se proporciona debe ser válido
      if (body.stock !== undefined && body.stock !== null) {
        if (Number.isNaN(Number(body.stock))) {
          return res.status(400).json({ status: "fail", message: "Field 'stock' must be a valid number" });
        }
        if (Number(body.stock) < 0) {
          return res.status(400).json({ status: "fail", message: "Field 'stock' cannot be negative" });
        }
      }

      // Crear el producto
      const product = productRepository.create(body);

      // Generar slug único
      const baseSlug = slugify(String(body.name));
      product.slug = await productRepository.generateUniqueSlug(baseSlug);

      // Asignar categoría si se proporciona
      if (body.categoryId) {
        const cat = await productRepository.findCategoryById(Number(body.categoryId));
        if (!cat) {
          return res.status(404).json({ status: 'fail', message: 'Category not found' });
        }
        product.category = cat;
      }

      // Asignar tags si se proporcionan
      if (body.tags) {
        const tagIds = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        product.tags = foundTags;
      }

      // Guardar con reintentos en caso de conflicto de slug
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
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  /**
   * PUT /products/:id
   * Actualizar un producto
   */
  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      // Buscar el producto existente
      const existing = await productRepository.findByIdWithRelations(id);
      if (!existing) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      const body = req.body || {};

      // Validar campos si se proporcionan
      if (body.price !== undefined && body.price !== null) {
        if (Number.isNaN(Number(body.price))) {
          return res.status(400).json({ status: "fail", message: "Field 'price' must be a valid number" });
        }
        if (Number(body.price) < 0) {
          return res.status(400).json({ status: "fail", message: "Field 'price' cannot be negative" });
        }
      }

      if (body.stock !== undefined && body.stock !== null) {
        if (Number.isNaN(Number(body.stock))) {
          return res.status(400).json({ status: "fail", message: "Field 'stock' must be a valid number" });
        }
        if (Number(body.stock) < 0) {
          return res.status(400).json({ status: "fail", message: "Field 'stock' cannot be negative" });
        }
      }

      // Mezclar cambios
      AppDataSource.getRepository(Producto).merge(existing, body);

      // Actualizar slug si el nombre cambió
      if (body.name) {
        const baseSlug = slugify(String(body.name));
        if (!existing.slug || existing.slug !== baseSlug) {
          existing.slug = await productRepository.generateUniqueSlug(baseSlug);
        }
      }

      // Actualizar categoría si se proporciona
      if (body.categoryId) {
        const cat = await productRepository.findCategoryById(Number(body.categoryId));
        if (!cat) {
          return res.status(404).json({ status: 'fail', message: 'Category not found' });
        }
        existing.category = cat;
      }

      // Actualizar tags si se proporcionan
      if (body.tags) {
        const tagIds = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        existing.tags = foundTags;
      }

      // Guardar con reintentos
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
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  /**
   * DELETE /products/:id
   * Eliminar un producto
   */
  async delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      await productRepository.remove(product);
      return res.status(200).json({ status: "success", message: "Product deleted" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },
};

module.exports = productController;
