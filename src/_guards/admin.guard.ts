import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
 
@Injectable()
export class AdminGuard implements CanActivate {
    public token: string;
    public admin: boolean;
    constructor(private router: Router) { }
 
    canActivate() {
        if (localStorage.getItem('currentUser')) {
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.admin = currentUser && currentUser.admin;
            if (this.admin===true){
                return true
            }
            else {
            this.router.navigate(['/']);
            }
        }
 
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}