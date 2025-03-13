import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HashingComponent } from './hashing/hashing.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HashingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CHA-42';
  wert?: number;

  constructor()
  {
    this.wert = 3;
  }

  receiveHashValues(value: number) {
    this.wert = value;
    console.log('Received hash value:', value);
  }
}
