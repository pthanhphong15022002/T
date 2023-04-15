import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddLinereceiptsComponent } from './pop-add-linereceipts.component';

describe('PopAddLinereceiptsComponent', () => {
  let component: PopAddLinereceiptsComponent;
  let fixture: ComponentFixture<PopAddLinereceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddLinereceiptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddLinereceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
