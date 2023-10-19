import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupInputPointsComponent } from './popup-input-points.component';

describe('PopupInputPointsComponent', () => {
  let component: PopupInputPointsComponent;
  let fixture: ComponentFixture<PopupInputPointsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupInputPointsComponent]
    });
    fixture = TestBed.createComponent(PopupInputPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
