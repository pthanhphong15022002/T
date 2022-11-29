import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEAssetsComponent } from './popup-eassets.component';

describe('PopupEAssetsComponent', () => {
  let component: PopupEAssetsComponent;
  let fixture: ComponentFixture<PopupEAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEAssetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
