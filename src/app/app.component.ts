import { Component } from '@angular/core';
import { HashingComponent } from './hashing/hashing.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HashingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'CHA-42';
  wert?: string;
  message?: string;

  constructor() {
    this.wert = '';
    this.message = '';
  }

  receiveHashValues(hash: string) {
    this.wert = hash;
    // console.log('Received hash value:', hash);
  }
  receiveMessage(message: string) {
    this.message = message;
    // console.log('Received message:', message);
  }
}
