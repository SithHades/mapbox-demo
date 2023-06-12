import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { Schedule } from 'src/model/schedule';
import { ScheduleGroup } from 'src/model/scheduleGroup';

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

  async makeNavigationRequest() {
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

  async geocoding(location: any) {
    return fetch(
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
        location.toString().toLowerCase() +
        '.json?country=de&proximity=ip&language=de&access_token=' +
        this.accessToken,
      {
        method: 'GET',
      },
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        return data.features[0].center;
      });
  }

  async navigationalDistanceBeteenPoints(
    pA: [number, number],
    pB: [number, number],
  ): Promise<number> {
    return pA[0] + pB[0];
  }

  /**
   * Groups schedules together based on various criterias.
   * ! Groups can be containing only one schedule. If so, a cloud message should be sent, that no group was found.
   * @param schedules schedules to be grouped together.
   * @returns groups of schedules
   */
  groupSchedules(schedules: Schedule[]): ScheduleGroup[] {
    const groups: ScheduleGroup[] = [];

    schedules.forEach((schedule) => {
      const { method, toOffice, end } = schedule;

      const existingGroup = groups.find((group) => {
        return (
          group.method === method &&
          group.toOffice === toOffice &&
          group.schedules.some((existingSchedule) => {
            const { end: existingEnd } = existingSchedule;
            return toOffice ? this.areCoordinatesEqual(end, existingEnd) : true;
          }) &&
          group.schedules[0].time
        );
      });

      if (existingGroup) {
        existingGroup.schedules.push(schedule);
      } else {
        const newGroup: ScheduleGroup = {
          method,
          toOffice,
          schedules: [schedule],
        };
        groups.push(newGroup);
      }
    });

    return groups;
  }

  areCoordinatesEqual(a: [number, number], b: [number, number]): boolean {
    return a[0] === b[0] && a[1] === b[1];
  }
}
