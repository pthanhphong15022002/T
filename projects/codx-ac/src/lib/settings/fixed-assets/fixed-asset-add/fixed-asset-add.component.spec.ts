import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedAssetAddComponent } from './fixed-asset-add.component';

describe('PopupAddFixedAssetComponent', () => {
  let component: FixedAssetAddComponent;
  let fixture: ComponentFixture<FixedAssetAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedAssetAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedAssetAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
