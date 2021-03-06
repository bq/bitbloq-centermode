'use strict';

var mongoose = require('mongoose'),
    MemberFunctions = require('../member/member.functions.js'),
    AssignmentFunctions = require('../assignment/assignment.functions.js');

var GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: String,
        default: 'open' //open | inProgress | closed
    },
    accessId: {
        type: String,
        unique: true
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
    center: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CenterMode-Center',
        trim: false,
        required: true
    },
    color: String,
    deleted: Boolean
}, {
    timestamps: true
});

/**
 * Pre hook
 */

function findNotDeletedMiddleware(next) {
    this.where('deleted').in([false, undefined, null]);
    next();
}

GroupSchema.pre('find', findNotDeletedMiddleware);
GroupSchema.pre('findOne', findNotDeletedMiddleware);
GroupSchema.pre('findOneAndUpdate', findNotDeletedMiddleware);
GroupSchema.pre('count', findNotDeletedMiddleware);

/**
 * Methods

 */

GroupSchema.methods = {

    /**
     * userCanUpdate - check if an user can update this object
     * @param {String} userId
     * @param {Function} next
     * @api public
     */
    userCanUpdate: function(userId, next) {
        if (String(userId) === String(this.creator) || String(userId) == String(this.teacher)) {
            next(null, true);
        } else {
            this.timesViewed++;
            MemberFunctions.userIsHeadmaster(userId, this.center, next);
        }
    },

    /**
     * delete - change deleted attribute to true
     *
     * @param {Funcion} next
     * @api public
     */
    delete: function(next) {
        var groupId = this._id;
        this.update({
            deleted: true
        }, function(err) {
            if (!err) {
                AssignmentFunctions.removeByGroup(groupId, next);
            } else {
                next(err);
            }
        });
    }
};

/**
 * Pre-save hook
 */
GroupSchema
    .pre('save', function(next) {
        var group = this;
        //accessKey seleccionar solo
        this.constructor.aggregate([{
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 1
            }
        ], function(err, lastGroups) {
            var lastAccessId;
            if (lastGroups.length === 0) {
                lastAccessId = '000000';
            } else {
                lastAccessId = lastGroups[0].accessId;
            }
            var accessId = ((parseInt(lastAccessId, 36) + 1).toString(36)) + '';
            group.accessId = accessId.length >= 6 ? accessId : new Array(6 - accessId.length + 1).join('0') + accessId;
            next();
        });

    });

module.exports = mongoose.model('CenterMode-Group', GroupSchema);
