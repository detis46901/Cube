import { Component, Input, OnInit } from '@angular/core';
import { MyCubeField, MyCubeConfig, MyCubeComment } from "../../_models/layer.model"
import { SQLService } from "../../_services/sql.service"
import { MyCubeService } from "../map/services/mycube.service"
import { WMSService } from '../map/services/wms.service'
import { FormControl } from '@angular/forms';
import {  } from '@angular/forms';
import { MapConfig } from 'app/map/models/map.model';
import { Subscription } from 'rxjs';
import {environment} from 'environments/environment'
import Autolinker from 'autolinker';
import { DateAdapter, NativeDateAdapter } from '@angular/material';


@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss'],
})
export class FeatureDataComponent implements OnInit  {
    //public serializedDate = new FormControl((new Date()).toISOString());
    public newComment = new MyCubeComment()
    public userID: number;
    public userFirstName: string;
    public userLastName: string;
    public open: boolean;
    public showAuto: boolean = false;
    public commentText: string
    public formattedText: string
    public Autolinker = new Autolinker()
    public editCube: MyCubeField
    public myCubeData: MyCubeField[]
    public myCubeConfig: MyCubeConfig;
    public myCubeComments: MyCubeComment[]
    public subscription: Subscription
    public message: string;
    private myCubeSubscription: Subscription;
    private myCubeCommentSubscription: Subscription;
    private editSubscription: Subscription;
    private newCommentFile: File;
    public URL: string


    constructor(private sqlservice: SQLService, private myCubeService: MyCubeService, private wmsService: WMSService, dateAdapter: DateAdapter<NativeDateAdapter>) {
        // subscribe to map component messages
        dateAdapter.setLocale('en-RU');
    }

    @Input() canEdit: boolean;
    @Input() mapConfig: MapConfig

    ngOnInit() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.userFirstName = currentUser && currentUser.firstName
        this.userLastName = currentUser && currentUser.lastName
        this.subscription = this.myCubeService.getWMS().subscribe(message => { this.message = message; this.myCubeData = null });
        this.myCubeSubscription = this.myCubeService.getMyCubeData().subscribe(myCubeData => { this.myCubeData = myCubeData; this.message = null});
        this.myCubeCommentSubscription = this.myCubeService.getMyCubeComments().subscribe(myCubeComments => { this.myCubeComments = myCubeComments; this.commentText = ""; this.newComment.file = null })
        this.editSubscription = this.myCubeService.getMyCubeConfig().subscribe(data => { this.myCubeConfig = data });
        this.open = true
        this.myCubeData = this.mapConfig.myCubeData
        this.myCubeConfig = this.mapConfig.myCubeConfig
        this.myCubeComments = this.mapConfig.myCubeComment
        this.URL = environment.apiUrl + '/api/sql/getimage'
    }

    public setCorrectDate() {
        console.log(this.myCubeData)
        this.myCubeData.forEach((x) => {
            if (x.type == 'date') {
                const d = new Date(x.value);
                const date = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
                x.value = date
            }
        })
    }

    public clearMyCubeData(): void {
        this.myCubeData = null
    }

    public clearMessage(): void {
        this.message = null
    }

    public updateMyCube(mycube: MyCubeField): void {
        let FID: number = this.myCubeData[0].value //required in the case the blur occurs when the object is unselected.
        if (mycube.changed) {
            if (mycube.type == "date") {
                if (mycube.value) {
                console.log(mycube.value)
                mycube.value = mycube.value.toJSON()
                }
                else {
                    console.log(mycube.value)
                    mycube.value = null
                }
            }
            if (mycube.type == "text") {
                let ntext: RegExp = /'/g
                mycube.value = mycube.value.replace(ntext, "''")
            }
            this.sqlservice
                .Update(this.myCubeConfig.table, this.myCubeData[0].value, mycube)
                .subscribe((data) => {
                    this.myCubeService.createAutoMyCubeComment(true, mycube.field + " changed to " + mycube.value, FID, this.myCubeConfig.table, this.userID)
                    .then(() => {
                        this.commentText = ""
                        //try is used to not error when the change coinsides with unselecting the object.
                        try {this.myCubeService.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)}
                        catch { }
                    })
                        })
                    if (mycube.type == "text") {
                        let ntext: RegExp = /''/g
                        mycube.value = mycube.value.replace(ntext, "'")
                    }
                }
            mycube.changed = false
        }

        public addMyCubeComment() {
        this.newComment.comment = this.commentText
        if (this.newComment.file) {
            if (!this.commentText) {
                this.newComment.comment = 'Attachment'
            }
        }
        let ntext: RegExp = /'/g
        this.newComment.comment = this.newComment.comment.replace(ntext, "''")
        this.newComment.table = this.myCubeConfig.table
        this.newComment.featureID = this.myCubeData[0].value
        this.newComment.userID = this.userID
        this.newComment.firstName = this.userFirstName
        this.newComment.lastName = this.userLastName
        this.newComment.auto = false
        //Need to add the time in here so it looks right when it is added immediately
        this.myCubeComments.push(this.newComment)
        this.sqlservice
            .addCommentWithoutGeom(this.newComment)
            .subscribe((data) => {
                console.log(data)
                if (this.newComment.file) {
                    console.log('file exists')
                    console.log(data[0][0].id)
                    this.uploadFile(data[0][0].id)
                }
                //this.myCubeComments.push(this.newComment)
                this.myCubeService.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
            })
        this.commentText = ""
    }

    public deleteMyCubeComment(table, comment:MyCubeComment) {
        this.myCubeComments.splice(this.myCubeComments.indexOf(comment),1)
        this.sqlservice
            .deleteComment(table, comment.id)
            .subscribe((result) => {
                this.myCubeService.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
            })

    }

    public onFileSelected(event) {
        console.log(event.target.files[0]) //This will be used for adding an image to a comment for myCube.
        this.newComment.file = <File>event.target.files[0] //Send to the bytea data type field in comment table.
    }

    public uploadFile(id:string) {
        let formdata: FormData = new FormData()
        formdata.append('photo', this.newComment.file)
        formdata.append('table', this.newComment.table.toString())
        formdata.append('id', id)
        this.sqlservice
            .addImage(formdata)
            .subscribe((result) => {
                console.log(result)
            })
    }
}
