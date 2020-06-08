import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaserComponent } from './paser.component';

describe('LocatesComponent', () => {
  let component: PaserComponent;
  let fixture: ComponentFixture<PaserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
