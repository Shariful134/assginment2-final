/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { ZodError } from 'zod';
import config from '../config';
import AppError from '../errors/AppError';
import { TErrorSources } from '../interface/error';
import { handleZodError } from '../errors/handleZodError';
import handleMongooseError from '../errors/handleMongooseError';
import { handleMongooseCastError } from '../errors/handleMongooseCastError';
import { handleDuplicatesError } from '../errors/handleDuplicatesCustError';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  //set default values
  let statusCode = 500;
  let message = 'Somthing went wrong';
  let errorSources: TErrorSources = {
    path: '',
    message: 'Something went wrong!',
  };

  if (error instanceof ZodError) {
    const simplifiedErrror = handleZodError(error);
    statusCode = simplifiedErrror?.statusCode;
    message = simplifiedErrror?.message;
    errorSources = simplifiedErrror?.errorSources;
  } else if (error?.name === 'ValidationError') {
    const simplifiedErrror = handleMongooseError(error);
    statusCode = simplifiedErrror?.statusCode;
    message = simplifiedErrror?.message;
    errorSources = simplifiedErrror?.errorSources;
  } else if (error?.name === 'CastError') {
    const simplifiedErrror = handleMongooseCastError(error);
    statusCode = simplifiedErrror?.statusCode;
    message = simplifiedErrror?.message;
    errorSources = simplifiedErrror?.errorSources;
  } else if (error?.code === 11000) {
    const simplifiedErrror = handleDuplicatesError(error);
    statusCode = simplifiedErrror?.statusCode;
    message = simplifiedErrror?.message;
    errorSources = simplifiedErrror?.errorSources;
  } else if (error instanceof AppError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorSources = {
      path: ' ',
      message: error?.message,
    };
  } else if (error instanceof Error) {
    message = error?.message;
    errorSources = {
      path: ' ',
      message: error?.message,
    };
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode: statusCode,
    error: errorSources,
    stack: config.NODE_ENV === 'development' ? error?.stack : null,
  });
};

export default globalErrorHandler;
