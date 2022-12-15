import {Readable} from 'node:stream';
import {createWriteStream} from 'node:fs';
import {format} from '@fast-csv/format';
import {eduction, pipe, take} from 'naushon'

import geocodeEarth from './src/geocoders/geocode_earth.mjs';
import mapbox from './src/geocoders/mapbox.mjs';
import awsEsri from './src/geocoders/aws_esri.mjs'
import awsHere from './src/geocoders/aws_here.mjs'
import smarty from './src/geocoders/smarty.mjs'

import {readCsv} from "./src/read_csv.mjs";

async function main() {
  const records = readCsv();

  const rs = pipe(
    take(1),
    mapbox,
    geocodeEarth,
    awsEsri,
    awsHere,
    smarty
  )

  Readable.from(eduction(rs, records)).pipe(format({
    headers: true,
    writeHeaders: true
  })).pipe(createWriteStream('./out.csv'))
}

main();