import { Message } from "./Message";

export type MessageChain = (request: Message) => Promise<Message>;