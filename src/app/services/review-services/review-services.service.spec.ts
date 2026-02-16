import { TestBed } from '@angular/core/testing';

import { ReviewServicesService } from './review-services.service';

describe('ReviewServicesService', () => {
  let service: ReviewServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
