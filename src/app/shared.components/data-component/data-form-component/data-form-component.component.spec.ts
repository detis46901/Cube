import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFormComponentComponent } from './data-form-component.component';

describe('DataFormComponentComponent', () => {
  let component: DataFormComponentComponent;
  let fixture: ComponentFixture<DataFormComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFormComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
