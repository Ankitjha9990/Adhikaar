const mongoose = require('mongoose');

const departmentLookupSchema = new mongoose.Schema(
  {
    subject_keywords: {
      type: [String],
      required: true,
      index: true,
    },
    department_name: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      default: 'generic',
    },
    address_template: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DepartmentLookup', departmentLookupSchema);
