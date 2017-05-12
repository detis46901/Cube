import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { User } from '../../_models/user-model'

@Component({
    selector: 'header',
    templateUrl: './header.component.html'
})
export class HeaderComponent { 
    
    constructor() {}
    /*constructor(private renderer: Renderer2) {
    }
    onInit(element: HTMLElement){
        this.renderer.createElement(element, )
    } Maybe this is how to render the static pngs*/

    @Input() user: User
    condition = false;
    }
