import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupIncludeExcludeObjComponent } from './popup-include-exclude-obj.component';

describe('PopupIncludeExcludeObjComponent', () => {
  let component: PopupIncludeExcludeObjComponent;
  let fixture: ComponentFixture<PopupIncludeExcludeObjComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupIncludeExcludeObjComponent]
    });
    fixture = TestBed.createComponent(PopupIncludeExcludeObjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
