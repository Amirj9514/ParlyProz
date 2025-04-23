import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private apps: any[] = [
    {
      id: 1,
      uid: 'stake',
      name: 'Stake',
      description: 'Stake',
      imageUrl: 'assets/images/stakes.png',
    },
    {
      id: 2,
      uid: 'betOnline',
      name: 'BetOnline',
      description: 'betOnline',
      imageUrl: 'assets/images/betOnlineWhite.svg',
    },
    {
      id: 2,
      uid: 'sportsBet',
      name: 'Sportsbet.io',
      description: 'sportsBet',
      imageUrl: 'assets/images/sportbet.png',
    },
  ];
  constructor() {}

  getApps() {
    return this.apps;
  }

  getSelectedApp(value: any) {
    if (!value || value.length < 1) return '';
    const apps = value.map((stat: any) => stat.uid).join(',');
    return apps;
  }

  getImageUrl(value: any) {
    const app = this.apps.find((app) => app.uid === value);
    if (app) {
      return app.imageUrl;
    } else {
      return '';
    }
  }

  getTeams(value: any) {
    if (!value) return { team_a: '', team_b: '' };
    return {
      team_b: value.second_competitor_abbreviation ?? '',
      team_a: value.first_competitor_abbreviation ?? '',
    };
  }
}
