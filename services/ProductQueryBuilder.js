const { AppDataSource } = require('../config/databaseConfig');
const Game = require('../models/Product');

/**
 * ProductFilterValidator
 * Valida y sanitiza los filtros de búsqueda antes de construir la query
 */
class ProductFilterValidator {
  constructor() {
    this.errors = [];
  }

  /**
   * Valida que un valor sea un número válido
   */
  isValidNumber(value) {
    if (value === null || value === undefined) return false;
    const num = Number(value);
    return !Number.isNaN(num) && isFinite(num);
  }

  /**
   * Valida que un valor sea un ID válido (número positivo)
   */
  isValidId(value) {
    if (!this.isValidNumber(value)) return false;
    return Number(value) > 0;
  }

  /**
   * Valida un filtro de categoría (ID o nombre)
   */
  validateCategory(category) {
    if (!category) return null;
    
    const categoryStr = String(category).trim();
    if (!categoryStr) return null;

    // Si es número, validar que sea positivo
    if (/^\d+$/.test(categoryStr)) {
      const id = Number(categoryStr);
      if (id <= 0) {
        this.errors.push('Category ID must be a positive number');
        return null;
      }
      return { type: 'id', value: id };
    }

    // Si es string, validar longitud
    if (categoryStr.length > 100) {
      this.errors.push('Category name is too long (max 100 characters)');
      return null;
    }

    return { type: 'name', value: categoryStr };
  }

  /**
   * Valida un filtro de tags (array de IDs)
   */
  validateTags(tags) {
    if (!tags) return [];

    let tagIds = [];
    if (Array.isArray(tags)) {
      tagIds = tags;
    } else {
      tagIds = String(tags).split(',').map(t => t.trim());
    }

    const validIds = [];
    for (const id of tagIds) {
      if (this.isValidId(id)) {
        validIds.push(Number(id));
      } else if (id) {
        this.errors.push(`Invalid tag ID: ${id}`);
      }
    }

    return validIds;
  }

  /**
   * Valida rango de precios
   */
  validatePrice(priceMin, priceMax) {
    const result = {};

    if (priceMin !== undefined && priceMin !== null) {
      if (!this.isValidNumber(priceMin)) {
        this.errors.push('price_min must be a valid number');
      } else {
        const min = Number(priceMin);
        if (min < 0) {
          this.errors.push('price_min cannot be negative');
        } else {
          result.min = min;
        }
      }
    }

    if (priceMax !== undefined && priceMax !== null) {
      if (!this.isValidNumber(priceMax)) {
        this.errors.push('price_max must be a valid number');
      } else {
        const max = Number(priceMax);
        if (max < 0) {
          this.errors.push('price_max cannot be negative');
        } else {
          result.max = max;
        }
      }
    }

    // Validar que min < max
    if (result.min !== undefined && result.max !== undefined && result.min > result.max) {
      this.errors.push('price_min cannot be greater than price_max');
    }

    return result;
  }

  /**
   * Valida búsqueda de texto
   */
  validateSearch(search) {
    if (!search) return null;

    const searchStr = String(search).trim();
    if (!searchStr) return null;

    if (searchStr.length > 200) {
      this.errors.push('Search term is too long (max 200 characters)');
      return null;
    }

    return searchStr;
  }

  /**
   * Valida un filtro de string (developer, publisher, platform, esrb, genre)
   */
  validateStringFilter(value, fieldName, maxLength = 100) {
    if (!value) return null;

    const str = String(value).trim();
    if (!str) return null;

    if (str.length > maxLength) {
      this.errors.push(`${fieldName} is too long (max ${maxLength} characters)`);
      return null;
    }

    return str;
  }

  /**
   * Valida una fecha
   */
  validateDate(date) {
    if (!date) return null;

    const dateStr = String(date).trim();
    const dateObj = new Date(dateStr);

    if (Number.isNaN(dateObj.getTime())) {
      this.errors.push('Invalid date format');
      return null;
    }

    return dateStr;
  }

