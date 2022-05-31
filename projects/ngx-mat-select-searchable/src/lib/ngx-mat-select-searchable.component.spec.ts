import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMatSelectSearchableComponent } from './ngx-mat-select-searchable.component';

describe('NgxMatSelectSearchableComponent', () => {
  let component: NgxMatSelectSearchableComponent;
  let fixture: ComponentFixture<NgxMatSelectSearchableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxMatSelectSearchableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMatSelectSearchableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
