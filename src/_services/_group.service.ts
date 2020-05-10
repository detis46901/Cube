import { Injectable } from '@angular/core';
import {environment } from '../environments/environment'
import { HttpClient } from '@angular/common/http';
import { ParentService } from './_parent.service';

@Injectable()
export class GroupService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'group/';
    }
}