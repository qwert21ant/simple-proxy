import { createGunzip, createGzip } from "zlib";
import { ILogger, IProxyMiddleware, Message, MessageChain } from "../types";

export class GzipMiddleware implements IProxyMiddleware {
  constructor(
    private outgoing: "zip" | "unzip",
    private incoming: "zip" | "unzip",
    private logger?: ILogger,
  ) {}

  async applyMiddleware(request: Message, next: MessageChain): Promise<Message> {
    this.logger?.info(`outgoing GzipLinearMiddleware, ${this.outgoing}`);

    const response = await next(
      request.headers["content-encoding"] === "gzip"
      ? request.withBody((await request.getBodyStream()).pipe(this.outgoing === "zip" ? createGzip() : createGunzip()))
      : request,
    );

    this.logger?.info(`incoming GzipLinearMiddleware, ${this.incoming}`);

    return response.headers["content-encoding"] === "gzip"
      ? response.withBody((await response.getBodyStream()).pipe(this.incoming === "zip" ? createGzip() : createGunzip()))
      : response;
  }
}