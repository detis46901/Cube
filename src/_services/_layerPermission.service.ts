
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ParentService } from './_parent.service';
import { environment } from '../environments/environment'


@Injectable()
export class LayerPermissionService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'layerpermission/';
    }
}