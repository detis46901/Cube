import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';


@Injectable()
export class MessageService {
    private subject = new Subject<any>();
    public sanitizedURL: SafeResourceUrl

    constructor(public sanitizer: DomSanitizer) { }

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
