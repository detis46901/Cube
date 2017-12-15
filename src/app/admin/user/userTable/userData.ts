import { User } from '../../../../_models/user.model';
import { UserService } from '../../../../_services/_user.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class UserDataSource extends DataSource<User> {
    private users: Array<User>;

    constructor(private userService: UserService) {
        super();
    }

    ngOnInit() {
        this.userService.GetAll()
        .subscribe((data) => this.users = data)
    }

    connect(): Observable<User[]> {
        //return Observable.of(userList)
        // this.userService.GetAll()
        // .subscribe((response) => {
        //     return Observable.of(response);
        // })
        return this.userService.GetAll()
        .map(data => {
            return data;
        })
    }

    disconnect() {}
}