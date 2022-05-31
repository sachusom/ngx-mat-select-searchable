import { TestBed } from '@angular/core/testing';

import { NgxMatSelectSearchableService } from './ngx-mat-select-searchable.service';

describe('NgxMatSelectSearchableService', () => {
  let service: NgxMatSelectSearchableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMatSelectSearchableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
