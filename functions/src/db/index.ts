import { firestore, auth } from './helpers';
import { Region, Wellbeing } from '../data-types';

export const Auth = auth();

export namespace Firestore {
  export namespace Users {
    const usersCollection = () => firestore().collection('users');

    const userDoc = (uid: string) => usersCollection().doc(uid);

    export interface Doc {
      email: string;
      lastLocation?: {
        lat: number;
        lng: number;
      };
      wellbeing?: number;
    }

    export function setDoc(uid: string, doc: Doc) {
      return userDoc(uid).set(doc);
    }

    export function updateDoc(uid: string, partialDoc: Partial<Doc>) {
      return userDoc(uid).update(partialDoc);
    }

    export function deleteDoc(uid: string) {
      return userDoc(uid).delete();
    }

    export async function getAllUnwellInRegion(region: Region) {
      try {
        const unwellUsersSnapshot = await usersCollection()
          .where('wellbeing', 'in', [Wellbeing.ShowingSymptoms, Wellbeing.TestedPositive])
          .get();
        const unwellUsersInRegion = unwellUsersSnapshot.docs.filter(snap => {
          const userDoc = snap.data() as Doc;
          const { lat, lng } = userDoc.lastLocation!;
          return region.contains(lat, lng);
        });

        return Promise.resolve(unwellUsersInRegion);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
}

export * from './clusters';
