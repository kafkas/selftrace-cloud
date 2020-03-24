import { ClusterObject, Wellbeing } from '.';
import MathUtils from '../util/MathUtils';

interface Cluster extends ClusterObject {}

class Cluster {
  constructor() {
    this.positiveCount = 0;
    this.showingSymptomsCount = 0;
  }

  add(lat: number, lng: number, wellbeing: Wellbeing): void {
    if (this.size() === 0) {
      this.lat = lat;
      this.lng = lng;
    } else {
      this.lat = MathUtils.weightedAvg(this.lat, this.size(), lat, 1);
      this.lng = MathUtils.weightedAvg(this.lng, this.size(), lng, 1);
    }

    if (wellbeing === Wellbeing.ShowingSymptoms) {
      this.showingSymptomsCount++;
    } else {
      // (wellbeing === Wellbeing.TestedPositive)
      this.positiveCount++;
    }
  }

  size(): number {
    return this.positiveCount + this.showingSymptomsCount;
  }
}

export { Cluster };
