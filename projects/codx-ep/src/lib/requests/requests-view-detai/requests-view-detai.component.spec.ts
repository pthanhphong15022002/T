import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsViewDetaiComponent } from './requests-view-detai.component';

describe('RequestsViewDetaiComponent', () => {
  let component: RequestsViewDetaiComponent;
  let fixture: ComponentFixture<RequestsViewDetaiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestsViewDetaiComponent]
    });
    fixture = TestBed.createComponent(RequestsViewDetaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
