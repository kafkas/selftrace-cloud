import { Region, RegionObject, Cluster } from '../data-types';
import { Firestore } from '.';
// import { getAllUnwellInRegionMOCK } from './mock';

/**
 * An algorithm that computes the clusters in a specified region based on the
 * data in users collection.
 */
export async function computeClustersInRegion(regionObj: RegionObject): Promise<Cluster[]> {
  const region = new Region(
    regionObj.latitude,
    regionObj.longitude,
    regionObj.latitudeDelta,
    regionObj.longitudeDelta
  );

  try {
    const unwellUsers = await Firestore.Users.getAllUnwellInRegion(region);

    // Divide the region into sub-regions. Consider it a virtual matrix of regions
    // TODO: Consider increasing these dynamically with zoom level, as users will probably
    // expect less volatility/jumps at higher zoom levels.
    const rowCount = 10;
    const colCount = 8;

    // Create a map where each key is an index, and each value is a Cluster corresponding to a subregion.
    const clusterMap = new Map<number, Cluster>();

    // Iterate through unwell users and add each one to the correct cluster
    unwellUsers.forEach(snapshot => {
      const data = snapshot.data() as Firestore.Users.Doc;

      // By this point lastLocation and wellbeing should both be defined but we can check for extra safety
      if (data.lastLocation && data.wellbeing) {
        const {
          wellbeing,
          lastLocation: { lat, lng },
        } = data;
        const index = region.getSubregionIndex(lat, lng, rowCount, colCount);

        // If the geohash query is done right, index should not be -1 here but we can check for extra safety
        if (index !== -1) {
          if (!clusterMap.has(index)) {
            clusterMap.set(index, new Cluster());
          }
          const cluster = clusterMap.get(index);
          cluster!.add(lat, lng, wellbeing);
        }
      }
    });

    return Array.from(clusterMap.values());
  } catch (err) {
    return Promise.reject(err);
  }
}
