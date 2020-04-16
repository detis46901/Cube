import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-html-form',
  templateUrl: './html-form.component.html',
  styleUrls: ['./html-form.component.css']
})
export class HtmlFormComponent implements OnInit {

  @Input() wmsFeatureData: string
  constructor() { }

  ngOnInit(): void {
  }

}
