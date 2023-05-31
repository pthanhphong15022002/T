import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectPopupComponent } from './multi-select-popup.component';

describe('CustomizedMultiSelectPopupComponent', () => {
  let component: MultiSelectPopupComponent;
  let fixture: ComponentFixture<MultiSelectPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiSelectPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
