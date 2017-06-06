import { Injectable } from '@angular/core';
 
@Injectable()
export class GeoConfiguration {
    public Server: string = "http://foster2.cityofkokomo.org:8080/";
    public GeoserverUrl: string = "geoserver/";
    public ServerWithGeoUrl = this.Server + this.GeoserverUrl;
}