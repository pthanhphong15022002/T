import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectScrollBarComponent } from './select-scroll-bar.component';

describe('SelectScrollBarComponent', () => {
  let component: SelectScrollBarComponent;
  let fixture: ComponentFixture<SelectScrollBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectScrollBarComponent]
    });
    fixture = TestBed.createComponent(SelectScrollBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
