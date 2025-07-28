import { IncomingHttpHeaders } from "http";
import { Readable } from "stream";
import { collectDataFromStream } from "../utils";

export class Message {
  private bodyBuffer?: Buffer;
  private bodyStream?: Readable;

  constructor(
    public statusCode: number | undefined,
    public method: string | undefined,
    public url: string | undefined,
    public headers: IncomingHttpHeaders,
    body: Readable | Buffer,
  ) {
    if (Buffer.isBuffer(body))
      this.bodyBuffer = body;
    else
      this.bodyStream = body;
  }

  async getBodyBuffer(): Promise<Buffer> {
    if (this.bodyBuffer)
      return this.bodyBuffer;

    if (!this.bodyStream)
      throw new Error("Body is missing");

    return this.bodyBuffer = await collectDataFromStream(this.bodyStream);
  }

  async getBodyStream(saveCopy?: boolean): Promise<Readable> {
    if (this.bodyBuffer)
      return Readable.from(this.bodyBuffer);

    if (saveCopy)
      return Readable.from(await this.getBodyBuffer());

    if (!this.bodyStream)
      throw new Error("Body is missing");

    const res = this.bodyStream;
    this.bodyStream = undefined;
    return res;
  }

  withBody(body: Readable | Buffer): this {
    if (Buffer.isBuffer(body)) {
      this.bodyBuffer = body;
      this.bodyStream = undefined;
    } else {
      this.bodyBuffer = undefined;
      this.bodyStream = body;
    }

    return this;
  }
}
