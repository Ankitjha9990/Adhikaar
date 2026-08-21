const mongoose = require('mongoose');

const legalSourceMetadataSchema = new mongoose.Schema(
  {
    source_file: {
      type: String,
      required: true,
    },
    act_name: {
      type: String,
      required: true,
    },
    section_label: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['rti', 'tenant', 'consumer', 'workplace', 'generic'],
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LegalSourceMetadata', legalSourceMetadataSchema);
