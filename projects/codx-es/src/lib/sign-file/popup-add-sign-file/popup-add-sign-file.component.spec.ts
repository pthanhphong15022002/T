import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddSignFileComponent } from './popup-add-sign-file.component';

describe('EditSignFileComponent', () => {
  let component: PopupAddSignFileComponent;
  let fixture: ComponentFixture<PopupAddSignFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupAddSignFileComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddSignFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
