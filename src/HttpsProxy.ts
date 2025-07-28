import https from "https";
import http from "http";
import { ProxyBase } from "./ProxyBase";
import { ILogger, Message } from "./types";
import { httpMessageToMessage } from "./utils";

export class HTTPSProxy extends ProxyBase {
  private server?: https.Server;

  constructor(
    private options?: https.ServerOptions,
    logger?: ILogger,
  ) {
    super(logger);
  }

  listen(port?: number, listeningListener?: () => void) {
    if (this.server) throw new Error("Already listening");

    this.server = https.createServer(this.options ?? {}, this.requestListener);
    this.server.listen(port, listeningListener);
  }

  close() {
    if (!this.server) return;

    this.server.close();
    this.server = undefined;
  }

  protected async performRequestToTarget(req: Message): Promise<Message> {
    this.logger?.info(`performRequestTo ${req.headers.host} ${req.url}`);

    return new Promise(async (resolve, reject) => {
      const options: http.RequestOptions = {
        hostname: req.headers.host,
        path: req.url,
        port: 443,
        headers: req.headers,
        method: req.method,
      };

      const clientRequest = https.request(options, (res) => {
        this.logger?.info(`revieve response: ${res.statusCode}`);

        resolve(httpMessageToMessage(res));
      });
      (await req.getBodyStream()).pipe(clientRequest);
    });
  }
}
