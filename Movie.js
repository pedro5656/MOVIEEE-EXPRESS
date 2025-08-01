import mongoose from "mongoose";

const movieSchema = mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
    },
    budget: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0,
    },


}, { timestamp: true, });

export default mongoose.model("Movie", movieSchema);