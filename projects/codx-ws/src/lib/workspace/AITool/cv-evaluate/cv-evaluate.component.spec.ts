import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvEvaluateComponent } from './cv-evaluate.component';

describe('CvEvaluateComponent', () => {
  let component: CvEvaluateComponent;
  let fixture: ComponentFixture<CvEvaluateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CvEvaluateComponent]
    });
    fixture = TestBed.createComponent(CvEvaluateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
