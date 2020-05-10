
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParentService } from './_parent.service';
import { environment } from '../environments/environment'

@Injectable()
export class ModulePermissionService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'modulepermission/';
    }

    public GetByInstance = (instanceid): Observable<any> => {
        return this._http.get(this.actionUrl + 'byinstance?instanceID=' + instanceid, this.getOptions())
            .pipe(catchError(this.handleError));
    }
}