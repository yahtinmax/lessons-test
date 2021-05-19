require("dotenv").config({
  path: `.${process.env.NODE_ENV}.env`,
});
const app = require("./app");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Express server starts on port ${PORT}`));
