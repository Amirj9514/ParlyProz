import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStatsGraphComponent } from './player-stats-graph.component';

describe('PlayerStatsGraphComponent', () => {
  let component: PlayerStatsGraphComponent;
  let fixture: ComponentFixture<PlayerStatsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerStatsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerStatsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
