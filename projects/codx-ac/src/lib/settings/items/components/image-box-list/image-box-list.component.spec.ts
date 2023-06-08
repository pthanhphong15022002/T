import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageBoxListComponent } from './image-box-list.component';

describe('ImageBoxListComponent', () => {
  let component: ImageBoxListComponent;
  let fixture: ComponentFixture<ImageBoxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageBoxListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageBoxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
