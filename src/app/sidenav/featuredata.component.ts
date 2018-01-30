import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SideNavService } from "../../_services/sidenav.service"
import { MyCubeField, MyCubeConfig, MyCubeComment }from "../../_models/layer.model"
import { SQLService } from "../../_services/sql.service"
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {FormControl} from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss'],
    providers: [SideNavService]
})
export class FeatureDataComponent{ 
    public trustedUrl: SafeUrl
    public videoUrl: SafeResourceUrl;
    public serializedDate = new FormControl((new Date()).toISOString());
    public newComment: string;

    constructor(private sideNavService: SideNavService, private sqlservice: SQLService){
         // subscribe to map component messages
    }

    
    @Input() myCubeComments: MyCubeComment[]
    @Input() myCubeData: MyCubeField[];
    @Input() myCubeConfig: MyCubeConfig;
    @Input() canEdit: boolean;
    
   
    ngOnInit() {
    }

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


    private clearMyCubeData(): void {
        this.myCubeData = null
    }

    private updateMyCube(mycube: MyCubeField): void {
        if (mycube.type == "date") {
            mycube.value = mycube.value.toJSON()
        }
        console.log(this.myCubeData[0].value)
        console.log(mycube.type)
        console.log(mycube.value)
        this.sqlservice
            .Update(this.myCubeConfig.table, this.myCubeData[0].value, mycube.field, mycube.type, mycube.value)
            .subscribe()
    }

    private addMyCubeComment() {
        console.log("Adding MyCube Comment " + this.newComment)
        this.sqlservice
            .addComment(this.myCubeConfig.table, this.myCubeData[0].value, this.newComment, 1)
            .subscribe()
    }
}