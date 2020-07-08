import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User, APIKey } from '../../../_models/user.model';
import { APIKeyService} from '../../../_services/_apikey.service'

@Component({
    selector: 'apiKey',
    templateUrl: './apiKey.component.html',
    styleUrls: ['./apiKey.component.scss'],
    providers: [UserService]
})

export class ApiKeyComponent implements OnInit {

    public apiKeyToken: string;
    public user = new User;
    public token: string;
    public userID: number;
    public apiKeys = new Array<APIKey>()

    constructor(private userService: UserService, private apiKeyService:APIKeyService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUserItems()
    }

    getUserItems(): void {
            this.userService
            .GetSingle(this.userID)
            .subscribe((user:User) => {
                this.user = user
                // this.apiKeyToken = key['apiKey'];
            })
    }

    generateKey(): void {
        this.user.apikey = null
        this.userService
        .Update(this.user) 
        .subscribe((key) => {
            console.log(key)
            this.getUserItems()
        })
    }

    deleteKey(ID: number): void {
        this.apiKeyService
        .Delete(ID)
        .subscribe((x) => {
            this.getUserItems()
        })
    }
}
