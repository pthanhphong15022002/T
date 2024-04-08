import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddBusinesstripComponent } from './popup-add-businesstrip.component';

describe('PopupAddBusinesstripComponent', () => {
  let component: PopupAddBusinesstripComponent;
  let fixture: ComponentFixture<PopupAddBusinesstripComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddBusinesstripComponent]
    });
    fixture = TestBed.createComponent(PopupAddBusinesstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
