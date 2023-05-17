import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabLeadDetailComponent } from './tab-lead-detail.component';

describe('TabLeadDetailComponent', () => {
  let component: TabLeadDetailComponent;
  let fixture: ComponentFixture<TabLeadDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabLeadDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabLeadDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
