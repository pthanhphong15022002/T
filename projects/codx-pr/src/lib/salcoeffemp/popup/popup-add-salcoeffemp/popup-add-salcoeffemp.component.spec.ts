import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddSalcoeffempComponent } from './popup-add-salcoeffemp.component';

describe('PopupAddSalcoeffempComponent', () => {
  let component: PopupAddSalcoeffempComponent;
  let fixture: ComponentFixture<PopupAddSalcoeffempComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddSalcoeffempComponent]
    });
    fixture = TestBed.createComponent(PopupAddSalcoeffempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
