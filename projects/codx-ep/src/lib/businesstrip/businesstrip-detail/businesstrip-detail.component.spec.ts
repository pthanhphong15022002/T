import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinesstripDetailComponent } from './businesstrip-detail.component';

describe('BusinesstripDetailComponent', () => {
  let component: BusinesstripDetailComponent;
  let fixture: ComponentFixture<BusinesstripDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinesstripDetailComponent]
    });
    fixture = TestBed.createComponent(BusinesstripDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
