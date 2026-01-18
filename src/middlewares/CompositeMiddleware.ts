import { IMessageTransformer, IProxyMiddleware, Message, MessageChain } from "../types";

export class CompositeMiddleware implements IProxyMiddleware {
  constructor(
    private requestTransformer?: IMessageTransformer,
    private responseTransformer?: IMessageTransformer,
  ) {}
  
  async applyMiddleware(request: Message, next: MessageChain): Promise<Message> {
    if (this.requestTransformer)
      request = await this.requestTransformer.transform(request);

    let response = await next(request);

    if (this.responseTransformer)
      response = await this.responseTransformer.transform(response);

    return response;
  }
}