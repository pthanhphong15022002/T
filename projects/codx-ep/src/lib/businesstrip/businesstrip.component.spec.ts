import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinesstripComponent } from './businesstrip.component';

describe('BusinesstripComponent', () => {
  let component: BusinesstripComponent;
  let fixture: ComponentFixture<BusinesstripComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinesstripComponent]
    });
    fixture = TestBed.createComponent(BusinesstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
