import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { Role } from '../_models/organization.model';
 
@Injectable()
export class RoleService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;

    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'role/';
    }

    public GetByGroup = (groupID): Observable<Role[]> => {
        return this._http.get(this.actionUrl + 'getbygroup?groupID=' + groupID)
            .map((response: Response) => <Role[]>response.json())
            .catch(this.handleError);
    }
}