import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewFileComponent } from './popup-view-file.component';

describe('PopupViewFileComponent', () => {
  let component: PopupViewFileComponent;
  let fixture: ComponentFixture<PopupViewFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupViewFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
