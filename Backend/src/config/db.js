import dns from "dns"
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
 const conn = await mongoose.connect(process.env.MONGO_URI);
 console.log(`MongoDB Connected :- ${conn.connection.host}` );
 
};

export default connectDB;