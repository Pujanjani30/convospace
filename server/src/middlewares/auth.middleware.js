import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/httpResponse.js'
import { verifyJwtToken } from '../utils/jwtToken.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return errorResponse({
      res,
      status: 401,
      message: "Unauthorized access."
    });
  }

  try {
    const decoded = verifyJwtToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse({
      res,
      status: 401,
      message: "Invalid or expired token."
    });
  }

}