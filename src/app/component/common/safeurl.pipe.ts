import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Pipe({
  name: 'safeurl',
  standalone: true
})
export class SafeurlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string): unknown {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}


