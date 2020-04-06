import * as functions from 'firebase-functions';
import ngeohash from 'ngeohash';
import * as DB from './db';

/* eslint-disable no-unused-vars */

export async function convertLastLocationsToGeohash(context: functions.EventContext) {
  try {
    const userDocsList = await DB.Firestore.Users.collection().listDocuments();
    const addHashstringToUserDocs = userDocsList.map(async ({ id: uid }) => {
      const doc = await DB.Firestore.Users.getDoc(uid);
      if (doc) {
        const { lastLocation } = doc;
        if (lastLocation) {
          const hashstring = ngeohash.encode(lastLocation.lat, lastLocation.lng, 8);
          await DB.Firestore.Users.updateDoc(uid, { geohash: hashstring });
        } else {
          await DB.Firestore.Users.updateDoc(uid, { geohash: '' });
        }
      }
    });
    await Promise.all(addHashstringToUserDocs);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

/* eslint-enable no-unused-vars */
