import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddItemSizeComponent } from './popup-add-item-size.component';

describe('PopupAddItemSizeComponent', () => {
  let component: PopupAddItemSizeComponent;
  let fixture: ComponentFixture<PopupAddItemSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddItemSizeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddItemSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
