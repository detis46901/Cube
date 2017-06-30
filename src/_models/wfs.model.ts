export class WFSMarker {
    lat: number;
    lng: number;
    complete: boolean;
    completedDate: Date;

    constructor(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    }
}