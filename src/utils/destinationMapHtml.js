const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export function createDestinationMapHtml(destinations) {
  const places = destinations.filter(({ latitude, longitude }) =>
    latitude !== null && latitude !== undefined && latitude !== ''
    && longitude !== null && longitude !== undefined && longitude !== ''
    && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    && Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180
  ).map(({ name, latitude, longitude }) => ({
    name,
    latitude: Number(latitude),
    longitude: Number(longitude),
  }));
  const serializedPlaces = JSON.stringify(places).replace(/</g, '\\u003c');
  const serializedToken = JSON.stringify(MAPBOX_ACCESS_TOKEN);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css" rel="stylesheet">
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; }
      .map-message {
        position: absolute; z-index: 1; top: 12px; left: 12px; right: 12px;
        padding: 10px 12px; border-radius: 8px; background: #fff;
        color: #14232a; font: 14px system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="map" aria-label="Map showing destination locations"></div>
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js"></script>
    <script>
      const accessToken = ${serializedToken};
      const places = ${serializedPlaces};
      const message = document.createElement('div');
      message.className = 'map-message';
      message.hidden = true;
      document.body.appendChild(message);
      if (!accessToken) {
        message.hidden = false;
        message.textContent = 'Mapbox is not configured. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN and restart Expo.';
      } else {
        mapboxgl.accessToken = accessToken;
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [121.1, 14.1],
          zoom: 7
        });
        map.on('error', (event) => {
          message.hidden = false;
          message.textContent = 'Mapbox could not load the map: '
            + ((event.error && event.error.message) || 'check the token and internet connection.');
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        const bounds = new mapboxgl.LngLatBounds();
        places.forEach((place) => {
          const popupContent = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = place.name;
          popupContent.appendChild(title);
          const marker = new mapboxgl.Marker({ color: '#0F4C5C' })
            .setLngLat([place.longitude, place.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 24 }).setDOMContent(popupContent))
            .addTo(map);
          bounds.extend(marker.getLngLat());
        });
        if (places.length === 1) {
          map.setCenter([places[0].longitude, places[0].latitude]);
          map.setZoom(12);
        } else if (places.length > 1) {
          map.fitBounds(bounds, { padding: 40, maxZoom: 12 });
        }
      }
    </script>
  </body>
</html>`;
}
