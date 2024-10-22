export class Usuario {
	about_me: string = '';
	age: number = -1;
	email: string = '';
	first_name: string = '';
	gender: string = '';
	id: number = 0;
	last_name: string = '';
	location: string = '';
	username: string = '';
	password: string = '';
	is_author: boolean = false;

	constructor(usuario: Partial<Usuario>) {
		Object.assign(this, usuario)
	}
}

export class UsuarioRegister extends Usuario {
	id_register: string = '';
	constructor(usuario: Partial<UsuarioRegister>) {
		super(usuario);
		Object.assign(this, usuario);

	}
}