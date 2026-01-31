const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
      unique: true,
    },
    description: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
      nullable: false,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
      nullable: false,
    },
  },
  relations: {
    games: {
      type: "one-to-many",
      target: "Game",
      inverseSide: "category",
    },
  },
});
