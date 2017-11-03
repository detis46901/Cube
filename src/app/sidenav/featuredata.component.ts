import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SideNavService } from "../../_services/sidenav.service"

@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss'],
    providers: [SideNavService]
})
export class FeatureDataComponent{ 
    constructor(private sideNavService: SideNavService){
         // subscribe to map component messages
    }
    @Input() message: any;

    ngOnInit() {}

    public hideMenu() {
        this.sideNavService.toggleHidden();
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("place-input").style.left = "15px";
        document.getElementById("goto").style.left = "15px";
        document.getElementById("add-marker").style.left = "30px";
        document.getElementById("remove-marker").style.left = "70px";
    }

    drawLineClick() {

    }

    drawPointClick() {

    }

    drawPolygonClick() {
        
    }

    private clearMessage(): void {
        this.message = ""
    }
}