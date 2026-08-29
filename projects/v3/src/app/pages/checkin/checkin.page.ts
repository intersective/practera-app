import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApolloService } from '@v3/services/apollo.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

type CheckinState = 'loading' | 'success' | 'error' | 'no-token';

@Component({
  standalone: false,
  selector: 'app-checkin',
  templateUrl: './checkin.page.html',
  styleUrls: ['./checkin.page.scss'],
})
export class CheckinPage implements OnInit {
  state: CheckinState = 'loading';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apolloService: ApolloService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'no-token';
      return;
    }
    this.checkIn(token);
  }

  private checkIn(token: string) {
    this.apolloService
      .graphQLMutate(
        `mutation CheckInSession($token: String!) {
          checkInSession(token: $token) {
            success
            message
          }
        }`,
        { token },
      )
      .pipe(
        map((r: any) => r?.data?.checkInSession),
        catchError(err => {
          return of({ success: false, message: err?.message ?? 'Check-in failed' });
        }),
      )
      .subscribe(result => {
        if (result?.success) {
          this.state = 'success';
        } else {
          this.state = 'error';
          this.errorMessage = result?.message ?? 'Check-in failed. The token may have expired.';
        }
      });
  }

  goToEvents() {
    this.router.navigate(['/v3/events']);
  }
}
