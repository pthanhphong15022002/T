import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxContainersComponent } from './codx-containers.component';

describe('CodxContainersComponent', () => {
  let component: CodxContainersComponent;
  let fixture: ComponentFixture<CodxContainersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxContainersComponent]
    });
    fixture = TestBed.createComponent(CodxContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
