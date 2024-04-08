import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddAdvanceComponent } from './popup-add-advance.component';

describe('PopupAddAdvanceComponent', () => {
  let component: PopupAddAdvanceComponent;
  let fixture: ComponentFixture<PopupAddAdvanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddAdvanceComponent]
    });
    fixture = TestBed.createComponent(PopupAddAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
