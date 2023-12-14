import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewfileComponent } from './viewfile.component';

describe('ViewfileComponent', () => {
  let component: ViewfileComponent;
  let fixture: ComponentFixture<ViewfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewfileComponent]
    });
    fixture = TestBed.createComponent(ViewfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
