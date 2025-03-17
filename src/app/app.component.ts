import { Component } from '@angular/core';
import { HashingComponent } from './hashing/hashing.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HashingComponent, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'CHA-42';
  wert?: string;
  message?: string;
  inputMessage: string = ''; 

  sendMessageToHashingComponent() {
    this.message = this.inputMessage;
  }

  receiveHashValues(hash: string) {
    this.wert = hash;
  }

  receiveMessage(message: string) {
    this.message = message;
  }
}
