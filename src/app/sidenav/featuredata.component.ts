import { Component, Input, Output, EventEmitter, Sanitizer } from '@angular/core';
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
    styleUrls: ['featuredata.component.scss']
})
export class FeatureDataComponent {
    public serializedDate = new FormControl((new Date()).toISOString());
    public newComment = new MyCubeComment()
    public userID: number;
    public open: boolean;
    public showAuto: boolean = false;
    public commentText: string

    constructor(private sqlservice: SQLService, private mycubeservice: MyCubeService) {
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
        if (mycube.changed) {
            console.log('Updating changed field')
            if (mycube.type == "date") {
                mycube.value = mycube.value.toJSON()
            }
            //document.getElementById("featureData").style.display = "block";
            this.sqlservice
                .Update(this.myCubeConfig.table, this.myCubeData[0].value, mycube.field, mycube.type, mycube.value)
                .subscribe((data) => {
                    this.newComment.auto = true
                    this.newComment.comment = mycube.field + " changed to " + mycube.value
                    this.newComment.featureID = this.myCubeData[0].value
                    this.newComment.table = this.myCubeConfig.table
                    this.newComment.userID = this.userID
                    this.newComment.geom = null
                    this.sqlservice
                        .addCommentWithoutGeom(this.newComment)
                        .subscribe((data) => {
                            this.commentText = ""
                            this.mycubeservice.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
                        })
                })

            mycube.changed = false
        }
    }

    private addMyCubeComment() {
        this.newComment.comment = this.commentText
        console.log("Adding MyCube Comment " + this.newComment)
        console.log("feature id is= " + this.myCubeData[0].value)
        this.newComment.table = this.myCubeConfig.table
        this.newComment.featureID = this.myCubeData[0].value
        this.newComment.userID = this.userID
        this.newComment.auto = false
        this.sqlservice
            .addCommentWithoutGeom(this.newComment)
            .subscribe()
        this.mycubeservice.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
        this.commentText = ""
    }

    private deleteMyCubeComment(table, id) {
        console.log("Deleting comment " + table, id)
        this.sqlservice
            .deleteComment(table, id)
            .subscribe((result) => {
                console.log(result)
            })
        this.mycubeservice.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
    }

    private onFileSelected(event) {
        console.log(event.target.files[0]) //This will be used for adding an image to a comment for myCube.
        //this.selectedFile = <File>event.target.files[0] //Send to the bytea data type field in comment table.
    }

}