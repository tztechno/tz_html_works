<!DOCTYPE html>
<html>

<head>
    <title>Leaflet Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>

<body>
    <div id="map" style="height: 600px;"></div>

    <script>
        const map = L.map('map').setView([35.681236, 139.767125], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Google Apps ScriptのURL
        fetch('https://script.google.com/macros/s/AKfycbzSWSgKJxAIQK-yd1AfQoP4BmCDqswH7RpiYSPH8Kp-iBFW4NsFSKeM0mNicNpHgj0grg/exec')
            .then(response => response.json())
            .then(data => {
                console.log("Received data:", data);

                const geojsonLayer = L.geoJSON(data, {
                    onEachFeature: function (feature, layer) {
                        if (feature.properties && feature.properties.name) {
                            layer.bindPopup(feature.properties.name);
                        }
                    }
                }).addTo(map);

                map.fitBounds(geojsonLayer.getBounds());
            })
            .catch(error => console.error('Error fetching the data:', error));

    </script>
</body>

</html>