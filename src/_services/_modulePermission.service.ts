import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { ModulePermission } from '../_models/module.model';

@Injectable()
export class ModulePermissionService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'modulepermission/';
    }

    public GetByInstance = (instanceid): Observable<any> => {
        return this._http.get(this.actionUrl + 'byinstance?instanceID=' + instanceid, this.options)
            .pipe(catchError(this.handleError));
    }
}