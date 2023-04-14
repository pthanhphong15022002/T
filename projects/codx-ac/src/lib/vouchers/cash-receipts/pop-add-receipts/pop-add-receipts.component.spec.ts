import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddReceiptsComponent } from './pop-add-receipts.component';

describe('PopAddReceiptsComponent', () => {
  let component: PopAddReceiptsComponent;
  let fixture: ComponentFixture<PopAddReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddReceiptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
