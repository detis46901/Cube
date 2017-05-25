import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundariesComponent } from './boundaries.component';

describe('BoundariesComponent', () => {
  let component: BoundariesComponent;
  let fixture: ComponentFixture<BoundariesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundariesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
