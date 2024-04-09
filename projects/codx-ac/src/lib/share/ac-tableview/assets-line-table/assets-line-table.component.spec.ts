import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsLineTableComponent } from './assets-line-table.component';

describe('AssetsLineTableComponent', () => {
  let component: AssetsLineTableComponent;
  let fixture: ComponentFixture<AssetsLineTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetsLineTableComponent]
    });
    fixture = TestBed.createComponent(AssetsLineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
