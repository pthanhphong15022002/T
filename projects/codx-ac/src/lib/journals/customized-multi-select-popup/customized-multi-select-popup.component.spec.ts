import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizedMultiSelectPopupComponent } from './customized-multi-select-popup.component';

describe('CustomizedMultiSelectPopupComponent', () => {
  let component: CustomizedMultiSelectPopupComponent;
  let fixture: ComponentFixture<CustomizedMultiSelectPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomizedMultiSelectPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizedMultiSelectPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
