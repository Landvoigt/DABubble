import { TestBed } from '@angular/core/testing';

import { ScreenServiceService } from './screen-service.service';

describe('ScreenServiceService', () => {
  let service: ScreenServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
