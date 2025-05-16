const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "You need to login first");
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    if (!decoded.email) {
      req.flash("error", "Invalid token.");
      return res.redirect("/");
    }

    const user = await userModel.findOne({ email: decoded.email }).select("-password");

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/");
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    req.flash("error", "Session expired or invalid.");
    res.redirect("/");
  }
};
