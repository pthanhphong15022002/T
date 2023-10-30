import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalsAddIdimcontrolComponent } from './journals-add-idimcontrol.component';

describe('JournalsAddIdimcontrolComponent', () => {
  let component: JournalsAddIdimcontrolComponent;
  let fixture: ComponentFixture<JournalsAddIdimcontrolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JournalsAddIdimcontrolComponent]
    });
    fixture = TestBed.createComponent(JournalsAddIdimcontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
