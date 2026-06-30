const mongoose = require('mongoose');

const basePlugin = (schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  schema.set('timestamps', true);

  schema.methods.softDelete = async function (userId) {
    this.isDeleted = true;
    this.updatedBy = userId || null;
    await this.save();
  };

  // Automatically exclude soft-deleted documents from all find queries
  schema.pre(/^find/, function () {
    if (this.getFilter().isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  });
};

module.exports = basePlugin;
