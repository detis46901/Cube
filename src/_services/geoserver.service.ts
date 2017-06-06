import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { GeoConfiguration } from '../_geoserver/geoserver.constants';
 
@Injectable()
export class GeoService {

    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: GeoConfiguration) {
 
        this.actionUrl = _configuration.ServerWithGeoUrl + '';
 
    }
}

//For use with obtaining geoserver instance information in admin/geoserver/geoserver.component