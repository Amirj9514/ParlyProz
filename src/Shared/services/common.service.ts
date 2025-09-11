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
      name: 'Sportsbet',
      description: 'sportsBet',
      imageUrl: 'assets/images/sportbet.png',
    },
    {
      id: 3,
      uid: 'fanfunded',
      name: 'Fanfunded',
      description: 'fanfunded',
      imageUrl: 'assets/images/fan_funded.png',
    },
    {
      id: 4,
      uid: 'playerprofit',
      name: 'Player Profit',
      description: 'playerprofit',
      imageUrl: 'assets/images/playerProfit.png',
    },
  ];
  constructor() { }

  getApps() {
    const data = localStorage.getItem('sharedData@parlayProz');
    const parsedData = data ? JSON.parse(data ?? '{}') : {};

    if (!parsedData) {
      this.apps = [];
    }

    if (parsedData && parsedData.userProfile?.subscription_type === "normal") {
      this.apps = this.apps.filter((app) => app.uid !== 'fanfunded' && app.uid !== 'playerprofit');
    }
    return this.apps;
  }

  getSelectedApp(value: any) {
    if (!value || value.length < 1) {

      const data = localStorage.getItem('sharedData@parlayProz');
      const parsedData = data ? JSON.parse(data ?? '{}') : {};
      if (parsedData && parsedData.userProfile?.subscription_type === "normal") {
        const apps = this.apps.filter((app) => app.uid !== 'fanfunded' && app.uid !== 'playerprofit');
        return apps.map((stat: any) => stat.uid).join(',');
      }
      const apps = this.apps.map((stat: any) => stat.uid).join(',')
      return apps;
    }

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
