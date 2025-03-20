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
  key = 0;

  sendMessageToHashingComponent() {
    this.message = this.inputMessage;
  }
  resetToZero() {
    this.inputMessage = "";
    this.message = this.inputMessage;
    this.wert = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }

  receiveHashValues(hash: string) {
    this.wert = hash;
  }

  receiveMessage(message: string) {
    this.message = message;
  }
}
