import * as functions from 'firebase-functions';
import * as DB from './db';
import { RegionObject } from './data-types';

/*
 * Users
 */

/**
 * Creates a new doc in users collections after a user signs up.
 */
exports.processUserCreation = functions.auth.user().onCreate(async ({ email, uid }) => {
  try {
    await DB.Firestore.Users.setDoc(uid, { email: email! });

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
});

/**
 * Deletes the corresponding doc in users collection after a user deletes their account.
 */
exports.processUserDeletion = functions.auth.user().onDelete(async ({ uid }) => {
  try {
    // Delete user document and all nested data.
    await DB.Firestore.Users.deleteDoc(uid);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
});

/**
 * Fires when a user updates their details. Updates the user details with Firebase
 * Authentication based on the updated Firestore doc to ensure consistency.
 *
 * Note: This is based on the Firestore document as it is not currently possible to
 * react to Firebase Authentication directly.
 */
exports.processUserUpdate = functions.firestore
  .document('users/{userID}')
  .onUpdate(async ({ before, after }) => {
    const uid = after.id;
    const userDocBefore = before.data() as DB.Firestore.Users.Doc;
    const userDocAfter = after.data() as DB.Firestore.Users.Doc;

    try {
      // Update Firebase Auth email so it is consistent with Firestore
      if (userDocBefore.email !== userDocAfter.email) {
        await DB.Auth.updateUser(uid, { email: userDocAfter.email });
      }

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  });

/**
 * An HTTP function that computes and returns to the client the clusters associated with
 * a specified region, upon the client's request.
 */
exports.processClusterRequest = functions.https.onRequest(async (request, response) => {
  interface ClusterRequestBody {
    region: RegionObject;
  }

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
