package org.verduttio.dominicanappbackend.integrationtest.utility;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.entity.*;
import org.verduttio.dominicanappbackend.repository.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

@Component
public class DatabaseInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TaskRepository taskRepository;
    private final ConflictRepository conflictRepository;
    private final ObstacleRepository obstacleRepository;
    private final ScheduleRepository scheduleRepository;

    @Autowired
    public DatabaseInitializer(UserRepository userRepository, RoleRepository roleRepository,
                               TaskRepository taskRepository, ConflictRepository conflictRepository,
                               ObstacleRepository obstacleRepository, ScheduleRepository scheduleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.taskRepository = taskRepository;
        this.conflictRepository = conflictRepository;
        this.obstacleRepository = obstacleRepository;
        this.scheduleRepository = scheduleRepository;
    }

    public void clearDb() {
        scheduleRepository.deleteAll();
        obstacleRepository.deleteAll();
        conflictRepository.deleteAll();
        taskRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
    }

    public Schedule addSchedule(User user, Task task, LocalDate date) {
        Schedule schedule = new Schedule();
        schedule.setUser(user);
        schedule.setTask(task);
        schedule.setDate(date);
        return scheduleRepository.save(schedule);
    }

    public Obstacle addObstacle_01_01_To_01_20(User user, Task task) {
        Obstacle obstacle = new Obstacle();
        obstacle.setFromDate(LocalDate.of(2024, 1, 1));
        obstacle.setToDate(LocalDate.of(2024, 1, 20));
        obstacle.setApplicantDescription("Test Description");
        obstacle.setStatus(ObstacleStatus.APPROVED);
        obstacle.setTask(task);
        obstacle.setUser(user);
        return obstacleRepository.save(obstacle);
    }

    public Conflict addConflict(Task task1, Task task2) {
        Conflict conflict = new Conflict();
        conflict.setTask1(task1);
        conflict.setTask2(task2);
        return conflictRepository.save(conflict);
    }

    public Task addWashDishesTask(Set<Role> allowedRoles) {
        Task task = new Task();
        task.setName("Wash dishes");
        task.setCategory("Kitchen");
        task.setParticipantsLimit(5);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(allowedRoles);
        task.setDaysOfWeek(Set.of(DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY));
        return taskRepository.save(task);
    }

    public Task addPrepareMealTask(Set<Role> allowedRoles) {
        Task task = new Task();
        task.setName("Prepare meal");
        task.setCategory("Kitchen");
        task.setParticipantsLimit(15);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(allowedRoles);
        task.setDaysOfWeek(Set.of(DayOfWeek.TUESDAY, DayOfWeek.FRIDAY));
        return taskRepository.save(task);
    }

    public Task addDryDishesTask(Set<Role> allowedRoles) {
        Task task = new Task();
        task.setName("Dry dishes");
        task.setCategory("Kitchen");
        task.setParticipantsLimit(12);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(allowedRoles);
        task.setDaysOfWeek(Set.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY));
        return taskRepository.save(task);
    }

    public User addUserFrankCadillac(Set<Role> roles) {
        User frankCadillac = new User();
        frankCadillac.setName("Frank");
        frankCadillac.setSurname("Cadillac");
        frankCadillac.setEmail("funcadillac@mail.com");
        frankCadillac.setPassword("password");
        frankCadillac.setRoles(roles);
        return userRepository.save(frankCadillac);
    }

    public User addUserJohnDoe(Set<Role> roles) {
        User user = new User();
        user.setName("John");
        user.setSurname("Doe");
        user.setEmail("joedoe@mail.com");
        user.setPassword("password");
        user.setRoles(roles);
        return userRepository.save(user);
    }

    public Role addRoleUser() {
        Role role = new Role();
        role.setName("ROLE_USER");
        return roleRepository.save(role);
    }

    public Role addRoleAdmin() {
        Role role = new Role();
        role.setName("ROLE_ADMIN");
        return roleRepository.save(role);
    }

    public Role addRoleDev() {
        Role role = new Role();
        role.setName("ROLE_DEV");
        return roleRepository.save(role);
    }
}