  /**
   * Valida paginación
   */
  validatePagination(page, limit) {
    const result = {};

    const pageNum = Number(page || 1);
    if (Number.isNaN(pageNum) || pageNum < 1) {
      result.page = 1;
    } else {
      result.page = pageNum;
    }

    const limitNum = Number(limit || 10);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      result.limit = 10;
    } else {
      result.limit = limitNum;
    }

    return result;
  }

  /**
   * Valida todos los filtros
   * @param {Object} rawFilters - Filtros sin validar del query string
   * @returns {Object} - { isValid: boolean, filters: Object, errors: Array }
   */
  validate(rawFilters = {}) {
    this.errors = [];
    const filters = {};

    // Validar paginación
    const pagination = this.validatePagination(rawFilters.page, rawFilters.limit);
    filters.page = pagination.page;
    filters.limit = pagination.limit;

    // Validar búsqueda y filtros básicos
    const category = this.validateCategory(rawFilters.category);
    if (category) filters.category = category;

    const tags = this.validateTags(rawFilters.tags);
    if (tags.length > 0) filters.tags = tags;

    const prices = this.validatePrice(rawFilters.price_min, rawFilters.price_max);
    if (prices.min !== undefined) filters.price_min = prices.min;
    if (prices.max !== undefined) filters.price_max = prices.max;

    const search = this.validateSearch(rawFilters.search);
    if (search) filters.search = search;

    // Validar filtros personalizados (brand, generation, genre, platform, esrb, developer, publisher, releaseDate)
    const developer = this.validateStringFilter(rawFilters.developer, 'Developer', 100);
    if (developer) filters.developer = developer;

    const publisher = this.validateStringFilter(rawFilters.publisher, 'Publisher', 100);
    if (publisher) filters.publisher = publisher;

    const brand = this.validateStringFilter(rawFilters.brand, 'Brand', 100);
    if (brand) filters.brand = brand;

    const generation = this.validateStringFilter(rawFilters.generation, 'Generation', 50);
    if (generation) filters.generation = generation;

    const platform = this.validateStringFilter(rawFilters.platform, 'Platform', 50);
    if (platform) filters.platform = platform;

    const esrb = this.validateStringFilter(rawFilters.esrb, 'ESRB', 10);
    if (esrb) filters.esrb = esrb;

    const genre = this.validateStringFilter(rawFilters.genre, 'Genre', 100);
    if (genre) filters.genre = genre;

    const releaseDate = this.validateDate(rawFilters.releaseDate);
    if (releaseDate) filters.releaseDate = releaseDate;

    return {
      isValid: this.errors.length === 0,
      filters,
      errors: this.errors,
    };
  }

  /**
   * Obtiene los errores de validación
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Limpia los errores
   */
  clearErrors() {
    this.errors = [];
  }
}

/**
 * ProductQueryBuilder
 * 
 * Implementa el patrón Builder para construir dinámicamente queries de búsqueda.
 * Valida y sanitiza todos los filtros antes de aplicarlos.
 * Incluye el validador ProductFilterValidator integrado.
 * 
 * Uso:
 *   const result = await productQueryBuilder.buildAndExecute(rawFilters);
 *   if (!result.success) {
 *     // Manejar errores
 *     return res.status(400).json({ status: 'fail', errors: result.errors });
 *   }
 *   const { items, total, page, limit, totalPages } = result.data;
 */
class ProductQueryBuilder {
  constructor() {
    this.repo = AppDataSource.getRepository(Game);
    this.validator = new ProductFilterValidator();
  }

  /**
   * Valida y construye la query con filtros.
   * Este método VALIDA los filtros crudos y luego construye la query.
   * 
   * @param {Object} rawFilters - Filtros sin validar del query string
   * @returns {Object} { success: boolean, queryBuilder: QueryBuilder|null, errors: Array }
   */
  validateAndBuild(rawFilters = {}) {
    // 1. Validar todos los filtros
    const validation = this.validator.validate(rawFilters);

    if (!validation.isValid) {
      return {
        success: false,
        queryBuilder: null,
        errors: validation.errors,
      };
    }

    // 2. Construir la query con los filtros validados
    const filters = validation.filters;
    
    try {
      const qb = this.buildQueryBuilder(filters);
      
      return {
        success: true,
        queryBuilder: qb,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        queryBuilder: null,
        errors: [error.message || 'Error building query'],
      };
    }
  }

