import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { map } from 'rxjs';

@Injectable()
export class MapboxService {
  private accessToken: string;
  constructor() {
    config();
    this.accessToken = process.env.MAPBOX_ACESS_TOKEN;
  }

  waypoints = [
    { name: 'User A', coordinates: [-122.4194, 37.7749] },
    { name: 'User B', coordinates: [-122.408, 37.7881] },
    { name: 'User C', coordinates: [-122.4058, 37.7837] },
  ];

  // Create a Directions API request with the waypoints
  request = {
    waypoints: this.waypoints.map((waypoint) => ({
      coordinates: waypoint.coordinates,
    })),
    profile: 'cycling', // Specify the travel mode (e.g., driving, walking, cycling)
    geometries: 'geojson', // Specify the response format (geojson, polyline, polyline6)
  };

  async makeRequest() {
    return fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${this.request.profile}/${this.request.waypoints[0].coordinates[0]},${this.request.waypoints[0].coordinates[1]};${this.request.waypoints[1].coordinates[0]},${this.request.waypoints[1].coordinates[1]};${this.request.waypoints[2].coordinates[0]},${this.request.waypoints[2].coordinates[1]}?geometries=${this.request.geometries}&access_token=${this.accessToken}`,
      {
        method: 'GET',
      },
    )
      .then((response) => response.json())
      .then((data) => {
        // Retrieve the common navigation path (the optimized route)
        // const optimizedRoute = data.routes[0].geometry; // TODO this is for frontend, too.
        return data;
        /*
        This is only valid when you have a mapbox map already initialized
        TODO: Move this to the frontend.
        // Create a GeoJSON source with the optimized route
        map.addSource('optimizedRoute', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: optimizedRoute,
          },
        });

        // Add a layer to display the optimized route on the map
        map.addLayer({
          id: 'optimizedRoute',
          type: 'line',
          source: 'optimizedRoute',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b9ddd',
            'line-width': 5,
          },
        }); */
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}
