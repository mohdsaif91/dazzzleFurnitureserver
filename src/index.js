const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;

app.listen(port, () => {
  /* eslint-disable no-console */
  mongoose.set("useFindAndModify", false);
  mongoose
    .connect(process.env.CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("connected", port);
      console.log("hihi---------------");
    })
    .catch((err) => console.log(err));
  /* eslint-enable no-console */
});
