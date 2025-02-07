import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedService } from '../../Shared/services/shared.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ProgressSpinnerModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  token: string | null = null;

  constructor(private route: ActivatedRoute , private sharedS:SharedService , private router:Router) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token'); 
      if(this.token) {
        this.verifyToken(this.token);
      }else{
         window.location.href = 'https://parlayproz.com/'
      }
    });
  }

  verifyToken(token: string) {
    const decodedString = token.replaceAll(' ' , '+');
    this.sharedS.sendGetRequest('nba/stat/fields' , decodedString).subscribe({
      next:(res:any)=>{
        if(res.status === 200) {
          let token = {key:'token' , val:decodedString};
          this.sharedS.insertData(token);
          this.router.navigate(['/']);
        }else{
          window.location.href = 'https://parlayproz.com/'
        }

      },error:(err:any)=>{
        console.log(err);
      }
    })
  }

}
