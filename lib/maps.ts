import type { BoundingBox } from './constants';
import { KO_PHANGAN_BOUNDS } from './constants';

export type Coordinates = {
  lat: number;
  lng: number;
};

/** Checks if coordinates fall inside the supplied bounding box (Ko Phangan by default). */
export function isWithinBounds(coordinates: Coordinates, bounds: BoundingBox = KO_PHANGAN_BOUNDS) {
  return (
    coordinates.lat >= bounds.southWest.lat &&
    coordinates.lat <= bounds.northEast.lat &&
    coordinates.lng >= bounds.southWest.lng &&
    coordinates.lng <= bounds.northEast.lng
  );
}

/** Throws an error when coordinates fall outside the Ko Phangan bounding box. */
export function assertKoPhanganBounds(coordinates: Coordinates) {
  if (!isWithinBounds(coordinates)) {
    throw new Error('Adresse liegt nicht auf Ko Phangan.');
  }
}
