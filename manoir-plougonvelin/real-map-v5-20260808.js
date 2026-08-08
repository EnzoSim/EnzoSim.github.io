(function () {
  'use strict';

  const places = [
    { name: 'Plougonvelin', coords: [48.3407, -4.7189], note: 'Commune du bien. Repère communal, sans afficher l’adresse exacte.', primary: true },
    { name: 'Trez-Hir', coords: [48.3417, -4.7662], note: 'Plage et front de mer.' },
    { name: 'Pointe Saint-Mathieu', coords: [48.3304, -4.7702], note: 'Site littoral emblématique.' },
    { name: 'Le Conquet', coords: [48.3605, -4.7745], note: 'Port et pôle voisin.' },
    { name: 'Plouzané', coords: [48.3816, -4.6217], note: 'Interface avec le bassin brestois.' },
    { name: 'Brest', coords: [48.3904, -4.4861], note: 'Bassin d’emploi, services et gare.' }
  ];

  function mountMap() {
    const region = document.getElementById('region');
    if (!region || typeof window.L === 'undefined') return false;

    const card = region.querySelector('.map-card');
    const shell = region.querySelector('.map-shell');
    if (!card || !shell) return false;
    if (shell.dataset.mapVersion === 'v5') return true;

    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const title = card.querySelector('h3');
    if (title) title.textContent = 'Carte réelle de la pointe du Finistère';

    shell.innerHTML = '<div id="regionRealMapV5" class="region-real-map" aria-label="Carte réelle de Plougonvelin, Trez-Hir, Le Conquet, Pointe Saint-Mathieu, Plouzané et Brest"></div>';
    shell.dataset.mapVersion = 'v5';

    const legend = card.querySelector('.map-legend');
    if (legend) {
      legend.innerHTML = '<span>Fond Esri, sans couche CARTO</span><span>Localisation communale, non cadastrale</span><span>Toucher les points pour le contexte</span>';
    }

    const map = L.map('regionRealMapV5', {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      dragging: true,
      tap: true,
      fadeAnimation: false,
      zoomAnimation: false,
      markerZoomAnimation: false
    });

    if (!isMobile) {
      L.control.zoom({ position: 'topright' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    }

    const neutralTile = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e7eded"/></svg>'
    );

    const tiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        minZoom: 8,
        maxZoom: 16,
        updateWhenIdle: true,
        keepBuffer: 2,
        errorTileUrl: neutralTile,
        attribution: 'Fond de carte &copy; Esri'
      }
    );
    tiles.addTo(map);

    let tileErrors = 0;
    tiles.on('tileerror', function () {
      tileErrors += 1;
      if (tileErrors >= 5 && !shell.querySelector('.map-error-note')) {
        const note = document.createElement('div');
        note.className = 'map-error-note';
        note.textContent = 'Certaines tuiles cartographiques n’ont pas pu être chargées.';
        shell.appendChild(note);
      }
    });

    const markers = [];
    places.forEach(function (place) {
      const marker = L.circleMarker(place.coords, {
        radius: place.primary ? 9 : 6,
        color: place.primary ? '#173743' : '#456d72',
        fillColor: place.primary ? '#c79f62' : '#79a49d',
        fillOpacity: 0.98,
        opacity: 1,
        weight: place.primary ? 3 : 2
      }).addTo(map);

      marker.bindPopup('<strong>' + place.name + '</strong><br>' + place.note);

      const showPermanent = !isMobile || place.primary || place.name === 'Brest';
      if (showPermanent) {
        marker.bindTooltip(place.name, {
          permanent: true,
          direction: place.name === 'Brest' ? 'right' : (place.primary ? 'right' : 'top'),
          offset: place.name === 'Brest' || place.primary ? [9, 0] : [0, -8],
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
      opacity: 0.62,
      dashArray: '7 9'
    }).addTo(map);

    L.polyline([
      [48.3605, -4.7745],
      [48.3417, -4.7662],
      [48.3304, -4.7702]
    ], {
      color: '#9a7657',
      weight: 3,
      opacity: 0.60,
      dashArray: '5 8'
    }).addTo(map);

    L.circle([48.3407, -4.7189], {
      radius: 2500,
      color: '#7f9ca0',
      weight: 1,
      fillColor: '#adc3c4',
      fillOpacity: 0.08,
      dashArray: '4 7'
    }).addTo(map);

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), {
      padding: isMobile ? [28, 28] : [38, 38],
      maxZoom: isMobile ? 10 : 11,
      animate: false
    });

    setTimeout(function () { map.invalidateSize(false); }, 220);
    return true;
  }

  function boot(attempt) {
    if (mountMap()) return;
    if (attempt < 40) setTimeout(function () { boot(attempt + 1); }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(0); });
  } else {
    boot(0);
  }
})();
