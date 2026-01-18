import { ILogger, IMessageTransformer, Message } from "../types";

export class ContentLengthCalcTransformer implements IMessageTransformer {
  constructor(
    private logger?: ILogger,
    private force: boolean = false,
  ) {}

  async transform(message: Message): Promise<Message> {
    if (!message.headers["content-length"] && !this.force)
      return message;

    const requestData = await message.getBodyBuffer();

    message.headers["content-length"] = requestData.length.toString();

    return message;
  }
}