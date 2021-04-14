const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  mongoose
    .connect(process.env.CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("connected");
    })
    .catch((err) => console.log(err));
  /* eslint-enable no-console */
});
