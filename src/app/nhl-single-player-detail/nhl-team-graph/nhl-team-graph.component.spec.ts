import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NhlTeamGraphComponent } from './nhl-team-graph.component';

describe('NhlTeamGraphComponent', () => {
  let component: NhlTeamGraphComponent;
  let fixture: ComponentFixture<NhlTeamGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NhlTeamGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NhlTeamGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
