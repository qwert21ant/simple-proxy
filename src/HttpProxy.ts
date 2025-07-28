import http from "http";
import net from "net";
import { ProxyBase } from "./ProxyBase";
import { RedirectSupplier } from "./types/RedirectSupplier";
import { ILogger, Message } from "./types";
import { httpMessageToMessage } from "./utils";

export class HTTPProxy extends ProxyBase {
  private server?: http.Server;

  constructor(
    private redirectSupplier: RedirectSupplier,
    private options?: http.ServerOptions,
    logger?: ILogger,
  ) {
    super(logger);
  }

  listen(port?: number, listeningListener?: () => void) {
    if (this.server) throw new Error("Already listening");

    this.server = http.createServer(this.options ?? {}, this.requestListener);
  
    this.server.on("connect", (req, clientSocket, head) => {
      const redirectTo = this.redirectSupplier(new URL("http://" + req.url));
      this.logger?.info(`connect to ${req.url} -> redirect to ${redirectTo.host}:${redirectTo.port}`);

      const proxySocket = net.connect(redirectTo.port, redirectTo.host, () => {
        proxySocket.write(head);
        clientSocket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
      });

      proxySocket.pipe(clientSocket);
      proxySocket.on('error', (err) => {
        this.logger?.error(`proxy socker error: ${err.message}\n`);

        clientSocket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
        clientSocket.end();
      });

      clientSocket.pipe(proxySocket);
      clientSocket.on('error', (err: Error) => {
        this.logger?.error(`client socker error: ${err.message}\n`);

        proxySocket.end();
      });
    });

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
        port: 80,
        headers: req.headers,
        method: req.method,
      };

      const clientRequest = http.request(options, (res) => {
        this.logger?.info(`revieve response: ${res.statusCode}`);

        resolve(httpMessageToMessage(res));
      });
      (await req.getBodyStream()).pipe(clientRequest);
    });
  }
}