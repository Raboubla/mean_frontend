import { TestBed } from '@angular/core/testing';

import { CommunicationServicesService } from './communication-services.service';

describe('CommunicationServicesService', () => {
  let service: CommunicationServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
