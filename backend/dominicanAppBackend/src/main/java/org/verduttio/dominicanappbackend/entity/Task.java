package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.util.Set;

@Entity
@Table(name = "Tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "category")
    private String category;

    @Column(name = "participantsLimit")
    private int participantsLimit;

    @Column(name = "permanent")
    private boolean permanent;

    @Column(name = "participantForWholePeriod")
    private boolean participantForWholePeriod;

    @OneToMany
    @JoinTable(
            name = "TaskAllowedRoles",
            joinColumns = @JoinColumn(name = "taskId"),
            inverseJoinColumns = @JoinColumn(name = "roleId")
    )
    private Set<Role> allowedRoles;

    @ElementCollection(targetClass = DayOfWeek.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "TaskDayOfWeek",
            joinColumns = @JoinColumn(name = "taskId")
    )
    private Set<DayOfWeek> daysOfWeek;

    // Getters and setters

    // Constructors

    // Other methods
}

