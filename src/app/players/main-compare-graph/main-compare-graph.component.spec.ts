import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCompareGraphComponent } from './main-compare-graph.component';

describe('MainCompareGraphComponent', () => {
  let component: MainCompareGraphComponent;
  let fixture: ComponentFixture<MainCompareGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCompareGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCompareGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
