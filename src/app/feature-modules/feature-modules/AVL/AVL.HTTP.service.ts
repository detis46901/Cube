import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable()
export class AVLHTTPService {
  constructor(protected _http: HttpClient,
  ) { }

  public getLocationCall(token, id): Observable<any> {
    let headers = new HttpHeaders({'Content-type': 'application/vnd.networkfleet.api-v1+json', 'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/vnd.networkfleet.api-v1+json', 'Cache-Control': 'no-cache'})
   return this._http.get('https://cube-kokomo.com:9876/https://api.networkfleet.com/locations/vehicle/' + id + '/track?with-start-date=2020-08-15T00:00:00Z', {headers: headers})
  }

  public getFleetLocationsCall(token): Observable<any> {
    let headers = new HttpHeaders({'Content-type': 'application/vnd.networkfleet.api-v1+json', 'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/vnd.networkfleet.api-v1+json', 'Cache-Control': 'no-cache'})
    return this._http.get('https://cube-kokomo.com:9876/https://api.networkfleet.com/locations', {headers: headers}) 
  }

  public getVehicleCall(token, id): Observable<any> {
    let headers = new HttpHeaders({'Content-type': 'application/vnd.networkfleet.api-v1+json', 'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/vnd.networkfleet.api-v1+json', 'Cache-Control': 'no-cache'})
    return this._http.get('https://cube-kokomo.com:9876/https://api.networkfleet.com/vehicles/' + id, {headers: headers})
  }

  public getGroupsCall(token): Observable<any> {
    let headers = new HttpHeaders({'Content-type': 'application/vnd.networkfleet.api-v1+json', 'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/vnd.networkfleet.api-v1+json', 'Cache-Control': 'no-cache'})
    return this._http.get(environment.proxyUrl + '/https://api.networkfleet.com/groups', {headers: headers})
  }

  public getGroupCall(token, id): Observable<any> {
    let headers = new HttpHeaders({'Content-type': 'application/vnd.networkfleet.api-v1+json', 'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/vnd.networkfleet.api-v1+json', 'Cache-Control': 'no-cache'})
    return this._http.get(environment.proxyUrl + '/https://api.networkfleet.com/groups/' + id, {headers: headers})
  }
  public getTrackCall(token, id, startDate?, endDate?): Observable<any> {
    let headers = new HttpHeaders({'Content-type': 'application/vnd.networkfleet.api-v1+json', 'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/vnd.networkfleet.api-v1+json', 'Cache-Control': 'no-cache'})
    return this._http.get('https://cube-kokomo.com:9876/https://api.networkfleet.com/locations/vehicle/' + id + '/track', {headers: headers})
  }
}
