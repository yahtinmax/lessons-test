const { Sequelize } = require("sequelize");
const sequelizeConfig = require("./sequelize.config");

const sequelize = new Sequelize(sequelizeConfig);

sequelize
  .authenticate()
  .then(async () => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = sequelize;
