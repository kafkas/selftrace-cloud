import * as functions from 'firebase-functions';
import * as DB from './db';
import { RegionObject } from './data-types';

interface ClusterRequestBody {
  region: RegionObject;
}

/**
 * An HTTP function that computes and returns to the client the clusters associated with
 * a specified region, upon the client's request.
 */
export const clusterRequestHandler = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(400).send('This endpoint accepts only POST requests.');
    return;
  }

  const { region: regionObj } = request.body as ClusterRequestBody;

  try {
    const clusters = await DB.computeClustersInRegion(regionObj);
    response.status(200).send(clusters);
    return;
  } catch (err) {
    response.status(400).send('Could not get clusters.');
  }
});
