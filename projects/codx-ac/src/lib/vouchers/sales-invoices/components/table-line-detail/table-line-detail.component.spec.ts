import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableLineDetailComponent } from './table-line-detail.component';

describe('TableLineDetailComponent', () => {
  let component: TableLineDetailComponent;
  let fixture: ComponentFixture<TableLineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableLineDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableLineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
