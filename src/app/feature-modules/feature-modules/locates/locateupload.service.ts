import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { tick } from '@angular/core/testing';
import { Locate } from './locates.model';

@Injectable({
  providedIn: 'root'
})
export class PositiveResponseService {

  private apiUrl = environment.proxyUrl + "/https://811.indiana811.org/api/External/PositiveResponse/Respond";

  constructor(private http: HttpClient) { }

  submitPositiveResponse(userID: string, password: string, serviceAreaCode: string, ticket: Locate): Observable<any> {
    console.log('PositiveResponseService initialized with API URL:', this.apiUrl);
    let payload = {};
    switch (ticket.disposition) {
      case '3C':
        payload = {
          UserID: userID,
          Password: password,
          ServiceAreaCode: serviceAreaCode,
          TicketNumber: ticket.ticket,
          ResponseCode: ticket.disposition,
          Comment: ticket.note,
          Respondent: ticket.completedby,
          Data: {
            NameOfPersonAttemptedToContact: ticket.contact,
            DescriptionOfMarkedArea: ticket.note
          }
        };
        break;
      case '3F':
        payload = {
          UserID: userID,
          Password: password,
          ServiceAreaCode: serviceAreaCode,
          TicketNumber: ticket.ticket,
          ResponseCode: ticket.disposition,
          Comment: ticket.note,
          Respondent: ticket.completedby,
          Data: {
            NameOfPersonAttemptedToContact: ticket.contact,
            DescriptionOfMarkedArea: ticket.note
          }
        };

        break;
      case '3G':
        payload = {
          UserID: userID,
          Password: password,
          ServiceAreaCode: serviceAreaCode,
          TicketNumber: ticket.ticket,
          ResponseCode: ticket.disposition,
          Comment: ticket.note,
          Respondent: ticket.completedby,
          Data: {
            NameOfPersonAttemptedToContact: ticket.contact,
            DescriptionOfMarkedArea: ticket.note
          }
        };
        break;
      default:
        payload = {
          UserID: userID,
          Password: password,
          ServiceAreaCode: serviceAreaCode,
          TicketNumber: ticket.ticket,
          ResponseCode: ticket.disposition,
          Comment: ticket.note,
          Respondent: ticket.completedby
        };
        break;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });

    console.log('Payload for Positive Response:', payload);
    return this.http.post<any>(this.apiUrl, payload, { headers });
  }
}
