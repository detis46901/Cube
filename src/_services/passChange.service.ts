import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PasswordChangeService {
    constructor(private http: HttpClient) { }
}