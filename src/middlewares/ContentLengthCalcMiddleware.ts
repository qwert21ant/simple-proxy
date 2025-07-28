import { ILogger, IProxyMiddleware, Message, MessageChain } from "../types";

export class ContentLengthCalcMiddleware implements IProxyMiddleware {
  constructor(
    private logger?: ILogger,
  ) {}
  
  async applyMiddleware(request: Message, next: MessageChain): Promise<Message> {
    const requestData = await request.getBodyBuffer();
    request.headers["content-length"] = requestData.length.toString();

    this.logger?.info("outgoing ContentLengthCalcMiddleware");

    const response = await next(request);

    this.logger?.info("incoming ContentLengthCalcMiddleware");

    const responseData = await response.getBodyBuffer();
    response.headers["content-length"] = responseData.length.toString();

    return response;
  }
}