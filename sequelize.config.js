module.exports = {
  database: process.env.PG_DB,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  logging: process.env.NODE_ENV !== "production",
  dialect: "postgres",
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
};
