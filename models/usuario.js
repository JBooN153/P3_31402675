const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios", // nombre explícito de la tabla
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment"
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    email: {
      type: "varchar",
      length: 150,
      unique: true,
      nullable: false
    },
    contrasena: {
      type: "varchar",
      length: 255,
      nullable: false
    }
  }
});