import { Injectable, isDevMode } from '@angular/core';
import {environment } from '../environments/environment'
import { HttpClient } from '@angular/common/http';
import { ParentService } from './_parent.service';
import { LoginLog} from '../_models/loginlog.model'
import { Observable, of} from 'rxjs';


@Injectable()
export class LoginLogService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'loginlog/';
    }

    public addLoginLog(ll:LoginLog): Observable<any> {
        if (!isDevMode) {
            return this.Add(ll)
        }
        else {
            return of('in dev mode')
        }
    }
}