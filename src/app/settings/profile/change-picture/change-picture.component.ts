import { Component, OnInit, Input } from '@angular/core';
import { RequestOptions, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ImageService } from '../../../../_services/image.service';

@Component({
    selector: 'change-picture',
    templateUrl: './change-picture.component.html',
    styleUrls: ['./change-picture.component.scss'],
    providers: [ImageService]
})

export class ChangePictureComponent implements OnInit {
    @Input() userID;
    private selectedFile: File = null;

    constructor(private http: HttpClient, private imageService: ImageService) {     
    }

    ngOnInit() {
    }

    private onFileSelected(event) {
        console.log(event.target.files[0])
        this.selectedFile = <File>event.target.files[0]
    }

    private onUpload() {
        //use service to interface with backend to post file upload
        const fd = new FormData();
        fd.append('upload', this.selectedFile, this.selectedFile.name);//for FormData, use fd. for binary, use selectedFile
        this.imageService
            .Upload(/*fd*/this.selectedFile)
            .subscribe(res => {
                console.log(res)
            });
    }
}
