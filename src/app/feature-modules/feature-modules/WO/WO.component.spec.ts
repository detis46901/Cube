import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WOComponent } from './WO.component';

describe('WOComponent', () => {
  let component: WOComponent;
  let fixture: ComponentFixture<WOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
