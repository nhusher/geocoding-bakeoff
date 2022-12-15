import {AWS_KEY} from "../../env.mjs";
import {LocationClient, SearchPlaceIndexForTextCommand} from "@aws-sdk/client-location";
import {eduction, pipe} from "naushon";
import {buffer} from "naushon/dist/buffer.js";
import {throttle} from "../rate_limit.mjs";


const client = new LocationClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: AWS_KEY.AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_KEY.AWS_SECRET_ACCESS_KEY
  }
});

async function geocodeAddress({ address1, city, state, zip }) {
  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: 'stellar_esri',
      Text: `${address1} ${city} ${state} ${zip}`
    })

    const res = await client.send(command);

    return res.Results[0].Place.Geometry.Point;
  } catch (e) {
    console.error('Geocode err', 'aws.esri', address1, city, state, zip, e);
    return [];

  }
}

async function* geocoder(records) {
  for await (const record of records) {
    const [lng, lat] = await geocodeAddress(record);
    yield {...record, "aws.esri.lat": lat, "aws.esri.lng": lng};
  }
}

export default function geocode (records) {
  return eduction(pipe(throttle(50), geocoder, buffer(50)), records)
}

