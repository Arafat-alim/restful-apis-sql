const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized User" });
  try {
    const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
    //! attached to req. user
    req.user = decodedJWT;
    next();
  } catch (err) {
    console.log(
      "Something went wrong with the auth middleware function: ",
      err
    );
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};
module.exports = authMiddleware;
