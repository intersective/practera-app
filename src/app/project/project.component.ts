import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Observable } from "rxjs";
import { MilestoneService } from "./project.service";

@Component({
  selector: "app-project",
  templateUrl: "project.component.html",
  styleUrls: ["project.component.scss"]
})
export class ProjectComponent implements OnInit {
  
  constructor(
    location: Location,
    private router: Router,
    private milestoneService: MilestoneService
  ) {}

  location: Location;
  public activeMileStoneId = "";
  public levelPos1: number;

  public levels = [];

  ngOnInit() {
    // this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.milestoneService
      .getMilestons()
      .subscribe(levels => (this.levels = levels));
  }

  // activityRedirection(id) {
  //   this.router.navigate(['pages', 'tabs', { outlets: { activity: ['activity', id] } }]);
  // }
  // ionViewDidLoad(): void {
  //   this.levelPos1 = this.level1.nativeElement.getBoundingClientRect().top;
  // }

  // scrollTo(x: number, y: number, duration: number): void {
  //   this.content.scrollTo(x, y, duration);
  // }
  // scrollToTop(): void {
  //   this.content.scrollToTop(750);
  // }
  // scrollToBottom() {
  //   this.content.scrollToBottom(750);
  // }
}
