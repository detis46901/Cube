import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/server.service'
import { Server } from '../../../_models/server.model'

@Component({
  selector: 'server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss'],
  providers: [ServerService]
})
export class ServerComponent implements OnInit {

  public servers: Array<Server>;

  public serverName: string = 'placeholder';
  public serverURL: string = 'placeholder';
  public serverType: string = 'placeholder';

  constructor(private serverService: ServerService) { }

  ngOnInit() {
    this.getServers()
  }

  getServers() {
      this.serverService
          .GetAll()
          .subscribe((data) => this.servers = data,
              error => console.log(error),
              () => console.log(this.servers)
          );
  }
}
