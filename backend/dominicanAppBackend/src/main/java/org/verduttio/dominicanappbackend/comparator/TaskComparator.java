package org.verduttio.dominicanappbackend.comparator;

import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Task;

import java.util.Comparator;

public class TaskComparator implements Comparator<Task> {

    @Override
    public int compare(Task t1, Task t2) {
        int supervisorRoleComparison = compareSupervisorRoles(t1.getSupervisorRole(), t2.getSupervisorRole());
        if (supervisorRoleComparison != 0) {
            return supervisorRoleComparison;
        }
        return compareSortOrder(t1.getSortOrder(), t2.getSortOrder());
    }

    private int compareSupervisorRoles(Role r1, Role r2) {
        if (r1 == null && r2 == null) {
            return 0;
        }
        if (r1 == null) {
            return 1;
        }
        if (r2 == null) {
            return -1;
        }
        return compareSortOrder(r1.getSortOrder(), r2.getSortOrder());
    }

    private int compareSortOrder(Long s1, Long s2) {
        if (s1 == null && s2 == null) {
            return 0;
        }
        if (s1 == null) {
            return 1; 
        }
        if (s2 == null) {
            return -1;
        }
        return s1.compareTo(s2);
    }
}
