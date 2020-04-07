import ngeohash from 'ngeohash';
import { firestore, auth } from './helpers';
import { Region, Wellbeing } from '../data-types';

export const Auth = auth();

export namespace Firestore {
  export namespace Users {
    export const collection = () => firestore().collection('users');

    const document = (uid: string) => collection().doc(uid);

    export interface Doc {
      email: string;
      geohash?: string;
      lastLocation?: {
        lat: number;
        lng: number;
      };
      wellbeing?: number;
    }

    export async function getDoc(uid: string) {
      try {
        const doc = await document(uid).get();
        const data = doc.data();
        return Promise.resolve(data ? (data as Doc) : undefined);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    export function setDoc(uid: string, doc: Doc) {
      return document(uid).set(doc);
    }

    export function updateDoc(uid: string, partialDoc: Partial<Doc>) {
      return document(uid).update(partialDoc);
    }

    export function deleteDoc(uid: string) {
      return document(uid).delete();
    }

    export async function getAllUnwellInRegion(region: Region) {
      try {
        const minGeohash = ngeohash.encode(region.bottomLat(), region.leftLng());
        const maxGeohash = ngeohash.encode(region.topLat(), region.rightLng());
        const unwellUsersSnapshot = await collection()
          .where('geohash', '>=', minGeohash)
          .where('geohash', '<=', maxGeohash)
          .where('wellbeing', 'in', [Wellbeing.ShowingSymptoms, Wellbeing.TestedPositive])
          .get();
        return Promise.resolve(unwellUsersSnapshot.docs);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
}

export * from './clusters';
