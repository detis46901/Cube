
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { MyCubeField } from '../../../_models/layer.model'
import { environment } from 'environments/environment'

@Injectable()
export class geoJSONService {
    protected headers: Headers;
    protected options: any;
    protected token: string;
    private actionUrl: string

    constructor(protected _http: HttpClient) {
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'geoJSON/';
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch (err) {
            console.error("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
        }
        this.options = {
            headers: new HttpHeaders({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token,
                'Access-Control-Allow-Origin': '*'
            })
        };
    }

    public GetAll = (layerID: number): Observable<any> => {
        let ob = this._http.get(this.actionUrl + 'all?table=' + layerID, this.options).pipe(
            catchError(this.handleError));
        return ob
    }
    public GetSome = (layerID: number, where: string): Observable<any> => {
        let ob = this._http.get(this.actionUrl + 'some?table=' + layerID + '&where=' + where, this.options).pipe(
            catchError(this.handleError));
        return ob
    }

    public GetSingle = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id, this.options).pipe(
            catchError(this.handleError));
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email).pipe(
            catchError(this.handleError));
    }

    public Create = (layerName: string, fields: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options).pipe(
            catchError(this.handleError));
    }

    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options).pipe(
            catchError(this.handleError));
    }

    public Delete = (id: number): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options).pipe(
            catchError(this.handleError));
    }

    public addColumn = (table: string, field: MyCubeField): Observable<any> => {
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type, this.options).pipe(
            catchError(this.handleError))
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
    }

    public updateGeometry(table: number, json2: JSON): Observable<any> {
        let id = JSON.stringify(json2['id'])
        return this._http.get(this.actionUrl + 'updateGeometry?table=' + table + '&geometry=' + JSON.stringify(json2['geometry']) + '&id=' + id, this.options)
    }

    protected handleError(error: Response) {
        console.error(error);
        return observableThrowError(error.json() || 'any error');
    }
}
