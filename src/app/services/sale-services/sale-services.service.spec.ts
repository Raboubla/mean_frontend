import { TestBed } from '@angular/core/testing';

import { SaleServicesService } from './sale-services.service';

describe('SaleServicesService', () => {
  let service: SaleServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
