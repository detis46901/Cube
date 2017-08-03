// app.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user-model'
import { Configuration } from '../_api/api.constants'


@Component({
  selector: 'app-root',
  providers: [UserService, Configuration],
  template: `
  <div>     
    <router-outlet></router-outlet>
    <br />  
  <br />   
  </div>
  `,
  styleUrls: ["./app.component.scss"]  
})
export class AppComponent {

public user = new User;
public myItems: any;

    constructor(private dataService: UserService) {

     //this.dataService.GetSingle(1).subscribe(user => {console.log(user)})
    }

    ngOnInit() {
       this.getAllItems();
        
    }


    public getAllItems(): void {
         this.dataService
            .GetAll()
            .subscribe((data:User[]) => this.myItems = data,
                error => console.log(error));//,
                //() => console.log(this.myItems[0].firstName));
            
    }
}