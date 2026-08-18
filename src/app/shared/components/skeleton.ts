import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <span
      class="block animate-pulse bg-panel-2"
      [style.width]="width()"
      [style.height]="height()"
      [style.borderRadius]="rounded()"
    ></span>
  `,
})
export class Skeleton {
  width = input<string>('100%');
  height = input<string>('1rem');
  rounded = input<string>('6px');
}
