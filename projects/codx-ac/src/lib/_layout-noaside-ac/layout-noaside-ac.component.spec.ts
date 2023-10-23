import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutNoasideAcComponent } from './layout-noaside-ac.component';

describe('LayoutNoasideAcComponent', () => {
  let component: LayoutNoasideAcComponent;
  let fixture: ComponentFixture<LayoutNoasideAcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutNoasideAcComponent]
    });
    fixture = TestBed.createComponent(LayoutNoasideAcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
