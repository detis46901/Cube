
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParentService } from './_parent.service';
import { Server } from '../_models/server.model';
import { environment } from 'environments/environment'

@Injectable()
export class ServerService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'server/';
    }

    public getCapabilities(serv: Server): Observable<any> {
        let actionUrl: string
        switch (serv.serverType) {
            case "GeoserverWMS":
                actionUrl = serv.serverURL + '/wms?request=getCapabilities&service=WMS';
                break;
            case "GeoserverWMTS":
                actionUrl = serv.serverURL + '/gwc/service/wmts?request=getcapabilities';
                break
            case "ArcGIS":
                actionUrl = serv.serverURL + 'f=pjson';
                break;
        }

        return this._http.get(actionUrl)
            .pipe(catchError(this.handleError));
    }

    public getFolders(serv: Server, path: string, type: string, options: any): Observable<any> {
        let actionUrl: string
        switch (serv.serverType) {
            case "Geoserver":
                actionUrl = serv.serverURL + '/wms?request=getCapabilities&service=WMS';
                break;
            case "ArcGIS":
                if (type == "layer") { path += "/MapServer" }
                actionUrl = serv.serverURL + '?f=pjson';
                console.log(actionUrl)
                break;
        }
        return this._http.get(actionUrl, options/*, this.options*/)
            .pipe(catchError(this.handleError));
    }
}