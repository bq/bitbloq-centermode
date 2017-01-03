'use strict';

var mongoose = require('mongoose');

var ExerciseSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        trim: false,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        trim: false,
        required: true
    },
    defaultTheme: {
        type: String,
        default: 'infotab_option_colorTheme'
    },
    hardware: {
        board: String,
        components: [],
        connections: [],
        robot: String
    },
    software: {
        vars: {},
        setup: {},
        loop: {}
    },
    hardwareTags: [String],
    selectedBloqs: {}
}, {
    timestamps: true
});


/**
 * Methods
 */

ExerciseSchema.methods = {

    /**
     * share - project is shared with users
     *
     * @param {String} userId
     * @return {Boolean}
     * @api public
     */
    isOwner: function(userId) {
        var owner = false;
        if (String(this.teacher) === String(userId) || String(this.creator) === String(userId)) {
            owner = true;
        }
        return owner;
    }
};

module.exports = mongoose.model('CenterMode-Exercise', ExerciseSchema);