  /**
   * Construye el QueryBuilder de TypeORM con los filtros validados.
   * NOTA: Los filtros ya deben estar validados antes de llamar este método.
   * 
   * @param {Object} filters - Filtros ya validados
   * @returns {QueryBuilder}
   */
  buildQueryBuilder(filters = {}) {
    const qb = this.repo.createQueryBuilder('game')
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
      brand,
      generation,
      releaseDate,
    } = filters;

    // Filtro de categoría (ID o nombre)
    if (category) {
      if (category.type === 'id') {
        qb.andWhere('category.id = :catId', { catId: category.value });
      } else {
        qb.andWhere('LOWER(category.name) = LOWER(:catName)', { catName: category.value });
      }
    }

    // Filtro de tags (relación many-to-many)
    if (tags && tags.length > 0) {
      qb.andWhere('tags.id IN (:...tagIds)', { tagIds: tags });
    }

    // Filtro de rango de precio
    if (price_min !== undefined) {
      qb.andWhere('game.price >= :pmin', { pmin: price_min });
    }
    if (price_max !== undefined) {
      qb.andWhere('game.price <= :pmax', { pmax: price_max });
    }

    // Búsqueda de texto (name, description)
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(game.name) LIKE :search OR LOWER(game.description) LIKE :search)',
        { search: searchTerm }
      );
    }

    // Filtros personalizados de string (developer, publisher, brand, platform, esrb, genre)
    if (developer) {
      qb.andWhere('LOWER(game.developer) = LOWER(:developer)', { developer });
    }
    if (publisher) {
      qb.andWhere('LOWER(game.publisher) = LOWER(:publisher)', { publisher });
    }
    if (brand) {
      qb.andWhere('LOWER(game.brand) = LOWER(:brand)', { brand });
    }
    if (platform) {
      qb.andWhere('LOWER(game.platform) = LOWER(:platform)', { platform });
    }
    if (esrb) {
      qb.andWhere('LOWER(game.esrb) = LOWER(:esrb)', { esrb });
    }
    if (genre) {
      qb.andWhere('LOWER(game.genre) = LOWER(:genre)', { genre });
    }

    // Filtro personalizado: generation
    if (generation) {
      qb.andWhere('LOWER(game.generation) = LOWER(:generation)', { generation });
    }

    // Filtro de fecha
    if (releaseDate) {
      qb.andWhere('DATE(game.releaseDate) = :rdate', { rdate: releaseDate });
    }

    // Ordenamiento por defecto
    qb.orderBy('game.id', 'DESC');

    return qb;
  }

  /**
   * Método completo que valida, construye y ejecuta la query.
   * Retorna los items paginados y metadata.
   * 
   * @param {Object} rawFilters - Filtros sin validar del query string
   * @returns {Promise<Object>} { success: boolean, data: { items, total, page, limit, totalPages }, errors: Array }
   */
  async buildAndExecute(rawFilters = {}) {
    // 1. Validar y construir
    const buildResult = this.validateAndBuild(rawFilters);

    if (!buildResult.success) {
      return {
        success: false,
        data: null,
        errors: buildResult.errors,
      };
    }

    // 2. Aplicar paginación
    const qb = buildResult.queryBuilder;
    const { page, limit } = this.validator.validate(rawFilters).filters;
    const offset = (page - 1) * limit;

    try {
      // 3. Ejecutar la query
      const [items, total] = await qb
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.max(Math.ceil(total / limit), 1);

      return {
        success: true,
        data: {
          items,
          total,
          page,
          limit,
          totalPages,
        },
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message || 'Error executing query'],
      };
    }
  }

  /**
   * Obtiene un QueryBuilder para un producto por ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findByIdWithRelations(id) {
    try {
      return await this.repo.findOne({
        where: { id },
        relations: ['category', 'tags'],
      });
    } catch (error) {
      throw new Error(`Error finding product by ID: ${error.message}`);
    }
  }
}

module.exports = new ProductQueryBuilder();
