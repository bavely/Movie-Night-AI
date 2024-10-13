import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gsap } from "gsap";
import { Router } from '@angular/router';
import { ListComponent } from '../../component/common/list/list.component';
import { AdvancedService } from './advanced.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-advanced',
  standalone: true,
  imports: [ListComponent, FormsModule],
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.css'
})
export class AdvancedComponent {
  public wasInside = false;
  public width = '50%';


  transition() {
    console.log(this.wasInside)
    gsap.to('#formContainer', {
      width: this.wasInside ? '100%' : '50%',
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  // @HostListener('click')
  clickInside() {
    this.wasInside = true;
    this.transition()
  }

  clickOutside() {
    this.wasInside = false;
    this.transition()
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: any): void {
    const isClickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!isClickedInside) {
      this.wasInside = false;
      this.transition()
    }
  }



  constructor(private router: Router, private elementRef: ElementRef, private advancedserv: AdvancedService) {
  }

  goBack() {
    this.router.navigate(['/']);
  }


  data: any[] = [];
  page: number = 1;
  keyword: string = "";
  private scrollSubject = new BehaviorSubject<number>(this.page);
  loading = false;
  inputs = ""
  ngOnInit() {
    this.loadData();

    this.scrollSubject
      .pipe(
        debounceTime(300), // Prevent too many requests
        switchMap((page) => {
          this.loading = true;
          if (this.keyword !== "") {

            return this.advancedserv.getData(page, this.keyword);
          } else {
            return this.advancedserv.getData(page, '');
          }

        })
      )
      .subscribe((newData: { results: [] }) => {
        this.data = [...this.data, ...newData.results];
        console.log(this.data);
        this.loading = false;
      });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    console.log('scrolled');

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 100 && !this.loading) {
      this.page++;
      this.scrollSubject.next(this.page);
    }
  }

  private loadData(): void {
    this.scrollSubject.next(this.page);
  }

  search() {
    this.keyword = this.inputs;
    this.page = 1;
    this.loadData();
  }


}
