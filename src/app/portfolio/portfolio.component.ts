import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import * as Typed from 'typed.js';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css', './google-color.css'],
})
export class PortfolioComponent implements OnInit {
  constructor(private _router: Router) {}
  ngOnInit() {
    if (this._router.url == '/') {
      $('.particles-js-canvas-el').css('visibility', 'visible');
    }

    $(document).ready(() => {
      let trackClass: string;
      $('.social').hover(
        function (e) {
          var randomClass = getRandomClass();
          trackClass = randomClass;
          $(e.target).addClass(randomClass);
        },
        function (e) {
          $(e.target).removeClass(trackClass);
        }
      );
      function getRandomClass() {
        //Store available css classes
        var classes = new Array('g-green', 'g-red', 'g-yellow', 'g-blue');

        //Get a random number from 0 to 4
        var randomNumber = Math.floor(Math.random() * 4);

        return classes[randomNumber];
      }

      if (this._router.url == '/') {
        $('.particles-js-canvas-el').css('visibility', 'visible');
      }
    });

    let options = {
      strings: [
        'a Full Stack Developer',
        'an Angular Developer.',
        'a Flutter Developer.',
        'a React Developer.',
        'a Backend Developer.',
        'a ME(F/A/R)N Stack Developer.',
      ],
      typeSpeed: 50,
      backSpeed: 50,
      showCursor: true,
      cursorChar: '/',
      loop: true,
    };
    // @ts-ignore
    let typed = new Typed('.typed', options);
  }
}
