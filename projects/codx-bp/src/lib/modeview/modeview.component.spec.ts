import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeviewComponent } from './modeview.component';

describe('ModeviewComponent', () => {
  let component: ModeviewComponent;
  let fixture: ComponentFixture<ModeviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModeviewComponent]
    });
    fixture = TestBed.createComponent(ModeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
