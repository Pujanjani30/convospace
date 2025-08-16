import jwt from "jsonwebtoken"

const jwt_secret = process.env.JWT_SECRET;
const maxAge = 3 * 24 * 60 * 60 * 1000;

export const generateJwtToken = ({ userId, email }) => {
  return jwt.sign({ userId, email }, jwt_secret, { expiresIn: maxAge })
}

export const verifyJwtToken = (token) => {
  return jwt.verify(token, jwt_secret);
}