import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';

 
@Injectable()
export class AuthGuard implements CanActivate {

    private id: string
    public publicName: string

    constructor(private router: Router,  private route: ActivatedRoute) {}
 
    //Decides if a user can log in.
    public canActivate(): boolean {
        console.log(this.route.snapshot.paramMap)
        this.publicName = this.route.snapshot.paramMap.get('publicName')
        console.log(this.publicName)
        //console.log(localStorage)
            if (localStorage.getItem('currentUser')) {
                // logged in so return true
                //console.log("returning true from auth guard")
                return true;
            }
     
            // not logged in so redirect to login page
            this.router.navigate(['/login']);
            //console.log("returning false from auth guard")
            return true;    
    
    }
}