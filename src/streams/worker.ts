import { JsMsg } from "@nats-io/jetstream";
export default class StreamWorker {
   protected eventMap = new Map();
   async process(message: JsMsg) {
      try {
         message.working();
         if (this.eventMap.has(message.subject)) {
            const handler = this.eventMap.get(message.subject);
            await handler(message);
            message.ack();
            return;
         }
         message.term();
      } catch (e) {
         console.error(e);
         message.nak();
      }
   }
}