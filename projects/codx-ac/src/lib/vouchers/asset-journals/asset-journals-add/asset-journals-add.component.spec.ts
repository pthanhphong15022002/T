import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetJournalsAddComponent } from './asset-journals-add.component';

describe('AssetJournalsAddComponent', () => {
  let component: AssetJournalsAddComponent;
  let fixture: ComponentFixture<AssetJournalsAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetJournalsAddComponent]
    });
    fixture = TestBed.createComponent(AssetJournalsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
