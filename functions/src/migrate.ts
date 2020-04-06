import * as functions from 'firebase-functions';
import ngeohash from 'ngeohash';
import * as DB from './db';

/**
 * This function is supposed to be executed only once but I couldn't find
 * a way to schedule a one time task as .schedule() doesn't seem to accept
 * `at` commands. The temporary workaround is to schedule a cron job and
 * delete it from the console after execution.
 */
export const migrationHandler = functions.pubsub
  .schedule('20 16 6 4 1')
  .timeZone('Europe/Istanbul')
  .onRun(async () => {
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
  });
