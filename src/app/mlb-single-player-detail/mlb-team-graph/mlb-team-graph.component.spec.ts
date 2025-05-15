import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlbTeamGraphComponent } from './mlb-team-graph.component';

describe('MlbTeamGraphComponent', () => {
  let component: MlbTeamGraphComponent;
  let fixture: ComponentFixture<MlbTeamGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlbTeamGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlbTeamGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
