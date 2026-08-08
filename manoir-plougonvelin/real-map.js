(function () {
  const places = [
    { name: 'Plougonvelin', coords: [48.3407, -4.7189], note: 'Commune du bien. Point communal, pas adresse exacte.', primary: true, permanent: true },
    { name: 'Trez-Hir', coords: [48.3417, -4.7662], note: 'Plage et front de mer.', permanent: true },
    { name: 'Pointe Saint-Mathieu', coords: [48.3304, -4.7702], note: 'Site littoral emblématique.' },
    { name: 'Le Conquet', coords: [48.3605, -4.7745], note: 'Port et pôle voisin.', permanent: true },
    { name: 'Plouzané', coords: [48.3816, -4.6217], note: 'Interface avec le bassin brestois.' },
    { name: 'Brest', coords: [48.3904, -4.4861], note: 'Bassin d’emploi, services et gare.', permanent: true }
  ];

  function replaceSchematicMap() {
    const region = document.getElementById('region');
    if (!region || typeof window.L === 'undefined') return false;

    const card = region.querySelector('.map-card');
    const shell = region.querySelector('.map-shell');
    if (!card || !shell) return false;
    if (shell.dataset.realMapReady === 'true') return true;

    const title = card.querySelector('h3');
    if (title) title.textContent = 'Carte réelle de la pointe du Finistère';

    shell.innerHTML = '<div id="regionRealMap" class="region-real-map" role="img" aria-label="Carte réelle de Plougonvelin, Trez-Hir, Le Conquet, Pointe Saint-Mathieu, Plouzané et Brest"></div>';
    shell.dataset.realMapReady = 'true';

    const legend = card.querySelector('.map-legend');
    if (legend) {
      legend.innerHTML = '<span>Fond cartographique réel</span><span>Localisation communale, non cadastrale</span><span>Cliquer sur les points pour le contexte</span>';
    }

    const isMobile = window.matchMedia('(max-width: 560px)').matches;
    const map = L.map('regionRealMap', {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      dragging: true,
      tap: true
    });

    if (!isMobile) {
      L.control.zoom({ position: 'topright' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    }

    const neutralErrorTile = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e7ecec"/></svg>'
    );

    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        errorTileUrl: neutralErrorTile,
        attribution: 'Tiles &copy; Esri'
      }
    );

    const labels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        errorTileUrl: neutralErrorTile,
        attribution: 'Esri, HERE, Garmin, FAO, NOAA, USGS'
      }
    );

    const osmFallback = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      errorTileUrl: neutralErrorTile,
      attribution: '&copy; OpenStreetMap contributors'
    });

    let fallbackActive = false;
    esri.on('tileerror', function () {
      if (fallbackActive) return;
      fallbackActive = true;
      map.removeLayer(esri);
      map.removeLayer(labels);
      osmFallback.addTo(map);
    });

    esri.addTo(map);
    labels.addTo(map);

    const markers = [];
    places.forEach(function (place) {
      const marker = L.circleMarker(place.coords, {
        radius: place.primary ? 9 : 6,
        color: place.primary ? '#173743' : '#456d72',
        fillColor: place.primary ? '#c79f62' : '#79a49d',
        fillOpacity: 0.96,
        opacity: 1,
        weight: place.primary ? 3 : 2
      }).addTo(map);

      marker.bindPopup('<strong>' + place.name + '</strong><br>' + place.note);
      if (place.permanent) {
        marker.bindTooltip(place.name, {
          permanent: true,
          direction: place.name === 'Brest' ? 'right' : 'top',
          offset: place.name === 'Brest' ? [9, 0] : [0, -8],
          className: 'place-label'
        });
      }
      markers.push(marker);
    });

    L.polyline([
      [48.3904, -4.4861],
      [48.3816, -4.6217],
      [48.3407, -4.7189]
    ], {
      color: '#607f91',
      weight: 3,
      opacity: 0.58,
      dashArray: '7 9'
    }).addTo(map).bindTooltip('Lien avec le bassin brestois', { className: 'place-label' });

    L.polyline([
      [48.3605, -4.7745],
      [48.3417, -4.7662],
      [48.3304, -4.7702]
    ], {
      color: '#9a7657',
      weight: 3,
      opacity: 0.55,
      dashArray: '5 8'
    }).addTo(map).bindTooltip('Arc littoral', { className: 'place-label' });

    L.circle([48.3407, -4.7189], {
      radius: 2500,
      color: '#8ca7aa',
      weight: 1,
      fillColor: '#adc3c4',
      fillOpacity: 0.08,
      dashArray: '4 7'
    }).addTo(map).bindPopup('<strong>Zone de lecture</strong><br>Repère communal et littoral, sans afficher l’adresse exacte du manoir.');

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(isMobile ? 0.12 : 0.17));
    setTimeout(function () { map.invalidateSize(); }, 180);
    return true;
  }

  function boot(attempt) {
    if (replaceSchematicMap()) return;
    if (attempt < 30) setTimeout(function () { boot(attempt + 1); }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(0); });
  } else {
    boot(0);
  }
})();
