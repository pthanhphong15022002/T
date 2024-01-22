import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetJournalsComponent } from './asset-journals.component';

describe('AssetJournalsComponent', () => {
  let component: AssetJournalsComponent;
  let fixture: ComponentFixture<AssetJournalsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetJournalsComponent]
    });
    fixture = TestBed.createComponent(AssetJournalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
