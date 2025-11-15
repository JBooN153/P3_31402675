const { EntitySchema } = require("typeorm");

// Game entity: represents a PS4 game in the collection
module.exports = new EntitySchema({
  name: "Game",
  tableName: "games",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    developer: {
      type: String,
      nullable: true,
    },
    publisher: {
      type: String,
      nullable: true,
    },
    releaseDate: {
      type: "date",
      nullable: true,
    },
    price: {
      type: "float",
      nullable: false,
      default: 0,
    },
    stock: {
      type: "int",
      nullable: false,
      default: 0,
    },
    genre: {
      type: String,
      nullable: true,
    },
    platform: {
      type: String,
      nullable: false,
      default: "PS4",
    },
    esrb: {
      type: String,
      nullable: true,
    },
    sku: {
      type: String,
      nullable: true,
      unique: false,
    },
    slug: {
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
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: true,
      nullable: true,
      eager: true,
    },
    tags: {
      type: "many-to-many",
      target: "Tag",
      joinTable: {
        name: "game_tags",
      },
      eager: true,
    },
  },
});
