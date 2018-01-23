import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { GroupMember } from '../_models/groupMember.model';
 
@Injectable()
export class GroupMemberService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;

    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'groupmember/';
    }

    public GetByUser = (userid): Observable<GroupMember[]> => {
        return this._http.get(this.actionUrl + 'getbyuser?userid=' + userid, this.options)
            .map((response: Response) => <GroupMember[]>response.json())
            .catch(this.handleError);
    }

    public GetByGroup = (groupid): Observable<GroupMember[]> => {
        return this._http.get(this.actionUrl + 'getbygroup?groupid=' + groupid, this.options)
            .map((response: Response) => <GroupMember[]>response.json())
            .catch(this.handleError);
    }
}