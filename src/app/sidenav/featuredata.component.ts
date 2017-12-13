import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SideNavService } from "../../_services/sidenav.service"
import { MyCubeField, MyCubeConfig }from "../../_models/layer.model"
import { SQLService } from "../../_services/sql.service"

@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss'],
    providers: [SideNavService]
})
export class FeatureDataComponent{ 
    constructor(private sideNavService: SideNavService, private sqlservice: SQLService){
         // subscribe to map component messages
    }
    @Input() message: any;
    @Input() myCubeData: MyCubeField[];
    @Input() myCubeConfig: MyCubeConfig;
    @Input() canEdit: boolean;

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

    private clearMyCubeData(): void {
        this.myCubeData = null
    }

    private updateMyCube(mycube: MyCubeField): void {
        console.log(this.myCubeData[0].value)
        console.log(mycube.value)
        this.sqlservice
            .Update(this.myCubeConfig.table, this.myCubeData[0].value, mycube.field, mycube.type, mycube.value)
            .subscribe()
    }
}