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

    private int participantsLimit;

    private boolean permanent;

    private boolean participantForWholePeriod;

    @ManyToMany
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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getParticipantsLimit() {
        return participantsLimit;
    }

    public void setParticipantsLimit(int participantsLimit) {
        this.participantsLimit = participantsLimit;
    }

    public boolean isPermanent() {
        return permanent;
    }

    public void setPermanent(boolean permanent) {
        this.permanent = permanent;
    }

    public boolean isParticipantForWholePeriod() {
        return participantForWholePeriod;
    }

    public void setParticipantForWholePeriod(boolean participantForWholePeriod) {
        this.participantForWholePeriod = participantForWholePeriod;
    }

    public Set<Role> getAllowedRoles() {
        return allowedRoles;
    }

    public void setAllowedRoles(Set<Role> allowedRoles) {
        this.allowedRoles = allowedRoles;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(Set<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    // Constructors
    public Task() {
    }

    public Task(String name, int participantsLimit, boolean permanent,
                boolean participantForWholePeriod, Set<Role> allowedRoles, Set<DayOfWeek> daysOfWeek) {
        this.name = name;
        this.participantsLimit = participantsLimit;
        this.permanent = permanent;
        this.participantForWholePeriod = participantForWholePeriod;
        this.allowedRoles = allowedRoles;
        this.daysOfWeek = daysOfWeek;
    }

}
