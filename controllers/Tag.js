const { AppDataSource } = require('../config/databaseConfig');
const Tag = require("../models/Tag");

const tagController = {
  async getAll(req, res) {
    try {
      const tags = await AppDataSource.getRepository(Tag).find();
      return res.status(200).json({ status: "success", data: tags });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async create(req, res) {
    try {
      const repo = AppDataSource.getRepository(Tag);
      const exists = await repo.findOneBy({ name: req.body.name });
      if (exists) return res.status(409).json({ status: 'fail', message: 'Tag already exists' });
      const tag = await repo.save(req.body);
      return res.status(201).json({ status: "success", data: tag });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const tag = await AppDataSource.getRepository(Tag).findOneBy({ id });
      if (!tag) {
        return res.status(404).json({ status: "fail", message: "Tag not found" });
      }
      if (req.body.name && req.body.name !== tag.name) {
        const repo = AppDataSource.getRepository(Tag);
        const other = await repo.findOneBy({ name: req.body.name });
        if (other) return res.status(409).json({ status: 'fail', message: 'Tag name already in use' });
      }
      AppDataSource.getRepository(Tag).merge(tag, req.body);
      const updatedTag = await AppDataSource.getRepository(Tag).save(tag);
      return res.status(200).json({ status: "success", data: updatedTag });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async delete(req, res) {
    try {
      const id = Number(req.params.id);
      const tag = await AppDataSource.getRepository(Tag).findOneBy({ id });
      if (!tag) {
        return res.status(404).json({ status: "fail", message: "Tag not found" });
      }
      const games = await AppDataSource.getRepository(require('../models/Product')).createQueryBuilder('g').leftJoin('g.tags', 't').where('t.id = :tagId', { tagId: id }).getMany();
      if (games && games.length > 0) {
        return res.status(409).json({ status: 'fail', message: 'Tag has related products and cannot be deleted' });
      }
      await AppDataSource.getRepository(Tag).remove(tag);
      return res.status(200).json({ status: "success", message: "Tag deleted" });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  }
};

module.exports = tagController;
