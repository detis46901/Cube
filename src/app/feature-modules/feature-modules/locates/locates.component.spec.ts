import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocatesComponent } from './locates.component';

describe('LocatesComponent', () => {
  let component: LocatesComponent;
  let fixture: ComponentFixture<LocatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
