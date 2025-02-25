import { Component } from '@angular/core';
import { Usuario } from '../../entidades/usuario';
import { Libro } from "../../entidades/Libro";
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from "../../services/usuarios.service";
import { switchMap } from 'rxjs/operators';
import { forkJoin, of, Observable } from 'rxjs';
import { AmigosService } from '../../services/amigos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vista-usuarios',
  templateUrl: './vista-usuarios.component.html',
  styleUrl: './vista-usuarios.component.css'
})
export class VistaUsuariosComponent {
  constructor(private route: ActivatedRoute, 
  	private usuarioService: UsuariosService, 
  	private amigosService: AmigosService, 
  	private _snackBar: MatSnackBar,
  	private router: Router){}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')?? '';
    this.usuarioService.getUsuario(id).pipe(switchMap(usuario => {
      this.usuario = usuario;
      this.urlFoto = `http://localhost:8080/users/${usuario.id}/picture`;
      return forkJoin([this.usuarioService.getReviewsUsuario(this.usuario.id), this.getBooks(), this.amigosService.getFriends(this.usuario.id)]);
    }))
    .subscribe(([reviews, books, friends]) => {
      this.reviews = reviews.map(review => {
        review.user_id = id;
        review.username = this.usuario.username;
        return review;
      });
      this.books = books;
	  this.friends = friends;

	  let user_id = sessionStorage.getItem('user_id');
	  this.is_myself = user_id == this.usuario.id;
	  console.log(this.is_myself);
	  this.is_friend = this.friends.find(friend => friend.id == user_id) == undefined ? false : true;
    })
  }

  getBooks(): Observable<Libro[]> {
    return (this.usuario.is_author) ? this.usuarioService.getBooksUsuario(this.usuario.id) : of([]);
  }

  sendFriendRequest() {
	  this.amigosService.sendFriendRequest(this.usuario.id).subscribe(({
		  next: () => { this._snackBar.open('Friend request sent', 'Close', {
				duration: 2000,
		  })},
		  error: (error) => {
			  console.log('Error sending friend request', error.status);
			  if (error.status == 409) {
				  this._snackBar.open('Friend request already sent', 'Close', {
					  duration: 2000,
				  })
			  } else {
				  this._snackBar.open('Error sending friend request', 'Close', {
					  duration: 2000,
				  })
			  }
		  }
	  }));
  }

  removeFriend() {
	  this.amigosService.removeFriend(this.usuario.id).subscribe({
		  next: () => {
			  this._snackBar.open('Friend removed', 'Close', {
				  duration: 2000,
			  });
			  this.is_friend = false;
			  this.friends = this.friends.filter(friend => friend.id != sessionStorage.getItem('user_id'));
		  },
		  error: () => {
			  this._snackBar.open('Error removing friend', 'Close', {
				  duration: 2000,
			  });
		  }
	  });
  }

  books: Libro[] = [];
  reviews: any[] = [];
  friends: Usuario[] = [];

  is_friend = false;
  is_myself = false;
  defaultImage = './default-profile.png';
  urlFoto = '';
  usuario = new Usuario({});

  goToFriends() {
  	this.router.navigate(['/user', this.usuario.id, 'friends'])
  }
}
