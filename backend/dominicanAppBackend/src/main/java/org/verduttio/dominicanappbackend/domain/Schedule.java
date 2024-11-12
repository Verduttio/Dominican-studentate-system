package org.verduttio.dominicanappbackend.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedule_id_generator")
    @SequenceGenerator(name="schedule_id_generator", sequenceName = "schedule_id_seq", allocationSize=1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate date;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Constructors
    public Schedule() {
    }

    public Schedule(Task task, User user, LocalDate date) {
        this.task = task;
        this.user = user;
        this.date = date;
    }

    @Override
    public String toString() {
        return "Schedule{" +
                "id=" + id +
                ", task=" + task.getNameAbbrev() +
                ", user=" + user.getName() +" "+ user.getSurname() +
                ", date=" + date +
                '}';
    }

}
