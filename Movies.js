const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Movie schema
const MovieSchema = new Schema({
    title: {type: String, required: true, index: true },
    releaseDate: Date,
    genre: {
        type: String,
        enum: [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western',
            'Science Fiction'
        ],
    },
    actors: [{
        actorName: String,
        characterName: String,
    }]
});

MovieSchema.pre('save', function(next) {
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
    next();
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);