import { Component, OnInit } from '@angular/core';

import { SocketService } from '../_services/socket.service';
import { Event } from '../_services/event'
import { Action } from '../_services/action'

@Component({
  selector: 'tcc-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messageContent: string;
  ioConnection: any;

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.initIoConnection();
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    // this.ioConnection = this.socketService.onMessage()
    //   .subscribe((message: Message) => {
    //     this.messages.push(message);
    //   });

    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });
      
    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });
  }

  public sendMessage(message: string): void {
    if (!message) {
      return;
    }

//     this.socketService.send({
//       from: this.user,
//       content: message
//     });
//     this.messageContent = null;
//   }

//   public sendNotification(params: any, action: Action): void {
//     let message: Message;

//     if (action === Action.JOINED) {
//       message = {
//         from: this.user,
//         action: action
//       }
//     } else if (action === Action.RENAME) {
//       message = {
//         action: action,
//         content: {
//           username: this.user.name,
//           previousUsername: params.previousUsername
//         }
//       };
//     }

//     this.socketService.send(message);
  }
}