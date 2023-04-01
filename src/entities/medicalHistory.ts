import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { User } from './user';

@Entity()
export class MedicalHistory {
  @PrimaryGeneratedColumn('uuid')
  medicalHistoryId: string;

  @ManyToOne(() => User, (user) => user.medicalHistory)
  user: Relation<User>;

  @Column()
  userId: string;

  @Column()
  conditionName: string;

  @Column()
  treatment: string;

  @Column()
  diagnosisDate: Date;

  @Column({ nullable: true })
  note: string;
}