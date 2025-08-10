import { TestBed } from '@angular/core/testing';

import { LocateuploadService } from './locateupload.service';

describe('LocateuploadService', () => {
  let service: LocateuploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocateuploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
