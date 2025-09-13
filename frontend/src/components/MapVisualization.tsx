import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, HeatmapLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapVisualizationProps {
  data: any;
  config?: any;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ data, config = {} }) => {
  const defaultCenter: LatLngExpression = [20, 0];
  const defaultZoom = 2;

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={config.center || defaultCenter}
        zoom={config.zoom || defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {data.markers && data.markers.map((marker: any, index: number) => (
          <Marker key={index} position={[marker.lat, marker.lon]}>
            <Popup>
              <div>
                <h3 className="font-semibold">{marker.title}</h3>
                <p>{marker.description}</p>
                {marker.data && (
                  <div className="mt-2 text-sm">
                    {Object.entries(marker.data).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapVisualization;