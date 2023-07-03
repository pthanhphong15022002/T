import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewFileFullComponent } from './popup-view-file-full.component';

describe('PopupViewFileFullComponent', () => {
  let component: PopupViewFileFullComponent;
  let fixture: ComponentFixture<PopupViewFileFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewFileFullComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupViewFileFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
