package org.verduttio.dominicanappbackend.dto.task;

public class TaskShortInfo {
    private Long id;
    private String name;
    private String nameAbbrev;

    public TaskShortInfo(Long id, String name, String nameAbbrev) {
        this.id = id;
        this.name = name;
        this.nameAbbrev = nameAbbrev;
    }

    public TaskShortInfo() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getNameAbbrev() {
        return nameAbbrev;
    }
}
