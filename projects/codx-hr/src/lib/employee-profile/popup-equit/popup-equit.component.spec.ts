import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEquitComponent } from './popup-equit.component';

describe('PopupEquitComponent', () => {
  let component: PopupEquitComponent;
  let fixture: ComponentFixture<PopupEquitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupEquitComponent]
    });
    fixture = TestBed.createComponent(PopupEquitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
