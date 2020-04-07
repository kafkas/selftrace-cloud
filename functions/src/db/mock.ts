import { Firestore } from '.';
import { Region } from '../data-types';
import MathUtils from '../util/MathUtils';

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

function createRandomUsers(count: number): Firestore.Users.Doc[] {
  const users = new Array<Firestore.Users.Doc>(count);
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
