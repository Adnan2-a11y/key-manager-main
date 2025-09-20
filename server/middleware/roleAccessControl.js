const checkUserRole = (requiredRole) => (req, res, next) => {
  if (!requiredRole.includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied. If this is an error, please contact the admin." });
  }
  next();
};

module.exports = checkUserRole;
