import { Readable } from "stream";
import { collectDataFromStream } from "../src/utils";

(async () => {
  const buff = Buffer.from("12345");
  const s1 = Readable.from(buff);

  const data1 = await collectDataFromStream(Readable.from(s1));
  console.log(data1);

  const data2 = await collectDataFromStream(Readable.from(s1));
  console.log(data2);


})();