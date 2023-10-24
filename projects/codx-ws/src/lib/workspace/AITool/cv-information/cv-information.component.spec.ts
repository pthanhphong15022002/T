import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvInformationComponent } from './cv-information.component';

describe('CvInformationComponent', () => {
  let component: CvInformationComponent;
  let fixture: ComponentFixture<CvInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CvInformationComponent]
    });
    fixture = TestBed.createComponent(CvInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
