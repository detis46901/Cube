import { Component, Input, Output, EventEmitter, Sanitizer } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SideNavService } from "../../_services/sidenav.service"
import { MyCubeField, MyCubeConfig, MyCubeComment } from "../../_models/layer.model"
import { SQLService } from "../../_services/sql.service"
import { MyCubeService } from "../map/services/mycube.service"
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';


@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss'],
    providers: [SideNavService]
})
export class FeatureDataComponent {
    public serializedDate = new FormControl((new Date()).toISOString());
    public newComment: string;
    public userID: number;
    public open: boolean;

    constructor(private sideNavService: SideNavService, private sqlservice: SQLService, private mycubeservice: MyCubeService) {
        // subscribe to map component messages
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
    }

    @Input() message: any
    @Input() myCubeComments: MyCubeComment[]
    @Input() myCubeData: MyCubeField[];
    @Input() myCubeConfig: MyCubeConfig;
    @Input() canEdit: boolean;


    ngOnInit() {
        this.open = true
    }

    public hideMenu() {
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

    private clearMessage(): void {
        this.message = null
    }
    private updateMyCube(mycube: MyCubeField): void {
        if (mycube.type == "date") {
            mycube.value = mycube.value.toJSON()
        }
        //document.getElementById("featureData").style.display = "block";
        this.sqlservice
            .Update(this.myCubeConfig.table, this.myCubeData[0].value, mycube.field, mycube.type, mycube.value)
            .subscribe()
    }

    private addMyCubeComment() {
        console.log("Adding MyCube Comment " + this.newComment)
        console.log("feature id is= " + this.myCubeData[0].value)
        this.sqlservice
            .addComment(this.myCubeConfig.table, this.myCubeData[0].value, this.newComment, this.userID)
            .subscribe()
        this.mycubeservice.sendMyCubeData(this.myCubeConfig.table, this.myCubeData[0].value)
        this.newComment = ""
    }

    private deleteMyCubeComment(table, id) {
        console.log("Deleting comment " + table, id)
        this.sqlservice
            .deleteComment(table, id)
            .subscribe((result) => {
                console.log(result)
            })
        this.mycubeservice.sendMyCubeData(this.myCubeConfig.table, this.myCubeData[0].value)
    }

    private onFileSelected(event) {
        console.log(event.target.files[0]) //This will be used for adding an image to a comment for myCube.
        //this.selectedFile = <File>event.target.files[0] //Send to the bytea data type field in comment table.
    }
}