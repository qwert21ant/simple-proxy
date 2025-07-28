import { Message } from "./Message";
import { MessageChain } from "./MessageChain";

export interface IProxyMiddleware {
  applyMiddleware(request: Message, next: MessageChain): Promise<Message>
}
