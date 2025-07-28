import http from "http";
import { ILogger, IProxyMiddleware, Message, MessageChain } from "./types";
import { httpMessageToMessage } from "./utils";

export abstract class ProxyBase {
  private middlewareChain: MessageChain;

  protected requestListener: http.RequestListener;

  constructor(
    protected logger?: ILogger,
  ) {
    this.middlewareChain = (req) => this.performRequestToTarget(req);

    this.requestListener = async (req, res) => {
      const response = await this.middlewareChain(httpMessageToMessage(req));
      await this.pipeMessageToResponse(response, res);
    };
  }

  use(middleware: IProxyMiddleware): this {
    const chain = this.middlewareChain;
    this.middlewareChain = (req) => {
      return middleware.applyMiddleware(req, chain);
    };
    return this;
  }

  protected abstract performRequestToTarget(req: Message): Promise<Message>;

  private async pipeMessageToResponse(message: Message, response: http.ServerResponse) {
    response.writeHead(message.statusCode!, message.headers);
    (await message.getBodyStream()).pipe(response);
  }
}