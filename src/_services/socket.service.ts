//This isn't being used right now.  This sets up a WebSocket.  Maybe it will be useful some day.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Event } from './event';

import * as socketIo from 'socket.io-client';

const SERVER_URL = 'http://localhost:5001';

@Injectable()
export class SocketService {
    private socket;

    public initSocket(): void {
        console.log("initializing socket")
        this.socket = socketIo(SERVER_URL);
        this.socket.emit("message", SERVER_URL)
    }

    // public send(message: Message): void {
    //     this.socket.emit('message', message);
    // }

    // public onMessage(): Observable<Message> {
    //     return new Observable<Message>(observer => {
    //         this.socket.on('message', (data: Message) => observer.next(data));
    //     });
    // }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}