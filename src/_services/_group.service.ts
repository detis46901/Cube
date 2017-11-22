import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { Group } from '../_models/organization.model';
 
@Injectable()
export class GroupService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;

    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'group/';
    }
 
    public GetByDept = (deptID): Observable<Group[]> => {
        return this._http.get(this.actionUrl + 'getbydept?departmentID=' + deptID)
            .map((response: Response) => <Group[]>response.json())
            .catch(this.handleError);
    }
}