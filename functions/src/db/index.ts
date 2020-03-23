import { firestore, auth } from './helpers';

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
  }
}
