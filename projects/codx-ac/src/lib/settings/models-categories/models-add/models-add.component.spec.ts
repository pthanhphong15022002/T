import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsAddComponent } from './models-add.component';

describe('PopAddInventoryComponent', () => {
  let component: ModelsAddComponent;
  let fixture: ComponentFixture<ModelsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
