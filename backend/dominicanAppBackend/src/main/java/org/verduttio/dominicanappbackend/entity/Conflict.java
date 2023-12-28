package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

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


    // Constructors
    public Conflict() {
    }

    public Conflict(Task task1, Task task2) {
        this.task1 = task1;
        this.task2 = task2;
    }
}
