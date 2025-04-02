import mapboxgl from 'mapbox-gl';
import { getGeocode } from './geocodeUtils';

interface AddMarkersParams {
  map: mapboxgl.Map;
  places: Array<{
    id: string;
    name: string;
    image: string;
    country?: string;
  }>;
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>;
  navigate: (path: string) => void;
}

export const addPlaceMarkersToMap = async ({
  map,
  places,
  markersRef,
  navigate
}: AddMarkersParams): Promise<void> => {
  try {
    while (markersRef.current.length) {
      markersRef.current.pop()?.remove();
    }
    if (!places || places.length === 0) return;

    for (const place of places) {
      const locationText = place.country 
        ? `${place.name}, ${place.country}` 
        : place.name;

      const coordinates = await getGeocode(locationText);
      if (!coordinates) continue;

      const markerEl = document.createElement('div');
      markerEl.className = 'marker';
      markerEl.style.width = '24px';
      markerEl.style.height = '24px';
      markerEl.style.backgroundSize = 'cover';
      markerEl.style.backgroundImage = `url(${place.image})`;
      markerEl.style.border = '2px solid white';
      markerEl.style.borderRadius = '50%';
      markerEl.style.cursor = 'pointer';
      markerEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        offset: 25,
        className: 'map-popup'
      }).setHTML(`
        <div style="text-align: center;">
          <strong>${place.name}</strong>
          ${place.country ? `<p>${place.country}</p>` : ''}
          <button class="view-button">View Details</button>
        </div>
      `);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);

      popup.on('open', () => {
        setTimeout(() => {
          const viewButton = document.querySelector('.view-button');
          if (viewButton) {
            viewButton.addEventListener('click', (e) => {
              e.preventDefault();
              navigate(`/place/${place.id}`);
            });
          }
        }, 10);
      });

      markersRef.current.push(marker);
    }
  } catch (error) {
    console.error('Error adding markers to map:', error);
  }
};
