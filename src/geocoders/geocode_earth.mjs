import {eduction, pipe} from 'naushon';
import {buffer} from "naushon/dist/buffer.js";
import {throttle} from "../rate_limit.mjs";
import {GEOCODE_EARTH_KEY} from "../../env.mjs";

async function geocodeAddress({address1, city, state, zip}) {
  try {
    const url = new URL('https://api.geocode.earth/v1/search/structured')
    url.searchParams.append('api_key', GEOCODE_EARTH_KEY);
    url.searchParams.append('address', address1);
    url.searchParams.append('locality', city);
    url.searchParams.append('region', state);
    url.searchParams.append('postalcode', zip);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(res.status, res.statusText);
    }

    const body = await res.json();

    return body.features[0].geometry.coordinates; // [lng, lat]
  } catch (e) {
    console.error('Geocode err', 'geocode.earth', address1, city, state, zip, e);
    return [];
  }
}

async function* geocoder(records) {
  for await (const record of records) {
    const [lng, lat] = await geocodeAddress(record);
    yield {...record, "geocode.earth.lat": lat, "geocode.earth.lng": lng};
  }
}

export default function geocode (records) {
  return eduction(pipe(throttle(10), geocoder, buffer(10)), records)
}
