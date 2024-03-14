package org.verduttio.dominicanappbackend.dto.conflict;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.entity.Task;

import java.time.DayOfWeek;
import java.util.Set;

public class ConflictDTO {
    @NotNull(message="Task 1 id is mandatory")
    private Long task1Id;
    @NotNull(message="Task 2 id is mandatory")
    private Long task2Id;
    @NotEmpty(message="Days of week are mandatory")
    private Set<DayOfWeek> daysOfWeek;

    // Getters
    public Long getTask1Id() {
        return task1Id;
    }

    public void setTask1Id(Long task1Id) {
        this.task1Id = task1Id;
    }

    public Long getTask2Id() {
        return task2Id;
    }

    public void setTask2Id(Long task2Id) {
        this.task2Id = task2Id;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(Set<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    // Constructors
    public ConflictDTO() {
    }

    public ConflictDTO(Long task1Id, Long task2Id, Set<DayOfWeek> daysOfWeek) {
        this.task1Id = task1Id;
        this.task2Id = task2Id;
        this.daysOfWeek = daysOfWeek;
    }

    public Conflict onlyIdFieldsAndDaysToConflict() {
        Conflict conflict = new Conflict();
        Task task1 = new Task();
        Task task2 = new Task();

        task1.setId(task1Id);
        task2.setId(task2Id);

        conflict.setTask1(task1);
        conflict.setTask2(task2);

        conflict.setDaysOfWeek(daysOfWeek);

        return conflict;
    }
}
