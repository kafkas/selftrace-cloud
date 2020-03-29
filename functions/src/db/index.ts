import { firestore, auth } from './helpers';
import { Region, Wellbeing } from '../data-types';
import MathUtils from '../util/MathUtils';

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
