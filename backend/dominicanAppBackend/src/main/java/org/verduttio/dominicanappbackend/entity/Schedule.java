package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "taskId")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "participantsNumber")
    private int participantsNumber;

    @Column(name = "date")
    private LocalDate date;

    // Getters and setters

    // Constructors

    // Other methods
}

