import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { format } from 'date-fns';
import { MiaService } from "./mia.service";
import { MoviecontainerComponent } from '../../component/common/moviecontainer/moviecontainer.component';

type ChatRole = "mia" | "user";

interface ChatMessage {
  id: number;
  message: string;
  roll: ChatRole;
  time: string;
}

interface MiaResponse {
  movies: string[];
  fullResponse: string;
}

@Component({
  selector: 'app-mia',
  standalone: true,
  imports: [AvatarModule, FormsModule, MoviecontainerComponent],
  templateUrl: './mia.component.html',
  styleUrls: ['./mia.component.css']
})
export class MiaComponent implements AfterViewChecked, OnInit {

  @ViewChild('chatContainer') private chatContainer?: ElementRef<HTMLElement>;

  private readonly messagesStorageKey = 'miaMessages';
  private readonly suggestedMoviesStorageKey = 'miaSuggestedMovies';
  private readonly legacyMessagesStorageKey = 'messages';
  private readonly legacySuggestedMoviesStorageKey = 'sugestedMovies';

  messages: ChatMessage[] = [
    this.createMessage(
      "Hello, this is your Movies Insights Assistant. Tell me what you want to watch and I will suggest movies.",
      "mia"
    )
  ];
  suggestedMovies: any[] = [];
  messageInput = '';
  isLoading = false;

  constructor(public miaService: MiaService) {}

  ngOnInit(): void {
    const storedMessages =
      this.readFromStorage<ChatMessage[]>(this.messagesStorageKey) ??
      this.readFromStorage<ChatMessage[]>(this.legacyMessagesStorageKey);
    const storedMovies =
      this.readFromStorage<any[]>(this.suggestedMoviesStorageKey) ??
      this.readFromStorage<any[]>(this.legacySuggestedMoviesStorageKey);

    if (Array.isArray(storedMessages) && storedMessages.length) {
      this.messages = storedMessages;
    }

    if (Array.isArray(storedMovies)) {
      this.suggestedMovies = storedMovies;
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const message = this.messageInput.trim();

    if (!message || this.isLoading) {
      return;
    }

    this.messages = [...this.messages, this.createMessage(message, "user")];
    this.saveMessages();
    this.messageInput = '';
    void this.callOpenAi(message);
  }

  private async callOpenAi(prompt: string): Promise<void> {
    this.isLoading = true;

    try {
      const response = await this.miaService.openAiCall(prompt);
      const parsedResponse = this.parseMiaResponse(response);

      this.messages = [
        ...this.messages,
        this.createMessage(parsedResponse.fullResponse || "I found a few movies that fit.", "mia")
      ];
      this.saveMessages();

      await this.updateSuggestedMovies(parsedResponse.movies);
    } catch (error) {
      console.error('MIA request failed', error);
      const message = error instanceof Error && error.message
        ? error.message
        : "Sorry, I couldn't get a response from MIA right now.";

      this.messages = [...this.messages, this.createMessage(message, "mia")];
      this.saveMessages();
    } finally {
      this.isLoading = false;
    }
  }

  private async updateSuggestedMovies(movieTitles: string[]): Promise<void> {
    const uniqueTitles = [...new Set(movieTitles.map(title => title.trim()).filter(Boolean))];

    if (!uniqueTitles.length) {
      this.suggestedMovies = [];
      this.saveSuggestedMovies();
      return;
    }

    this.suggestedMovies = await firstValueFrom(this.miaService.getSuggestedMovies(uniqueTitles));
    this.saveSuggestedMovies();
  }

  private parseMiaResponse(response: string | null | undefined): MiaResponse {
    if (!response?.trim()) {
      return { movies: [], fullResponse: "" };
    }

    const jsonText = this.extractJsonObject(response);

    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        const fullResponse = this.getResponseText(parsed, response);
        const movies = this.normalizeMovieTitles(parsed.movies ?? parsed.suggestions ?? parsed.titles);

        return {
          movies: movies.length ? movies : this.extractMovieTitlesFromText(fullResponse),
          fullResponse
        };
      } catch {
        return {
          movies: this.extractMovieTitlesFromText(response),
          fullResponse: response
        };
      }
    }

    return {
      movies: this.extractMovieTitlesFromText(response),
      fullResponse: response
    };
  }

  private extractJsonObject(response: string): string | null {
    const fencedJson = response.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fencedJson?.[1] ?? response).trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    return candidate.slice(start, end + 1);
  }

  private getResponseText(parsed: any, fallback: string): string {
    const text = parsed?.fullResponse ?? parsed?.response ?? parsed?.message;
    return typeof text === "string" && text.trim() ? text.trim() : fallback;
  }

  private normalizeMovieTitles(movies: unknown): string[] {
    if (!Array.isArray(movies)) {
      return [];
    }

    return movies
      .map(movie => {
        if (typeof movie === "string") {
          return movie;
        }

        if (movie && typeof movie === "object" && "title" in movie) {
          return String(movie.title);
        }

        return "";
      })
      .map(movie => this.cleanMovieTitle(movie))
      .filter(Boolean)
      .slice(0, 8);
  }

  private extractMovieTitlesFromText(text: string): string[] {
    const bulletTitles = text
      .split(/\r?\n/)
      .filter(line => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line))
      .map(line => this.cleanMovieTitle(line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")))
      .filter(Boolean);

    if (bulletTitles.length) {
      return [...new Set(bulletTitles)].slice(0, 8);
    }

    const quotedTitles = [...text.matchAll(/"([^"]{2,80})"/g)]
      .map(match => this.cleanMovieTitle(match[1]))
      .filter(Boolean);

    return [...new Set(quotedTitles)].slice(0, 8);
  }

  private cleanMovieTitle(title: string): string {
    return title
      .replace(/\[[^\]]+\]\([^)]+\)/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\*\*/g, "")
      .split(/\s[-–—:]\s/)[0]
      .replace(/\s+\((?:starring|with|from|http|https).*$/i, "")
      .replace(/\s*\((?:19|20)\d{2}\)\s*$/i, "")
      .trim();
  }

  private scrollToBottom(): void {
    const container = this.chatContainer?.nativeElement;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private createMessage(message: string, roll: ChatRole): ChatMessage {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      roll,
      time: format(new Date(), 'Pp')
    };
  }

  private saveMessages(): void {
    localStorage.setItem(this.messagesStorageKey, JSON.stringify(this.messages));
  }

  private saveSuggestedMovies(): void {
    localStorage.setItem(this.suggestedMoviesStorageKey, JSON.stringify(this.suggestedMovies));
  }

  private readFromStorage<T>(key: string): T | null {
    try {
      const rawValue = localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) as T : null;
    } catch {
      return null;
    }
  }
}
