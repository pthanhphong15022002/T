import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxView2Component } from './codx-view2.component';

describe('CodxView2Component', () => {
  let component: CodxView2Component;
  let fixture: ComponentFixture<CodxView2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxView2Component]
    });
    fixture = TestBed.createComponent(CodxView2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
