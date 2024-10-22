package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.dto.task.TaskDTO;
import org.verduttio.dominicanappbackend.dto.task.TaskShortInfo;
import org.verduttio.dominicanappbackend.dto.task.TaskSortOrderUpdateDTO;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final RoleService roleService;
    private final ConflictRepository conflictRepository;
    private final ObstacleRepository obstacleRepository;
    private final ScheduleRepository scheduleRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository, RoleService roleService, ConflictRepository conflictRepository,
                       ObstacleRepository obstacleRepository, ScheduleRepository scheduleRepository) {
        this.taskRepository = taskRepository;
        this.roleService = roleService;
        this.conflictRepository = conflictRepository;
        this.obstacleRepository = obstacleRepository;
        this.scheduleRepository = scheduleRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAllTasksOrderBySupervisorRoleSortOrderAndTaskSortOrder();
    }

    public Optional<Task> getTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }

    public boolean existsById(Long taskId) {
        return taskRepository.existsById(taskId);
    }

    public void saveTask(TaskDTO taskDTO) {
        Task task = convertTaskDTOToTask(taskDTO);
        task.setSortOrder(taskRepository.countBySupervisorRoleName(taskDTO.getSupervisorRoleName()) + 1);
        taskRepository.save(task);
    }

    public void deleteTask(Long taskId) {
        Optional<Task> task = taskRepository.findById(taskId);
        if (task.isPresent()) {
            scheduleRepository.deleteAllByTaskId(taskId);
            obstacleRepository.deleteAllByTaskId(taskId);
            conflictRepository.deleteAllByTaskId(taskId);
            taskRepository.decrementByRoleSortOrderGreaterThan(task.get().getSupervisorRole().getId(), task.get().getSortOrder());
            taskRepository.deleteById(taskId);
        } else {
            throw new EntityNotFoundException("Task with id " + taskId + " does not exist");
        }
    }

    private Task convertTaskDTOToTask(TaskDTO taskDTO) {
        Task task = taskDTO.basicFieldsToTask();

        Set<Role> rolesDB = getValidatedRoles(taskDTO);
        Role supervisorRoleDB = getValidatedSupervisorRole(taskDTO.getSupervisorRoleName());

        task.setAllowedRoles(rolesDB);
        task.setSupervisorRole(supervisorRoleDB);

        return task;
    }

    private Set<Role> getValidatedRoles(TaskDTO taskDTO) {
        Set<Role> rolesDB = roleService.getRolesByRoleNames(taskDTO.getAllowedRoleNames());
        if (rolesDB.isEmpty()) {
            throw new IllegalArgumentException("No roles found for given role names");
        }
        return rolesDB;
    }

    private Role getValidatedSupervisorRole(String supervisorRoleName) {
        Role supervisorRoleDB = roleService.getRoleByName(supervisorRoleName);
        if (supervisorRoleDB == null) {
            throw new IllegalArgumentException("No supervisor role found for given role name");
        }
        return supervisorRoleDB;
    }

    public void updateTask(Long taskId, TaskDTO updatedTaskDTO) {
        Optional<Task> existingTask = taskRepository.findById(taskId);
        if (existingTask.isEmpty()) {
            throw new EntityNotFoundException("Task with id " + taskId + " does not exist");
        }

        Task task = existingTask.get();

        updateTaskSortOrderIfSupervisorRoleChanged(updatedTaskDTO, task);

        task.setName(updatedTaskDTO.getName());
        task.setNameAbbrev(updatedTaskDTO.getNameAbbrev());
        task.setParticipantsLimit(updatedTaskDTO.getParticipantsLimit());
        task.setArchived(updatedTaskDTO.isArchived());
        task.setAllowedRoles(getValidatedRoles(updatedTaskDTO));
        task.setSupervisorRole(getValidatedSupervisorRole(updatedTaskDTO.getSupervisorRoleName()));
        task.setDaysOfWeek(updatedTaskDTO.getDaysOfWeek());

        taskRepository.save(task);
    }

    private void updateTaskSortOrderIfSupervisorRoleChanged(TaskDTO updatedTaskDTO, Task task) {
        if (!updatedTaskDTO.getSupervisorRoleName().equals(task.getSupervisorRole().getName())) {
            taskRepository.decrementByRoleSortOrderGreaterThan(task.getSupervisorRole().getId(), task.getSortOrder());
            task.setSortOrder(taskRepository.countBySupervisorRoleName(updatedTaskDTO.getSupervisorRoleName()) + 1);
        }
    }

    public List<Task> findTasksByRoleName(String roleName) {
        return taskRepository.findTaskByRoleName(roleName);
    }

    public List<TaskShortInfo> getAllTasksShortInfo() {
        return taskRepository.findAllTasksShortInfo();
    }

    public List<Task> findTasksBySupervisorRoleName(String supervisorName){
        return taskRepository.findTasksBySupervisorRoleName(supervisorName);
    }

    public void updateTaskSortOrder(List<TaskSortOrderUpdateDTO> taskSortOrderUpdateDTOs) {
        for (TaskSortOrderUpdateDTO taskSortOrderUpdateDTO : taskSortOrderUpdateDTOs) {
            Optional<Task> task = taskRepository.findById(taskSortOrderUpdateDTO.id());
            if (task.isEmpty()) {
                throw new EntityNotFoundException("Task with id " + taskSortOrderUpdateDTO.id() + " does not exist");
            }
            Task taskToUpdate = task.get();
            taskToUpdate.setSortOrder(taskSortOrderUpdateDTO.sortOrder());
            taskRepository.save(taskToUpdate);
        }
    }

    public List<Task> getTasksVisibleInObstacleFormForUser() {
        return taskRepository.findByVisibleInObstacleFormForUserRoleTrueOrderBySupervisorRole_SortOrderAscSortOrderAsc();
    }

    @Transactional
    public void updateTasks(List<Task> tasks) {
        taskRepository.saveAll(tasks);
    }
}
