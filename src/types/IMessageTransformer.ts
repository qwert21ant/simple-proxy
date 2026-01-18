import { Message } from "./Message";

export interface IMessageTransformer {
  transform(message: Message): Promise<Message>
}