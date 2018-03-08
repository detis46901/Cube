import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
 
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router) {}
 
    //Decides if a user can log in.
    public canActivate(): boolean {
        //console.log(localStorage)
        if (localStorage.getItem('currentUser')) {
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