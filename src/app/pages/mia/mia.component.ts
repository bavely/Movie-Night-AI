import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MiaService } from "./mia.service";
import { AvatarModule } from 'primeng/avatar';
import { MoviecontainerComponent } from '../../component/common/moviecontainer/moviecontainer.component';
import { format } from 'date-fns';
import { NgxTypewriterComponent } from '@omnedia/ngx-typewriter';

@Component({
  selector: 'app-mia',
  standalone: true,
  imports: [AvatarModule, FormsModule, MoviecontainerComponent, NgxTypewriterComponent],
  templateUrl: './mia.component.html',
  styleUrls: ['./mia.component.css']  // Corrected to styleUrls
})
export class MiaComponent implements AfterViewChecked, OnInit {

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages = [
    {
      id: Math.floor(Math.random() * 1000),
      message: "Hello, this is your Movies Insights Assistant or MIA. I am a movie recommendation bot. I can help you to find out what movies you might like. You can ask me about any movie. I can also recommend you some movies. How can I help you?",
      roll: "mia",
      time: format(new Date(), 'Pp')
    }
  ];
  sugestedMovies: any[] = [];
  messageInput!: string;
isInit = true;

  constructor(public mianservice: MiaService, private elementRef: ElementRef) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  ngOnInit(): void {


    if (localStorage.getItem('messages')) {
      this.messages = JSON.parse(localStorage.getItem('messages')!);
    }

    if (localStorage.getItem('sugestedMovies')) {
      this.sugestedMovies = JSON.parse(localStorage.getItem('sugestedMovies')!);
    }
  }

  handleMoviesSearch(mas: string) {
    let unCleanKeywords = mas?.split('"');
    if (unCleanKeywords) {
      let keywords: string[] = [];
      unCleanKeywords.forEach((k, i) => {
        if (k.includes('++')) {
          keywords.push(unCleanKeywords[i + 1]);
        } else {
          keywords.push("");
        }
      });

      const filteredKeywords = keywords.filter(k => k !== "" && k !== undefined);
      console.log(filteredKeywords);

      this.mianservice.getData(filteredKeywords).pipe().subscribe((data: any) => {
        console.log(data, "data");
        this.sugestedMovies = data.map((m: any) => m.results[0]).filter((m: any) => m !== undefined);

        // data.reduce((a: any, b: any) => [...a, ...b.results], [])
        //   .sort((a: any, b: any) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
        //   .slice(0, 5);

        localStorage.setItem('sugestedMovies', JSON.stringify(this.sugestedMovies));
        console.log(this.sugestedMovies);
      });
    }
  }

  async callOpenAi(ms: string) {
    const prompt = `Suggest a movie for me based on the following prompt: ${ms}. Make your response for any movie names between double quotes and ++ signs only before the movie name.`;

    await this.mianservice.openAiCall(prompt).then(mas => {
      this.isInit = false;
      this.handleMoviesSearch(mas || "");

      this.messages = [
        ...this.messages,
        {
          id: Math.floor(Math.random() * 1000),
          message: mas ?? "",
          roll: "mia",
          time: format(new Date(), 'Pp')
        }
      ];

      localStorage.setItem('messages', JSON.stringify(this.messages));
    });
  }

  sendMessage(m: string) {
    this.messages = [
      ...this.messages,
      {
        id: Math.floor(Math.random() * 1000),
        message: m,
        roll: "user",
        time: format(new Date(), 'Pp')
      }
    ];

    localStorage.setItem('messages', JSON.stringify(this.messages));
    this.messageInput = '';
    this.callOpenAi(m);
  }
}

