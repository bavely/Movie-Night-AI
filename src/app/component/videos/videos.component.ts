import { Component,  OnInit} from '@angular/core';
import { SafeurlPipe } from '../common/safeurl.pipe';
@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [SafeurlPipe],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css',

})
export class VideosComponent implements OnInit {

  videos: any[] = []
 open : boolean = false
    videoBaseUrlp1 = "https://www.youtube.com/embed"
  videoapBaseUrlp2 = "?rel=0&autoplay=1&mute=1"
  noapP2 ="?rel=0&autoplay=0&mute=1"
  videosUrls : string[] = []
  TrailerUrl : string = ""

  constructor( ) {
    console.log(this.videos)
  }
  ngOnInit(): void {
    console.log(this.videos)
  }
  close() {
    this.open = false
    this.videosUrls = []
    this.TrailerUrl = ""
    this.videos = []
  }

  videosGetter(videos : any[]) {
    this.videos = videos
    this.open = true
    console.log(this.videos)
    // console.log(this.videos.find((video: any) => video.type === "Trailer"))
    this.TrailerUrl = this.videos.find((video: any) => video.type === "Trailer") ?`${this.videoBaseUrlp1}/${this.videos.find((video: any) => video.type === "Trailer")?.key}${this.videoapBaseUrlp2}` : ""
    // console.log(this.TrailerUrl)
    this.videosUrls = this.videos.filter((video: any) => video.type !== "Trailer").map((video: any) =>`${this.videoBaseUrlp1}/${video.key}${this.noapP2}`)
  }





}
