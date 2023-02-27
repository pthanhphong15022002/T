import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddItemConversionComponent } from './popup-add-item-conversion.component';

describe('PopupAddItemConversionComponent', () => {
  let component: PopupAddItemConversionComponent;
  let fixture: ComponentFixture<PopupAddItemConversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddItemConversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddItemConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
