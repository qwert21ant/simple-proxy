export type RedirectSupplier = (url: URL) => {
  host: string;
  port: number;
};