import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const chicagoBounds = {
  north: 42.023131,
  south: 41.644335,
  east: -87.523661,
  west: -87.940101
};

const usBounds = {
  north: 49.384358,
  south: 24.396308,
  east: -66.93457,
  west: -125.00165
};

const Map = ({ mapData, mapFilter }) => {
  const getFilteredMapData = () => {
    if (mapFilter === 'chicago') {
      return mapData.filter(row => 
        row['Latitude'] >= chicagoBounds.south && row['Latitude'] <= chicagoBounds.north &&
        row['Longitude'] >= chicagoBounds.west && row['Longitude'] <= chicagoBounds.east
      );
    } else if (mapFilter === 'us') {
      return mapData.filter(row => 
        row['Latitude'] >= usBounds.south && row['Latitude'] <= usBounds.north &&
        row['Longitude'] >= usBounds.west && row['Longitude'] <= usBounds.east
      );
    } else {
      return mapData;
    }
  };

  const filteredMapData = getFilteredMapData();

  return (
    <MapContainer style={{ height: "400px", width: "100%" }} center={[41.8781, -87.6298]} zoom={10}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {filteredMapData.map((row, index) => {
        const lat = row['Latitude'];
        const lon = row['Longitude'];
        if (lat && lon) {
          return (
            <Marker
              key={index}
              position={[lat, lon]}
            >
              <Popup>
                {`Latitude: ${lat}, Longitude: ${lon}`}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default Map;
