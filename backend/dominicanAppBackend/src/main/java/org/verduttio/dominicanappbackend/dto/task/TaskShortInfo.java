package org.verduttio.dominicanappbackend.dto.task;

public class TaskShortInfo {
    private Long id;
    private String name;
    private String nameAbbrev;
    private Long supervisorRoleId;

    public TaskShortInfo(Long id, String name, String nameAbbrev, Long supervisorRoleId) {
        this.id = id;
        this.name = name;
        this.nameAbbrev = nameAbbrev;
        this.supervisorRoleId = supervisorRoleId;
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

    public Long getSupervisorRoleId() {
        return supervisorRoleId;
    }

    public void setSupervisorRoleId(Long supervisorRoleId) {
        this.supervisorRoleId = supervisorRoleId;
    }
}
