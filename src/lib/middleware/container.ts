import { Context, Next } from "koa";
import { container, DependencyContainer } from "tsyringe";
declare module 'koa' {
   interface DefaultState {
      container: DependencyContainer;
   }
}
export default () => {
   return async (ctx: Context, next: Next) => {
      const child = container.createChildContainer();
      ctx.state['container'] = child;
      await next();
   };
};