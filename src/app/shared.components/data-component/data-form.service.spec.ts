import { TestBed } from '@angular/core/testing';

import { DataFormService } from './data-form.service';

describe('DataFormService', () => {
  let service: DataFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
