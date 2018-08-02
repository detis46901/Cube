import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { GroupMember } from '../_models/group.model';

@Injectable()
export class GroupMemberService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'groupmember/';
    }

    public GetByUser = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getbyuser?userid=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByGroup = (groupid): Observable<GroupMember[]> => {
        return this._http.get(this.actionUrl + 'getbygroup?groupid=' + groupid, this.options)
            .pipe(catchError(this.handleError));
    }
}