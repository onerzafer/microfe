import * as rawbody from 'raw-body';
import { createParamDecorator, HttpException, HttpStatus } from '@nestjs/common';

export const Plain = createParamDecorator(async (data, req) => {
  if (req.readable) {
      return (await rawbody(req)).toString().trim();
  }
  throw new HttpException(
      'Body is not text/plain',
    HttpStatus.INTERNAL_SERVER_ERROR
  );
});
