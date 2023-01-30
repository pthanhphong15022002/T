import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMoveStageComponent } from './popup-move-stage.component';

describe('PopupMoveStageComponent', () => {
  let component: PopupMoveStageComponent;
  let fixture: ComponentFixture<PopupMoveStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupMoveStageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupMoveStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
