interface customError extends Error {
  statusCode: number;
}

export const errorHandler = (statusCode: number, message: string) => {
  const error = new Error(message) as customError;
  error.statusCode = statusCode;

  return error;
};
