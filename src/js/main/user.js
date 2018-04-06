/**
 * Handle user operations.
 */

// Export all functions.
module.exports = {
  // Retrieve User
  retrieveUser: function(neDB, AppConstants) {
    return new Promise(function(resolve, reject) {
      neDB.find({ type: "User" }, function(err, user) {
        if (err) {
          console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "retrieveUser()", err);
          reject(null);
        } else {
          console.log(new Date().toJSON(), AppConstants.LOG_INFO, "retrieveUser(): Retrieved:", user);
          if(user.length == 0) {
            resolve(null);
          } else {
            resolve(user[0]);
          }
        }
      });
    });
  },
};
