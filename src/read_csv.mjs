import {createReadStream} from "node:fs";
import {parse} from "@fast-csv/parse";

// Reads the provider CSV as a stream of rows, first line is expected to be the header:
export function readCsv() {
  return createReadStream('./providers.csv', 'utf-8').pipe(parse({headers: true}))
}