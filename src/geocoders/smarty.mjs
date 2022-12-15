import SmartySDK from 'smartystreets-javascript-sdk'

import { SMARTY_KEY } from "../../env.mjs";
import {eduction, pipe} from "naushon";
import {buffer} from "naushon/dist/buffer.js";
import {throttle} from "../rate_limit.mjs";

const SmartyCore = SmartySDK.core;
const Lookup = SmartySDK.usStreet.Lookup;

const credentials = new SmartyCore.StaticCredentials(SMARTY_KEY.AUTH_ID, SMARTY_KEY.AUTH_TOKEN);
const clientBuilder = new SmartyCore.ClientBuilder(credentials).withBaseUrl("https://us-street.api.smartystreets.com/street-address") //.withLicenses(["us-rooftop-geocoding-cloud"]);
const client = clientBuilder.buildUsStreetApiClient();

async function geocodeAddress({ address1, city, state, zip }) {
  try {
    const lookup = new Lookup();
    lookup.street = address1;
    lookup.city = city;
    lookup.state = state;
    lookup.zip = zip;
    lookup.match = 'strict';
    lookup.maxCandidates = 1;

    const res = await client.send(lookup);

    const { longitude, latitude } = res.lookups[0].result[0].metadata;

    return [ longitude, latitude ];
  } catch (e) {
    console.error('Geocode err', 'smarty', address1, city, state, zip, e);
    return [];
  }
}

async function* geocoder(records) {
  for await (const record of records) {
    const [lng, lat] = await geocodeAddress(record);
    yield {...record, "smarty.lat": lat, "smarty.lng": lng};
  }
}

export default function geocode (records) {
  return eduction(pipe(throttle(10), geocoder, buffer(10)), records)
}
