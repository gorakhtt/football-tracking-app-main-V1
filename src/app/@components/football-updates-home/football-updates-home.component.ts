import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeamStandingsInfo, TeamStnding } from '../../@model/standings';
import { COUNTRIES, LEAGUE_LIST } from '../../@constants/countries-constant';
import { Country, TeamLeague, TeamLeagueInfo } from '../../@model/team-league';
import { FootballUpdatesInfoService } from '../../@services/football-updates-info.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-football-updates-home',
  templateUrl: './football-updates-home.component.html',
  styleUrls: ['./football-updates-home.component.css'],
})
export class FootballUpdatesHomeComponent implements OnInit, OnDestroy {
  countriesList: Country[] = [];
  teamLeaguesList: TeamLeague[] = [];
  teamStandingInfo: TeamStnding[] = [];
  selectedLeagueId: number;
  subscription: Subscription = new Subscription();

  constructor(
    private readonly footballUpdatesInfoService: FootballUpdatesInfoService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getTeamLeagues();
  }

  getTeamLeagues(): void {
    this.subscription.add(
      this.footballUpdatesInfoService
        .getTeamLeagues()
        .subscribe((res: TeamLeagueInfo) => {
          this.teamLeaguesList = res.response.filter(
            (leagueInfo: TeamLeague) =>
              COUNTRIES.indexOf(leagueInfo.country.name) >= 1 &&
              LEAGUE_LIST.indexOf(leagueInfo.league.name) >= 1
          );
          const selectedLeague: TeamLeague =
            JSON.parse(localStorage.getItem('selectedLeagueInfo')!) ||
            this.teamLeaguesList[0];
          this.getStandingsForSelectedCountry(selectedLeague);
        })
    );
  }

  getStandingsForSelectedCountry(leagueInfo: TeamLeague): void {
    this.selectedLeagueId = leagueInfo.league.id;
    localStorage.setItem('selectedLeagueInfo', JSON.stringify(leagueInfo));
    this.subscription.add(
      this.footballUpdatesInfoService
        .getStandingsForSelectedCountry(leagueInfo)
        .subscribe((res: TeamStandingsInfo) => {
          this.teamStandingInfo = res.response;
        })
    );
  }

  goToTeamResults(id: number): void {
    this.router.navigate(['team-results', id]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
