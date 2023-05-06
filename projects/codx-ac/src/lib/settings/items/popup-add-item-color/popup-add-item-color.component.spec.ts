import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddItemColorComponent } from './popup-add-item-color.component';

describe('PopupAddItemColorComponent', () => {
  let component: PopupAddItemColorComponent;
  let fixture: ComponentFixture<PopupAddItemColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddItemColorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddItemColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
