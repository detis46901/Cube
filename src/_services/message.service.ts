import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { SafeHtml } from '@angular/platform-browser/src/security/dom_sanitization_service';

 
@Injectable()
export class MessageService {
    private subject = new Subject<any>();
    public sanitizedURL: SafeResourceUrl
 
    constructor(public sanitizer: DomSanitizer) {}

    sendMessage(message: any) {
        this.subject.next(message);
    }
 
    clearMessage() {
        this.subject.next(null);
    }
 
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}