import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
 
@Injectable()
export class AdminGuard implements CanActivate {
    private token: string;
    private admin: boolean;
    constructor(private router: Router) {}
 
    //Decides if a user is both logged in and an admin.
    public canActivate(): boolean {
        if (localStorage.getItem('currentUser')) {
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.admin = currentUser && currentUser.admin;
            if (this.admin === true) {
                // logged in as admin so return true
                return true;
            } else {
                this.router.navigate(['/']);
            }
        }
 
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}