import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../_models/user-model'

@Component({
    selector: 'header',
    templateUrl: './header.component.html'
})
export class HeaderComponent { 
    constructor() {
    }
    @Input() user: User
    condition = false;
    }
