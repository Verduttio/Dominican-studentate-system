package org.verduttio.dominicanappbackend.dto;

import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.entity.Task;

public class ConflictDTO {
    private Long task1Id;
    private Long task2Id;

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

    // Constructors
    public ConflictDTO() {
    }

    public ConflictDTO(Long task1Id, Long task2Id) {
        this.task1Id = task1Id;
        this.task2Id = task2Id;
    }

    public Conflict onlyIdFieldsToConflict() {
        Conflict conflict = new Conflict();
        Task task1 = new Task();
        Task task2 = new Task();

        task1.setId(task1Id);
        task2.setId(task2Id);

        conflict.setTask1(task1);
        conflict.setTask2(task2);

        return conflict;
    }
}
