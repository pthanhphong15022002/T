import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyUserinfoComponent } from './property-userinfo.component';

describe('PropertyUserinfoComponent', () => {
  let component: PropertyUserinfoComponent;
  let fixture: ComponentFixture<PropertyUserinfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyUserinfoComponent]
    });
    fixture = TestBed.createComponent(PropertyUserinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
