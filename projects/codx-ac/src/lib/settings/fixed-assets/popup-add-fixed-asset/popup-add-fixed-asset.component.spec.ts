import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddFixedAssetComponent } from './popup-add-fixed-asset.component';

describe('PopupAddFixedAssetComponent', () => {
  let component: PopupAddFixedAssetComponent;
  let fixture: ComponentFixture<PopupAddFixedAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddFixedAssetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddFixedAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
