import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  apiURL = environment.apiURL;
  prefixUrlByCountry: string;
  header: any;

  // local storage var
  username: string;
  token: string;
  jwtToken: string;

  notificationsCount$ = new Subject<number>();
  notificationsCount = this.notificationsCount$.asObservable();

  constructor(private httpClient: HttpClient) { }

  /**
   * @name prepareHeadersForHttpRequest
   * @description Prepare headers for all http requests
   */
  prepareHeaderForRequest() {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.username = localStorage.getItem('userName');
    this.header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
  }

  /**
   * @name getNotificationsHistory
   * @description Get list of notifications
   * @param page -- page number
   * @param pageSize -- number of notification show on page
   */
  getNotificationsHistory(page: number, pageSize: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/NotificationsHistory';
    return this.httpClient.get(url + '?tag=' + this.username + '&page=' + page + '&pageSize='
      + pageSize + '&orderBy=' + 'date' + '&ascending=' + true, { headers: this.header });
  }

  /**
   * @name unreadNotifications
   * @descriptionget Get number of unread notifications
   */
  unreadNotifications() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/UnreadNotifications';
    this.httpClient.get(url + '?tag=' + this.username, { headers: this.header })
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.notificationsCount$.next(response.count);
          console.log('Notifications count= ' + this.notificationsCount$);
        }
      });
  }

  /**
   * @name markAsRead
   * @descriptionget mark notification as seen
   * @param notificationId
   */
  markAsRead(notificationId: number) {
    this.prepareHeaderForRequest();
    const body = {
      tag: this.username,
      notificationId
    };
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/NotificationSeen';
    return this.httpClient.post(url, body, { headers: this.header });
  }

  /**
   * @name markAsNotRead
   * @description mark notification as not seen
   * @param notificationId
   */
  markAsNotRead(notificationId: number) {
    this.prepareHeaderForRequest();
    const body = {
      tag: this.username,
      notificationId
    };
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/NotificationNotSeen';
    return this.httpClient.post(url, body, { headers: this.header });
  }

}
