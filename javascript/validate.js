const validator = require('validator');

const Value = {
  ValueString(str) {
    return str !== '' || 'Please enter a valid response!';
  },
  ValueSalary(num) {
    if (validator.isDecimal(num)) return true;
    return 'Please enter a valid salary!';
  },
  isSame(str1, str2) {
    if (str1 === str2) return true;
  }
};

module.exports = Value;
