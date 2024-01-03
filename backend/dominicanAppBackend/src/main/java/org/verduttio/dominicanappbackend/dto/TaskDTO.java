package org.verduttio.dominicanappbackend.dto;

import org.verduttio.dominicanappbackend.entity.Task;

import java.time.DayOfWeek;
import java.util.Set;

public class TaskDTO {
    private String name;
    private String category;
    private int participantsLimit;
    private boolean permanent;
    private boolean participantForWholePeriod;
    private Set<String> allowedRoleNames;
    private Set<DayOfWeek> daysOfWeek;

    // Getters
    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
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

    public TaskDTO(String name, String category, int participantsLimit, boolean permanent, boolean participantForWholePeriod, Set<String> allowedRoleNames, Set<DayOfWeek> daysOfWeek) {
        this.name = name;
        this.category = category;
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
        task.setCategory(this.category);
        task.setParticipantsLimit(this.participantsLimit);
        task.setPermanent(this.permanent);
        task.setParticipantForWholePeriod(this.participantForWholePeriod);
        task.setDaysOfWeek(this.daysOfWeek);
        return task;
    }

}
