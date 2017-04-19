import { Output, EventEmitter } from '@angular/core';

/**
 * Pass through events from cards
*/
export class BaseCardEventHandler {
  // pass through the delete/edit events from the underlying card
  @Output()
  public deleteEvent = new EventEmitter();
  @Output()
  public editEvent = new EventEmitter();
  public handleDelete(event): void {
    this.deleteEvent.next(event);
  }

  public handleEdit(event): void {
    this.editEvent.next(event);
  }
}