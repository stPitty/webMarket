import { IsEmpty, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../lib/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column('boolean', { default: false })
  isVerified: boolean = false;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  constructor(args?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    role: Role;
  }) {
    if (args) {
      this.firstName = args.firstName;
      this.lastName = args.lastName;
      this.email = args.email;
      this.password = args.password;
      this.isVerified = args.isVerified;
      this.role = args.role;
    }
  }
}
