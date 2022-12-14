import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupETimeCardComponent } from './popup-etime-card.component';

describe('PopupETimeCardComponent', () => {
  let component: PopupETimeCardComponent;
  let fixture: ComponentFixture<PopupETimeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupETimeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupETimeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
