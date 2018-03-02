import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    constructor() { }

    ngOnInit() {
    }

}
