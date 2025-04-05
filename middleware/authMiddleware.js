import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const tokenWithoutBearer = token.split(' ')[1];

  if (!tokenWithoutBearer) {
    return res.status(401).json({ message: "Unauthorized: Token format is incorrect" });
  }

  try {
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
