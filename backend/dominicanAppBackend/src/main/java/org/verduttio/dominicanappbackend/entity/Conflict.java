package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.util.Set;

@Entity
@Table(name = "conflicts")
public class Conflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task1_id")
    private Task task1;

    @ManyToOne
    @JoinColumn(name = "task2_id")
    private Task task2;

    @ElementCollection(targetClass = DayOfWeek.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "conflict_day_of_week",
            joinColumns = @JoinColumn(name = "conflict_id")
    )
    private Set<DayOfWeek> daysOfWeek;


    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask1() {
        return task1;
    }

    public void setTask1(Task task1) {
        this.task1 = task1;
    }

    public Task getTask2() {
        return task2;
    }

    public void setTask2(Task task2) {
        this.task2 = task2;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(Set<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }


    // Constructors
    public Conflict() {
    }

    public Conflict(Task task1, Task task2, Set<DayOfWeek> daysOfWeek) {
        this.task1 = task1;
        this.task2 = task2;
        this.daysOfWeek = daysOfWeek;
    }
}
