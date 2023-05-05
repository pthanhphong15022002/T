import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupForeignWorkerComponent } from './popup-foreign-worker.component';

describe('PopupForeignWorkerComponent', () => {
  let component: PopupForeignWorkerComponent;
  let fixture: ComponentFixture<PopupForeignWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupForeignWorkerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupForeignWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
