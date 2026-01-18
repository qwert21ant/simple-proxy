import { createGunzip, createGzip } from "zlib";
import { ILogger, IMessageTransformer, Message } from "../types";

export class GzipTransformer implements IMessageTransformer {
  constructor(
    private type: "zip" | "unzip",
    private logger?: ILogger,
  ) {}

  async transform(message: Message): Promise<Message> {
    return message.headers["content-encoding"] === "gzip"
      ? message.withBody((await message.getBodyStream()).pipe(this.type === "zip" ? createGzip() : createGunzip()))
      : message;
  }
}