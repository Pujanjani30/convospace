export const successResponse = ({ res, status = 200, message, data = undefined, token = undefined }) => {
  return res
    .status(200)
    .json({
      success: true,
      status,
      message: message || 'Success',
      data,
      token
    })
}

export const errorResponse = ({ res, status = 500, message }) => {
  return res
    .status(status)
    .json({
      success: false,
      status,
      message: message || 'Internal Server Error!'
    })
}