import { Region, RegionObject, Cluster, ClusterObject } from '../data-types';
import { Firestore } from '.';

/**
 * A brute-force algorithm that computes the clusters in a specified region
 * based on the data in users collection.
 *
 * TODO: This needs to be optimized as it is highly inefficient currently.
 * We will probably need to cache the clusters and use geohashing.
 */
export async function computeClustersInRegion(regionObj: RegionObject): Promise<ClusterObject[]> {
  const region = new Region(
    regionObj.latitude,
    regionObj.longitude,
    regionObj.latitudeDelta,
    regionObj.longitudeDelta
  );

  try {
    const unwellUsers = await Firestore.Users.getAllUnwellInRegion(region);

    // Divide into sub-regions. Consider it a virtual matrix of regions
    const subregions = region.getSubregions(10, 8);

    // For each sub-region create a Cluster object
    const clusters = subregions.map(() => new Cluster());

    // Iterate through unwell users and put each one into the correct cluster
    unwellUsers.forEach(snapshot => {
      const data = snapshot.data() as Firestore.Users.Doc;

      if (data.lastLocation && data.wellbeing) {
        const { lat, lng } = data.lastLocation;
        const { wellbeing } = data;

        let index = subregions.findIndex(sr => sr.contains(lat, lng));
        if (index === -1) {
          index = 0;
        }
        const cluster = clusters[index];
        cluster.add(lat, lng, wellbeing);
      }
    });

    const nonEmptyClusters = clusters.filter(cluster => cluster.size() > 0);

    return Promise.resolve(nonEmptyClusters);
  } catch (err) {
    return Promise.reject(err);
  }
}
