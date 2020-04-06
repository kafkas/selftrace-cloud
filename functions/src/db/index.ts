import ngeohash from 'ngeohash';
import { firestore, auth } from './helpers';
import { Region, Wellbeing } from '../data-types';
import MathUtils from '../util/MathUtils';

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
        const unwellUsersSnapshot = await collection()
          .where('wellbeing', 'in', [Wellbeing.ShowingSymptoms, Wellbeing.TestedPositive])
          .get();
        const unwellUsersInRegion = unwellUsersSnapshot.docs.filter(snap => {
          const userDoc = snap.data() as Doc;
          if (!userDoc.lastLocation) return false;
          const { lat, lng } = userDoc.lastLocation;
          return region.contains(lat, lng);
        });

        return Promise.resolve(unwellUsersInRegion);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    export async function getAllUnwellInRegionOptimized(region: Region) {
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

    const mockUsers = createRandomUsers(25000); // Treat as DB

    // TODO: Do this properly. Probably will need to introduce Jest.
    export async function getAllUnwellInRegionMOCK(region: Region) {
      try {
        const usersInRegion = mockUsers.filter(user => {
          const { lat, lng } = user.lastLocation!;
          return region.contains(lat, lng);
        });

        const results = usersInRegion.map(user => ({
          data: () => ({ ...user }),
        }));

        return results;
      } catch (err) {
        return Promise.reject(err);
      }
    }

    function createRandomUsers(count: number): Doc[] {
      const users = new Array<Doc>(count);
      for (let i = 0; i < count; i++) {
        const wellbeing = Math.random() < 0.5 ? 2 : 4;
        users[i] = {
          email: '_',
          lastLocation: {
            lat: MathUtils.generateRandomNumber(-89, 89),
            lng: MathUtils.generateRandomNumber(-179, 179),
          },
          wellbeing,
        };
      }
      return users;
    }
  }
}

export * from './clusters';
