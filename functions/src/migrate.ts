import * as functions from 'firebase-functions';
import ngeohash from 'ngeohash';
import * as DB from './db';

/**
 * This function is supposed to be executed only once but I couldn't find a way to schedule a
 * one time task as .schedule() doesn't seem to accept `at` commands. The temporary workaround
 * is to schedule a cron job and delete it from the console after execution.
 */
export const migrationHandler = functions.pubsub
  .schedule('37 17 7 4 2')
  .timeZone('Europe/Istanbul')
  .onRun(async () => {
    try {
      const userDocsList = await DB.Firestore.Users.collection().listDocuments();
      const addHashstringToUserDocs = userDocsList.map(async ({ id: uid }) => {
        const doc = await DB.Firestore.Users.getDoc(uid);
        if (doc) {
          const { email, lastLocation, wellbeing } = doc;
          const newUserDoc: DB.Firestore.Users.Doc = { email };

          if (lastLocation) {
            const hashstring = ngeohash.encode(lastLocation.lat, lastLocation.lng, 8);
            newUserDoc.lastLocation = lastLocation;
            newUserDoc.geohash = hashstring;
          }

          if (wellbeing) {
            newUserDoc.wellbeing = wellbeing;
          }

          await DB.Firestore.Users.setDoc(uid, newUserDoc);
        }
      });
      await Promise.all(addHashstringToUserDocs);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  });
