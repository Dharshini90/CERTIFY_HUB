import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password_hash!: string;

    @Column({
        type: "enum",
        enum: ["student", "faculty", "hod"],
        default: "student"
    })
    role!: "student" | "faculty" | "hod";

    @Column({ nullable: true })
    roll_number!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    year!: string;

    @Column({ nullable: true })
    department!: string;

    @Column({ nullable: true })
    section!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
