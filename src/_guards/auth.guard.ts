import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';

 
@Injectable()
export class AuthGuard implements CanActivate {

    private id: string


    constructor(private router: Router,  private route: ActivatedRoute) {}
 
    //Decides if a user is logged in.
    public canActivate(): boolean {
        //console.log(localStorage)
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const currentUser = JSON.parse(userStr);
            if (currentUser.public) {
                console.log('not a private user')
                this.router.navigate(['/login']);
                return false} //this person is public trying to get to a non-public part
            // logged in so return true
            //console.log("returning true from auth guard")
            return true;
        }
 
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        //console.log("returning false from auth guard")
        return false;
    }
}