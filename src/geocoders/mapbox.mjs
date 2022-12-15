import { MAPBOX_KEY } from "../../env.mjs";
import {eduction, pipe} from "naushon";
import {buffer} from "naushon/dist/buffer.js";
import {throttle} from "../rate_limit.mjs";

async function geocodeAddress({ address1, city, state, zip }) {
  try {
    const searchString = encodeURIComponent(`${address1} ${city} ${state} ${zip}`);
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchString}.json`)
    url.searchParams.append('access_token', MAPBOX_KEY);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(res.status, res.statusText);
    }

    const body = await res.json();

    return body.features[0].geometry.coordinates;
  } catch (e) {
    console.error('Geocode err', 'mapbox', address1, city, state, zip, e);
    return [];
  }
}

async function* geocoder(records) {
  for await (const record of records) {
    const [lng, lat] = await geocodeAddress(record);
    yield {...record, "mapbox.lat": lat, "mapbox.lng": lng};
  }
}

export default function geocode (records) {
  return eduction(pipe(throttle(10), geocoder, buffer(10)), records)
}
