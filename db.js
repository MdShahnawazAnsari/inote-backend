const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URL;

const connectToMongo = async () => {
  try {
    let db = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(db && "mongodb connected");
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error}`);
  }
};

module.exports = connectToMongo;
