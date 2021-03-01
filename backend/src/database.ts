import mongoose from 'mongoose';

const connect = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(`Database ${db.connection.name} is connected!`);
  } catch (err) {
    if (err instanceof mongoose.Error)
      console.log('An error occurred w  hile trying to connect to the database!', err.message);
    else console.log('An error ocurred!', err);
  }
};

connect();
