import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCountingsComponent } from './asset-countings.component';

describe('AssetCountingsComponent', () => {
  let component: AssetCountingsComponent;
  let fixture: ComponentFixture<AssetCountingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetCountingsComponent]
    });
    fixture = TestBed.createComponent(AssetCountingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
