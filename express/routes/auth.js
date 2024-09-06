var dbPool = require("../utils/db");

/**
 * checks if req.user.roles matches provided roles
 * @param  {...any} Roles that can access the route "Admin, Lead, User"
 * @returns
 */
exports.authoriseRoles = (...Roles) => {
  return (req, res, next) => {
    if (!Roles.includes(req.user.role)) {
      return next(Error(`Role CMI lah, dont waste my time`));
    }
    next();
  };
};
