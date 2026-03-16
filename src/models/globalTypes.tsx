export type Role = 'admin' | 'user';

export type User = {
	role: Role
	email: string
	first_name: string
	last_name: string
	dob: string
}
