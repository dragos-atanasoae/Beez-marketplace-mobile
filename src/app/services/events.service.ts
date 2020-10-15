import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  event = new Subject();
  event$ = this.event.asObservable();

  constructor() { }

  publishEvent(topic: string) {
    this.event.next(topic);
  }

}
