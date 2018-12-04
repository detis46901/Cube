import { TestBed, inject } from '@angular/core/testing';

import { FeatureModulesService } from './feature-modules.service';

describe('FeatureModulesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeatureModulesService]
    });
  });

  it('should be created', inject([FeatureModulesService], (service: FeatureModulesService) => {
    expect(service).toBeTruthy();
  }));
});
