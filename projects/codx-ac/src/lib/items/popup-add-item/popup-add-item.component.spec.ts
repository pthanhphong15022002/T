import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddItemComponent } from './popup-add-item.component';

describe('PopupAddItemComponent', () => {
  let component: PopupAddItemComponent;
  let fixture: ComponentFixture<PopupAddItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
