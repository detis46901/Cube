import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SDSComponent } from './SDS.component';

describe('LocatesComponent', () => {
  let component: SDSComponent;
  let fixture: ComponentFixture<SDSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SDSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SDSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
