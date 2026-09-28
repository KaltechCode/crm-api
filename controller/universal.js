// Regular Expressions
var re =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var Alphanumeric = /^[a-zA-Z0-9]+$/;

// Universal Object
let universal = {
  // Check if items are empty
  isEmpty: function (items) {
    return items.map((v) => {
      if (v === "" || v === undefined || v === null) {
        return `${v} is Empty`;
      } else {
        return `Not Empty`;
      }
    });
  },

  // Validate Email
  Isvalidemail: function (item) {
    // Returns true for valid emails and false for invalid
    return re.test(item);
  },

  // Check if input is Alphanumeric
  isAlphanumeric: function (item) {
    return Alphanumeric.test(item);
  },

  // Generate a 7-digit OTP
  generateOTP: function () {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Check if request body is empty
  emptyBody: function (req, res) {
    if (Object.keys(req.body).length !== 0) {
      return;
    } else {
      res.status(400).send({ message: "Empty Request Body" });
    }
  },
};

// Export the universal object for module usage
module.exports = universal;
