import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetJournalsDetailComponent } from './asset-journals-detail.component';

describe('AssetJournalsDetailComponent', () => {
  let component: AssetJournalsDetailComponent;
  let fixture: ComponentFixture<AssetJournalsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetJournalsDetailComponent]
    });
    fixture = TestBed.createComponent(AssetJournalsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
