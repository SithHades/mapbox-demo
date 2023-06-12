export interface Schedule {
  user: string;
  time: Date;
  start: [number, number];
  end: [number, number];
  method: 'cycling' | 'driving' | 'publicTransport' | 'walking';
  toOffice: boolean; // If it is to the office, we can expect the end point for multiple users to be the exact same.
}
