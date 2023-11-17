import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutNoToolbarComponent } from './layout-no-toolbar.component';

describe('LayoutNoToolbarComponent', () => {
  let component: LayoutNoToolbarComponent;
  let fixture: ComponentFixture<LayoutNoToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutNoToolbarComponent]
    });
    fixture = TestBed.createComponent(LayoutNoToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
