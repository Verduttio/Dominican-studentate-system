package org.verduttio.dominicanappbackend.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.verduttio.dominicanappbackend.domain.Task;

import java.time.DayOfWeek;
import java.util.Set;

public class TaskDTO {
    @NotBlank(message="Name is mandatory")
    private String name;
    @NotBlank(message="Name abbreviation is mandatory")
    private String nameAbbrev;
    @NotNull(message="Participants limit is mandatory")
    private int participantsLimit;
    @NotNull(message="Archived field is mandatory")
    private boolean archived;
    @NotEmpty(message="Allowed roles are mandatory")
    private Set<String> allowedRoleNames;
    @NotEmpty(message="Supervisor role is mandatory")
    private String supervisorRoleName;
    @NotEmpty(message="Days of week are mandatory")
    private Set<DayOfWeek> daysOfWeek;

    // Getters
    public String getName() {
        return name;
    }

    public String getNameAbbrev() {
        return nameAbbrev;
    }

    public int getParticipantsLimit() {
        return participantsLimit;
    }

    public boolean isArchived() {
        return archived;
    }

    public Set<String> getAllowedRoleNames() {
        return allowedRoleNames;
    }

    public String getSupervisorRoleName() {
        return supervisorRoleName;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    // Constructors
    public TaskDTO() {
    }

    public TaskDTO(String name, String nameAbbrev, int participantsLimit, boolean archived,
                   Set<String> allowedRoleNames, String supervisorRoleName ,Set<DayOfWeek> daysOfWeek) {
        this.name = name;
        this.nameAbbrev = nameAbbrev;
        this.participantsLimit = participantsLimit;
        this.archived = archived;
        this.allowedRoleNames = allowedRoleNames;
        this.supervisorRoleName = supervisorRoleName;
        this.daysOfWeek = daysOfWeek;
    }


    public Task basicFieldsToTask() {
        Task task = new Task();
        task.setName(this.name);
        task.setNameAbbrev(this.nameAbbrev);
        task.setParticipantsLimit(this.participantsLimit);
        task.setArchived(this.archived);
        task.setDaysOfWeek(this.daysOfWeek);
        return task;
    }

}
