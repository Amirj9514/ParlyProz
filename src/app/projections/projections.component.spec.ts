import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionsComponent } from './projections.component';

describe('ProjectionsComponent', () => {
  let component: ProjectionsComponent;
  let fixture: ComponentFixture<ProjectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
