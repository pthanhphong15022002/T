import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddCaseComponent } from './popup-add-case.component';

describe('PopupAddCaseComponent', () => {
  let component: PopupAddCaseComponent;
  let fixture: ComponentFixture<PopupAddCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddCaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
