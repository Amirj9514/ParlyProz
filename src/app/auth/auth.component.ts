import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedService } from '../../Shared/services/shared.service';
import { jwtDecode } from "jwt-decode";
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

  verifyToken(decodedString: string) {
   
    // = decodeURIComponent(decodedString);
    this.sharedS.sendGetRequest('nba/stat/fields' , decodedString).subscribe({
      next:(res:any)=>{
        if(res.status === 200) {
          let token = {key:'token' , val:decodedString};
          const decodedToken = jwtDecode(decodedString);
          const userProfile = {key:'userProfile' , val:decodedToken};
          this.sharedS.insertData(token);
          this.sharedS.insertData(userProfile);
          this.router.navigate(['/']);
        }else{
          window.location.href = 'https://parlayproz.com/'
        }
      },error:(err:any)=>{
        console.log(err);
      }
    })
  }


  fixBase64Url(str: string): string {
    return str.replace(/-/g, '+').replace(/_/g, '/');
}

}
