import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddCardsComponent } from './popup-add-cards.component';

describe('PopupAddCardsComponent', () => {
  let component: PopupAddCardsComponent;
  let fixture: ComponentFixture<PopupAddCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
