import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NhlPlayerTableComponent } from './nhl-player-table.component';

describe('NhlPlayerTableComponent', () => {
  let component: NhlPlayerTableComponent;
  let fixture: ComponentFixture<NhlPlayerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NhlPlayerTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NhlPlayerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
