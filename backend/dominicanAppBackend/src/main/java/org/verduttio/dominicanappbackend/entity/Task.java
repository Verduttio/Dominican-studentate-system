package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.util.Set;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    private int participantsLimit;

    private boolean permanent;

    private boolean participantForWholePeriod;

    @OneToMany
    @JoinTable(
            name = "task_allowed_roles",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> allowedRoles;

    @ElementCollection(targetClass = DayOfWeek.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "task_day_of_week",
            joinColumns = @JoinColumn(name = "task_id")
    )
    private Set<DayOfWeek> daysOfWeek;

    // Getters and setters

    // Constructors

    // Other methods
}

