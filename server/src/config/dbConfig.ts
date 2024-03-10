import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.DATABASE_URL as string);
    console.log(
      "Database connected successfully ",
      connect.connection.host,
      connect.connection.name
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDb;
