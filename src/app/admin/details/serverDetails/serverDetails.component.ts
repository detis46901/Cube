import { Component, OnInit, Input } from '@angular/core';
import { Server } from '../../../../_models/server.model';
import { User, Notif } from '../../../../_models/user.model';
import { MatDialog } from '@angular/material';
import { NotifService } from '../../../../_services/notification.service';
import { ServerService } from '../../../../_services/_server.service';
import { UserService } from '../../../../_services/_user.service';

@Component({
    selector: 'serverDetails',
    templateUrl: './serverDetails.component.html',
    styleUrls: ['./serverDetails.component.scss']
})

export class ServerDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    public user = new User;
    public server = new Server;
    public serverProps = new Array<any>();
    public changedServerProps = new Array<any>();
    public originalServerProps = new Array<any>();
    public style: string;
    public userID;

    constructor(private dialog: MatDialog, private serverService: ServerService, private userService: UserService, private notificationService: NotifService) {}

    ngOnInit() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.getUser(this.userID)
        this.getServer(this.ID)
    }

    public getUser(id) {
        this.userService
            .GetSingle(id)
            .subscribe((res: User) => {
                this.user = res
            })
    }

    public getServer(id) {
        this.serverService
            .GetSingle(id)
            .subscribe((res: Server) => {
                this.server = res
            })
    }

    public submit(server) {
        this.serverService
            .Update(server)
            .subscribe(() => this.dialog.closeAll())
    }

    public whichFieldsChanged(changed: Server) {
        let ix = 0;

        for (let property in changed) {
            if (changed.hasOwnProperty(property)) {
                if (changed[property] != this.serverProps[ix]) {
                    this.originalServerProps.push(this.serverProps[ix])
                    this.changedServerProps.push(changed[property])
                }
            }
            ix += 1;
        }
    }

    public createLayerNotif(S: Server): any {
        var N = new Notif;
        N.name = S.serverName + ' changed by ' + this.user.firstName + " " + this.user.lastName;
        N.description = this.parseDescription(this.originalServerProps, this.changedServerProps);
        N.priority = 3;
        N.read = false;
        N.objectType = "Server";
        N.sourceID = S.ID;

        return N;
    }

    public parseDescription(oArr, cArr): string {
        var description = "";
        let flag = false;
        let ix = 0;
        for (let prop of oArr) {
            description += "\"" + prop + "\" was changed to \"" + cArr[ix] + "\"\n"
        }
        return description;
    }

}
