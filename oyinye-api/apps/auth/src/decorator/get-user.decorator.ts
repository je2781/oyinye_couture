import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    if(ctx.getType() === 'http'){

      const request = ctx.switchToHttp().getRequest();
      if(data){
        return request.user[data];
      }
      return request.user;
    }

    if(ctx.getType() === 'rpc'){
      return ctx.switchToRpc().getData().user;
    }
  },
);