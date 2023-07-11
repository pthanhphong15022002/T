import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMultiselectvllComponent } from './popup-multiselectvll.component';

describe('PopupMultiselectvllComponent', () => {
  let component: PopupMultiselectvllComponent;
  let fixture: ComponentFixture<PopupMultiselectvllComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupMultiselectvllComponent]
    });
    fixture = TestBed.createComponent(PopupMultiselectvllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
