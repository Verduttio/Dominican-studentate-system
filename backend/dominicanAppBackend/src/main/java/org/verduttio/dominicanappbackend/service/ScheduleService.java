package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.ScheduleDTO;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.ScheduleValidator;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserService userService;
    private final ScheduleValidator scheduleValidator;

    @Autowired
    public ScheduleService(ScheduleRepository scheduleRepository, UserService userService,
                           ScheduleValidator scheduleValidator) {
        this.scheduleRepository = scheduleRepository;
        this.userService = userService;
        this.scheduleValidator = scheduleValidator;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Optional<Schedule> getScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId);
    }

    public void saveSchedule(ScheduleDTO scheduleDTO, boolean ignoreConflicts) {
        scheduleValidator.validateSchedule(scheduleDTO, ignoreConflicts);

        Schedule schedule = scheduleDTO.toSchedule();
        scheduleRepository.save(schedule);
    }

    public void updateSchedule(Long scheduleId, ScheduleDTO updatedScheduleDTO, boolean ignoreConflicts) {
        scheduleValidator.checkIfScheduleExists(scheduleId);
        scheduleValidator.validateSchedule(updatedScheduleDTO, ignoreConflicts);

        Schedule schedule = updatedScheduleDTO.toSchedule();
        schedule.setId(scheduleId);
        scheduleRepository.save(schedule);
    }

    public List<Schedule> getSchedulesByUserIdAndDate(Long userId, LocalDate date) {
        return scheduleRepository.findByUserIdAndDate(userId, date);
    }

    public void deleteSchedule(Long scheduleId) {
        scheduleValidator.checkIfScheduleExists(scheduleId);
        scheduleRepository.deleteById(scheduleId);
    }

    public boolean existsById(Long scheduleId) {
        return scheduleRepository.existsById(scheduleId);
    }

    public List<Schedule> getAllSchedulesByUserId(Long userId) {
        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }
        return scheduleRepository.findByUserId(userId);
    }

    public List<Schedule> getCurrentSchedules() {
        return scheduleRepository.findSchedulesLaterOrInDay(LocalDate.now());
    }
}
