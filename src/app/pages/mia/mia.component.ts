import { Component, AfterViewInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MiaService} from "./mia.service";
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MoviecontainerComponent } from '../../component/common/moviecontainer/moviecontainer.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-mia',
  standalone: true,
  imports: [ButtonModule, AvatarModule, FormsModule, MoviecontainerComponent],
  templateUrl: './mia.component.html',
  styleUrl: './mia.component.css'
})
export class MiaComponent {

  messages = [
    {
      id : Math.floor(Math.random() * 1000),
      message : "Hello, this is your movie insight assistant or MIA. I am a movie recommendation bot. I can help you to find out what movies you might like. You can ask me about any movie. I can also recommend you some movies. How can I help you?",
      roll: "mia",
      time: format(new Date(), 'Pp')
    }
  ]
  sugestedMovies: any[] = []
  container: HTMLElement | undefined;
  messageInput!: string;

  constructor(public mianservice: MiaService) {

   }

   ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
if (localStorage.getItem('messages')) {
  this.messages = JSON.parse(localStorage.getItem('messages')!)
}

if (localStorage.getItem('sugestedMovies')) {
  this.sugestedMovies = JSON.parse(localStorage.getItem('sugestedMovies')!)
}
   }
   ngAfterViewInit() {
    this.container = document.getElementById("msgContainer") as HTMLElement;
    this.container.scrollTop = this.container?.scrollHeight;
  }

   handleMoviesSearch(mas: string) {
    let unCleanKeywords = mas?.split('"')
    if (unCleanKeywords){
      let keywords : string[] = []
      unCleanKeywords.forEach((k, i) => {
        if(k.includes('++')) {
          keywords.push(unCleanKeywords[i+1])
        }else {
           keywords.push("")
        }
      })

      console.log(keywords.filter(k => k !== "" && k !== undefined))
      this.mianservice.getData(keywords.filter(k => k !== "" && k !== undefined)).pipe().subscribe((data: any) => {
        console.log(data, "data")
        this.sugestedMovies = data.reduce((a: any, b: any) => [...a, ...b.results], []).sort((a: any, b: any) => b.release_date - a.release_date
      ).slice(0, 5)
      localStorage.setItem('sugestedMovies', JSON.stringify(this.sugestedMovies))
       console.log(this.sugestedMovies)
      })
    }
   }
async callOpenAi (ms: string) {
 await this.mianservice.openAiCall(`Suggest a movie for me based on the following prompt: ${ms}. and make your response for any movie names between double quotes and ++ signs only
  before the movie name`).then(mas => {
    this.handleMoviesSearch(mas || "")

    this.messages = [...JSON.parse(localStorage.getItem('messages')!), {
      id: Math.floor(Math.random() * 1000),
      message: mas, roll: "mia", time: format(new Date(), 'Pp')
    }]
      localStorage.setItem('messages', JSON.stringify(this.messages))
  })
 }

   sendMessage(m: string) {
    this.messages = [...this.messages, {
      id: Math.floor(Math.random() * 1000),
       message: m, roll: "user", time: format(new Date(), 'Pp')}]
   localStorage.setItem('messages', JSON.stringify(this.messages))

   this.callOpenAi(m)

this.messageInput = '';


  }

}
