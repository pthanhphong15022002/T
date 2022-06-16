import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStatusPopupComponent } from './update-status-popup.component';

describe('UpdateStatusPopupComponent', () => {
  let component: UpdateStatusPopupComponent;
  let fixture: ComponentFixture<UpdateStatusPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateStatusPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateStatusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
