import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenAerialMapComponent } from './open-aerial-map.component';

describe('OpenAerialMapComponent', () => {
  let component: OpenAerialMapComponent;
  let fixture: ComponentFixture<OpenAerialMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenAerialMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenAerialMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
