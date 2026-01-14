import { NextApiRequest, NextApiResponse } from "next";
import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "./errors";

async function onErrorHandler(
  error: unknown,
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const errorConstructorObject = {
    cause: error,
    statusCode: undefined,
  };

  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

  if (
    typeof error == "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    errorConstructorObject.statusCode = error.statusCode;
  }

  const publicErrorObject = new InternalServerError(errorConstructorObject);
  console.error(publicErrorObject);
  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function onNoMatchHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const publicResponseObject = new MethodNotAllowedError();
  response.status(publicResponseObject.statusCode).json(publicResponseObject);
}

const controller = {
  defaultHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
