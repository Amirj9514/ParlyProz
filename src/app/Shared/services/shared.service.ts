import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  sharedData = new BehaviorSubject({});
  roomsExpirationTime: any = 5 * 60;
  footerLogo: any = true;
  smsPageId: any = 0;
  access_level_name: string = '';

  constructor(private httpClient: HttpClient) {}

  getTimeZone() {
    return '?timezone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  /** to get data this.sharedService.getData().subscribe((data: any) => {}) **/
  public getData() {
    let storedData = localStorage.getItem('sharedData@LeagueApps');
    this.sharedData.next(JSON.parse(storedData || '{}'));
    return this.sharedData.asObservable();
  }

  /** to insert data this.sharedService.insertData({ key: 'name', val: response.data }) **/
  public insertData(data: any) {
    this.sharedData.next({
      ...this.sharedData.getValue(),
      [data.key]: data.val,
    });
    localStorage.setItem(
      'sharedData@LeagueApps',
      JSON.stringify(this.sharedData.value)
    );
  }

  /** Get Request **/
  public sendGetRequest(target: string): Observable<any[]> {
    return this.httpClient.get<any[]>(environment.apiUrl + target);
  }

  /** Get Request  with auth  Token **/

  public sendGetRequest2(target: string, token: any): Observable<any[]> {
    var headers_object = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const httpOptions = {
      headers: headers_object,
    };
    return this.httpClient.get<any>(environment.apiUrl + target + httpOptions);
  }

  /** Post Request **/
  public sendPostRequest(target: string, data: any): Observable<any[]> {
    return this.httpClient.post<any[]>(environment.apiUrl + target, data);
  }
}
