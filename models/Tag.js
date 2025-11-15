const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: "Tag",
  tableName: "tags",
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
      type: "many-to-many",
      target: "Game",
      inverseSide: "tags",
      joinTable: false,
    },
  },
});
