package org.verduttio.dominicanappbackend.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.domain.Conflict;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.SpecialEventRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;

import java.time.LocalDate;
import java.util.*;

@Service
public class SpecialEventService {

    private final SpecialEventRepository specialEventRepository;
    private final TaskRepository taskRepository;
    private final ConflictRepository conflictRepository;
    private final ScheduleRepository scheduleRepository;

    public SpecialEventService(SpecialEventRepository specialEventRepository,
                               TaskRepository taskRepository,
                               ConflictRepository conflictRepository, ScheduleRepository scheduleRepository) {
        this.specialEventRepository = specialEventRepository;
        this.taskRepository = taskRepository;
        this.conflictRepository = conflictRepository;
        this.scheduleRepository = scheduleRepository;
    }

    // --- METODY CRUD (których brakowało) ---

    public List<SpecialEvent> getAllEvents() {
        return specialEventRepository.findAll();
    }

    public SpecialEvent createEvent(SpecialEvent event) {
        return specialEventRepository.save(event);
    }

    public SpecialEvent getEvent(Long id) {
        return specialEventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
    }

    @Transactional
    public void deleteEvent(Long id) {
        SpecialEvent event = specialEventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));

        // 1. Przygotowujemy "worki" na śmieci powiązane z tymi zadaniami
        Set<Conflict> conflictsToDelete = new HashSet<>();
        List<org.verduttio.dominicanappbackend.domain.Schedule> schedulesToDelete = new ArrayList<>();

        for (Task task : event.getTasks()) {
            // Zbieramy konflikty
            conflictsToDelete.addAll(conflictRepository.findAllByTaskId(task.getId()));

            // Zbieramy przypisania braci do grafiku
            schedulesToDelete.addAll(scheduleRepository.findByTaskId(task.getId()));
        }

        // 2. Najpierw usuwamy konflikty (czyszczenie powiązań kluczy obcych)
        conflictRepository.deleteAll(conflictsToDelete);

        // 3. Usuwamy przypisania z grafiku (czyszczenie kolejnych kluczy obcych)
        scheduleRepository.deleteAll(schedulesToDelete);

        // 4. Teraz baza danych z radością pozwoli usunąć event (i kaskadowo jego zadania)
        specialEventRepository.delete(event);
    }

    public List<SpecialEvent> findEventsActiveOnDate(LocalDate date) {
        return specialEventRepository.findEventsActiveOnDate(date);
    }

    // --- LOGIKA KLONOWANIA (Deep Copy) ---

    @Transactional
    public SpecialEvent cloneEvent(Long sourceId, String newName, LocalDate newStart, LocalDate newEnd) {
        SpecialEvent sourceEvent = getEvent(sourceId);

        // 1. Stwórz nowy Event (dni tacowe celowo zostawiamy puste, bo to święta ruchome)
        SpecialEvent newEvent = new SpecialEvent();
        newEvent.setName(newName);
        newEvent.setStartDate(newStart);
        newEvent.setEndDate(newEnd);

        newEvent = specialEventRepository.save(newEvent);

        // Mapa: ID Starego Zadania -> Nowa Encja Zadania
        Map<Long, Task> oldIdToNewTaskMap = new HashMap<>();

        // 2. Kopiuj Zadania (Deep Copy pól z Twojej encji Task)
        for (Task sourceTask : sourceEvent.getTasks()) {
            Task newTask = new Task();

            // Pola proste
            newTask.setName(sourceTask.getName());
            newTask.setNameAbbrev(sourceTask.getNameAbbrev());
            newTask.setParticipantsLimit(sourceTask.getParticipantsLimit());
            newTask.setArchived(false); // Przyjmuję, że nowa kopia jest aktywna
            newTask.setVisibleInObstacleFormForUserRole(sourceTask.isVisibleInObstacleFormForUserRole());
            newTask.setSortOrder(sourceTask.getSortOrder()); // Zachowujemy kolejność
            newTask.setDescription(sourceTask.getDescription());

            // Relacje (Referencje do słowników zostają te same)
            newTask.setSupervisorRole(sourceTask.getSupervisorRole());

            // Kolekcje (Tworzymy nowe sety, żeby nie współdzielić referencji do kolekcji Hibernate)
            newTask.setAllowedRoles(new HashSet<>(sourceTask.getAllowedRoles()));
            newTask.setDaysOfWeek(new HashSet<>(sourceTask.getDaysOfWeek()));

            // --- Klonowanie przypisanych sekcji (pór dnia) do zadania ---
            if (sourceTask.getTaskSections() != null) {
                newTask.setTaskSections(new HashSet<>(sourceTask.getTaskSections()));
            }

            // Przypisanie do nowego eventu
            newTask.setSpecialEvent(newEvent);

            newTask = taskRepository.save(newTask);
            oldIdToNewTaskMap.put(sourceTask.getId(), newTask);
        }

        // 3. Odtwarzanie konfliktów
        for (Task sourceTask : sourceEvent.getTasks()) {
            Task newTask = oldIdToNewTaskMap.get(sourceTask.getId());

            // Używamy Twojej istniejącej metody
            List<Conflict> existingConflicts = conflictRepository.findAllByTaskId(sourceTask.getId());

            for (Conflict oldConflict : existingConflicts) {
                // Wykryj drugą stronę konfliktu
                Task oldPartner = oldConflict.getTask1().getId().equals(sourceTask.getId())
                        ? oldConflict.getTask2()
                        : oldConflict.getTask1();

                Task newPartner;

                // Sprawdzamy czy partner też należy do TEGO SAMEGO starego eventu
                boolean isInternalConflict = oldPartner.getSpecialEvent() != null
                        && oldPartner.getSpecialEvent().getId().equals(sourceEvent.getId());

                if (isInternalConflict) {
                    // Konflikt Wewnętrzny: Kopiujemy go tak, by dotyczył nowych zadań w nowym evencie
                    newPartner = oldIdToNewTaskMap.get(oldPartner.getId());

                    // Zapobieganie duplikatom (A-B i B-A): dodajemy tylko gdy ID sourceTask jest mniejsze
                    if (sourceTask.getId() > oldPartner.getId()) continue;

                } else {
                    // Konflikt Zewnętrzny (np. ze zwykłym zadaniem globalnym):
                    // Nowe zadanie specjalne też musi się z nim gryźć.
                    newPartner = oldPartner;
                }

                if (newPartner != null) {
                    Conflict newConflict = new Conflict();
                    newConflict.setTask1(newTask);
                    newConflict.setTask2(newPartner);

                    if (oldConflict.getDaysOfWeek() != null) {
                        newConflict.setDaysOfWeek(new HashSet<>(oldConflict.getDaysOfWeek()));
                    }

                    conflictRepository.save(newConflict);
                }
            }
        }

        return newEvent;
    }
}