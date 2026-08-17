import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DialogHost } from './shared/components/dialog-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DialogHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
