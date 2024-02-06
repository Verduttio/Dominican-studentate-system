package org.verduttio.dominicanappbackend.dto.task;

public class TaskShortInfo {
    private Long id;
    private String name;

    public TaskShortInfo(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public TaskShortInfo() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
