import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElecticSearchComponent } from './electic-search.component';

describe('ElecticSearchComponent', () => {
  let component: ElecticSearchComponent;
  let fixture: ComponentFixture<ElecticSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElecticSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElecticSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
