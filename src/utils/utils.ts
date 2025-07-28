import { IncomingMessage } from "http";
import { Message } from "../types";

export function httpMessageToMessage(msg: IncomingMessage): Message {
  return new Message(
    msg.statusCode,
    msg.method,
    msg.url,
    msg.headers,
    msg,
  );
}