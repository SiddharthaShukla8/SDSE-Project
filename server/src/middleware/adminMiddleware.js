const adminAccess = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" ||
      req.user.role === "theaterOwner" ||
      req.user.name === "Guest Admin")
  ) {
    return next();
  }

  return res.status(403).json({
    message: "Admin or Theater Owner access only",
  });
};

module.exports = adminAccess;
module.exports.adminAccess = adminAccess;
