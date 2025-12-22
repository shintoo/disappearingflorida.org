// Central index of all available locations
// This provides a single source of truth for which locations exist
// and their basic metadata for map display

export const LOCATIONS = [
  {
    id: 'mtdora',
    dataPath: '/data/locations/mtdora.json'
  },
  {
    id: 'the-villages',
    dataPath: '/data/locations/the-villages.json'
  },
  {
    id: 'debary',
    dataPath: '/data/locations/debary.json'
  }
];

/**
 * Fetches metadata for all locations (name, coordinates, thumbnail)
 * Used for rendering the map without loading full timeline data
 */
export async function fetchAllLocationsMetadata() {
  const locationPromises = LOCATIONS.map(async ({ id, dataPath }) => {
    try {
      const response = await fetch(dataPath);
      if (!response.ok) {
        console.warn(`Failed to fetch location: ${id}`);
        return null;
      }
      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        thumbnail_url: data.thumbnail_url,
        county: data.county,
        ecosystem_type: data.ecosystem_type
      };
    } catch (err) {
      console.error(`Error loading location ${id}:`, err);
      return null;
    }
  });

  const results = await Promise.all(locationPromises);
  return results.filter(location => location !== null);
}

/**
 * Fetches full data for a single location by ID
 */
export async function fetchLocationById(locationId) {
  const location = LOCATIONS.find(loc => loc.id === locationId);
  if (!location) {
    throw new Error(`Location ${locationId} not found`);
  }

  const response = await fetch(location.dataPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch location ${locationId}`);
  }

  return await response.json();
}
