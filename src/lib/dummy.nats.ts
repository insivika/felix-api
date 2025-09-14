class DummyNatsConsumer {
   public async consume() {
      return [];
   }
}
class DummyNatsConsumers {
   get() {
      return new DummyNatsConsumer();
   }
}
export default class DummyNats {
   public consumers: DummyNatsConsumers;
   constructor() {
      this.consumers = new DummyNatsConsumers();
   }
   async publish() {
      return;
   }
}