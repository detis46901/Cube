import { Component, OnInit, Input } from '@angular/core';
import { RequestOptions, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'change-picture',
    templateUrl: './change-picture.component.html',
    styleUrls: ['./change-picture.component.scss']
})

export class ChangePictureComponent implements OnInit {
    @Input() userID;

    constructor(private http: Http) {     
    }

    ngOnInit() {
    }

    private importImage() {
        console.log("import image")
    }

    // private fileChange(event) {
    //     let fileList: FileList = event.target.files;
    //     if(fileList.length > 0) {
    //         let file: File = fileList[0];
    //         let formData:FormData = new FormData();
    //         formData.append('uploadFile', file, file.name);
    //         let headers = new Headers();
    //         headers.append('Accept', 'application/json');
    //         let options = new RequestOptions({ headers: headers });
    //         this.http.post(`${this.apiEndPoint}`, formData, options)
    //             .map(res => res.json())
    //             .catch(error => Observable.throw(error))
    //             .subscribe(
    //                 data => console.log('success'),
    //                 error => console.log(error)
    //             )
    //     }
    // }
}
