import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableLineDetailStaticComponent } from './table-line-detail-static.component';

describe('TableLineDetailStaticComponent', () => {
  let component: TableLineDetailStaticComponent;
  let fixture: ComponentFixture<TableLineDetailStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableLineDetailStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableLineDetailStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
