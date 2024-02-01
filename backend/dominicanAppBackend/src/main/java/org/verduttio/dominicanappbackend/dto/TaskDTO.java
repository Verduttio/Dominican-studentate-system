package org.verduttio.dominicanappbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.verduttio.dominicanappbackend.entity.Task;

import java.time.DayOfWeek;
import java.util.Set;

public class TaskDTO {
    @NotBlank(message="Name is mandatory")
    private String name;
    @NotNull(message="Participants limit is mandatory")
    private int participantsLimit;
    @NotNull(message="Permanent field is mandatory")
    private boolean permanent;
    @NotNull(message="Participant for whole period is mandatory")
    private boolean participantForWholePeriod;
    @NotEmpty(message="Allowed roles are mandatory")
    private Set<String> allowedRoleNames;
    @NotEmpty(message="Days of week are mandatory")
    private Set<DayOfWeek> daysOfWeek;

    // Getters
    public String getName() {
        return name;
    }

    public int getParticipantsLimit() {
        return participantsLimit;
    }

    public boolean isPermanent() {
        return permanent;
    }

    public boolean isParticipantForWholePeriod() {
        return participantForWholePeriod;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    // Constructors
    public TaskDTO() {
    }

    public TaskDTO(String name, int participantsLimit, boolean permanent, boolean participantForWholePeriod, Set<String> allowedRoleNames, Set<DayOfWeek> daysOfWeek) {
        this.name = name;
        this.participantsLimit = participantsLimit;
        this.permanent = permanent;
        this.participantForWholePeriod = participantForWholePeriod;
        this.allowedRoleNames = allowedRoleNames;
        this.daysOfWeek = daysOfWeek;
    }


    public Set<String> getAllowedRoleNames() {
        return allowedRoleNames;
    }

    public Task basicFieldsToTask() {
        Task task = new Task();
        task.setName(this.name);
        task.setParticipantsLimit(this.participantsLimit);
        task.setPermanent(this.permanent);
        task.setParticipantForWholePeriod(this.participantForWholePeriod);
        task.setDaysOfWeek(this.daysOfWeek);
        return task;
    }

}
