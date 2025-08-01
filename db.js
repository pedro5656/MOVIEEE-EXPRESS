import mongoose from 'mongoose';
const MONGOOSE_URI = process.env.MONGOOSE_URI;

export const connectDB = async () => {
    mongoose.connect(MONGOOSE_URI)
        .then(() => console.log(" i don connect MongoDB"))
        .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));
};