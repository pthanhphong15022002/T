import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddItemStyleComponent } from './popup-add-item-style.component';

describe('PopupAddItemStyleComponent', () => {
  let component: PopupAddItemStyleComponent;
  let fixture: ComponentFixture<PopupAddItemStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddItemStyleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddItemStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
