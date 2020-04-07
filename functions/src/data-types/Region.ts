import { RegionObject } from '.';

/*
 * lat: [-90, 90] (parallel)
 * lng: [-180, 180] (meridian)
 */

interface Region extends RegionObject {}

class Region {
  constructor(centerLat: number, centerLng: number, latDelta: number, lngDelta: number) {
    this.latitude = centerLat;
    this.longitude = centerLng;
    this.latitudeDelta = latDelta;
    this.longitudeDelta = lngDelta;
  }

  contains(lat: number, lng: number): boolean {
    if (lat > this.topLat() || lat < this.bottomLat()) {
      return false;
    }

    if (lng > this.rightLng() || lng < this.leftLng()) {
      return false;
    }

    return true;
  }

  topLat(): number {
    return this.latitude + this.latitudeDelta;
  }

  bottomLat(): number {
    return this.latitude - this.latitudeDelta;
  }

  leftLng(): number {
    return this.longitude - this.longitudeDelta;
  }

  rightLng(): number {
    return this.longitude + this.longitudeDelta;
  }

  /**
   * Virtually divides the region into `rowCount` rows and `colCount` columns, while the
   * indices of the resulting subregions start from zero, increasing from left to right
   * and top to bottom. Returns the index of the subregion that contains `(lat, lng)`.
   *
   * @returns An integer between 0 and `rowCount x colCount - 1` (both inclusive) if
   * `(lat, lng)` is within this region, -1 otherwise.
   */
  getSubregionIndex(lat: number, lng: number, rowCount: number, colCount: number): number {
    if (!this.contains(lat, lng)) {
      return -1;
    }

    const srh = this.height() / rowCount;
    const srw = this.width() / colCount;

    const distToTopLat = this.topLat() - lat;
    const rowIndex = Math.floor(distToTopLat / srh);

    const distToLeftLng = lng - this.leftLng();
    const colIndex = Math.floor(distToLeftLng / srw);

    return rowIndex * colCount + colIndex;
  }

  /**
   * @returns The height of the region (in latitudes).
   */
  private height(): number {
    return 2 * this.latitudeDelta;
  }

  /**
   * @returns The width of the region (in longitudes).
   */
  private width(): number {
    return 2 * this.longitudeDelta;
  }

  getSubregions(rowCount: number, colCount: number): Region[] {
    const count = rowCount * colCount;

    const hh = this.latitudeDelta / rowCount;
    const h = 2 * hh;
    const hw = this.longitudeDelta / colCount;
    const w = 2 * hw;

    const subregions = new Array<Region>(count);
    for (let i = 0; i < subregions.length; i++) {
      const centerLat = this.topLat() - hh - h * Math.floor(i / colCount);
      const centerLng = this.leftLng() + hw + w * (i % colCount);
      subregions[i] = new Region(centerLat, centerLng, hh, hw);
    }
    return subregions;
  }
}

export { Region };
