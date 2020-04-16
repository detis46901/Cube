import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlFormComponent } from './html-form.component';

describe('HtmlFormComponent', () => {
  let component: HtmlFormComponent;
  let fixture: ComponentFixture<HtmlFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtmlFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
