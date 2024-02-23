import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailTemplateComponent } from './view-detail-template.component';

describe('ViewDetailTemplateComponent', () => {
  let component: ViewDetailTemplateComponent;
  let fixture: ComponentFixture<ViewDetailTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDetailTemplateComponent]
    });
    fixture = TestBed.createComponent(ViewDetailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
