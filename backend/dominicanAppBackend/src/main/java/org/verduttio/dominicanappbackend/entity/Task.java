package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String nameAbbrev;

    private int participantsLimit;

    private boolean archived;

    private boolean participantForWholePeriod;

    @ManyToMany
    @JoinTable(
            name = "task_allowed_roles",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> allowedRoles;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role supervisorRole;

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

    public String getNameAbbrev() {
        return nameAbbrev;
    }

    public void setNameAbbrev(String nameAbbrev) {
        this.nameAbbrev = nameAbbrev;
    }

    public int getParticipantsLimit() {
        return participantsLimit;
    }

    public void setParticipantsLimit(int participantsLimit) {
        this.participantsLimit = participantsLimit;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public boolean isParticipantForWholePeriod() {
        return participantForWholePeriod;
    }

    public void setParticipantForWholePeriod(boolean participantForWholePeriod) {
        this.participantForWholePeriod = participantForWholePeriod;
    }

    public Role getSupervisorRole() {
        return supervisorRole;
    }

    public void setSupervisorRole(Role supervisorRole) {
        this.supervisorRole = supervisorRole;
    }

    public Set<Role> getAllowedRoles() {
        return allowedRoles;
    }

    public void setAllowedRoles(Set<Role> allowedRoles) {
        this.allowedRoles = allowedRoles;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        TreeSet<DayOfWeek> sortedDays = new TreeSet<>(Comparator.comparingInt(DayOfWeek::getValue));
        sortedDays.addAll(this.daysOfWeek);
        return sortedDays;
    }

    public void setDaysOfWeek(Set<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    // Constructors
    public Task() {
    }

    public Task(String name, String nameAbbrev, int participantsLimit, boolean archived,
                boolean participantForWholePeriod, Set<Role> allowedRoles,
                Role supervisorRole, Set<DayOfWeek> daysOfWeek) {
        this.name = name;
        this.nameAbbrev = nameAbbrev;
        this.participantsLimit = participantsLimit;
        this.archived = archived;
        this.participantForWholePeriod = participantForWholePeriod;
        this.allowedRoles = allowedRoles;
        this.supervisorRole = supervisorRole;
        this.daysOfWeek = daysOfWeek;
    }

}
