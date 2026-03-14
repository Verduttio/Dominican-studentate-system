package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.service.pdf.PdfService;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    private final PdfService pdfService;

    @Autowired
    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping("/schedules/users/scheduleShortInfo/week")
    public ResponseEntity<?> generateSchedulePdfForUsers(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForUsers(from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_users_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedules/users/groupedTasksByRoles/week")
    public ResponseEntity<?> generateSchedulePdfForUsersGroupedTasksByRoles(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForUsersGroupedTasksByRoles(from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_users_grouped_tasks_by_roles_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedules/tasks/byRole/{supervisorRole}/scheduleShortInfo/week")
    public ResponseEntity<?> generateSchedulePdfForTasksByRole(
            @PathVariable String supervisorRole,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForTasksBySupervisorRole(supervisorRole, from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_tasks_by_" + supervisorRole + "_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedules/tasks/scheduleShortInfo/week")
    public ResponseEntity<?> generateSchedulePdfForTasks(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForTasks(from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_tasks_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/schedules/tasks/byRoles/scheduleShortInfo/week")
    public ResponseEntity<?> generateSchedulePdfForTasksByRoles(
            @RequestBody List<String> supervisorRoles,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForTasksBySupervisorRoles(supervisorRoles, from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_tasks_by_" + "_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedules/users/days")
    public ResponseEntity<?> generateSchedulePdfForUsersByDays(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForUsersByDays(from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_users_by_days_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedules/byRole/{supervisorRoleName}/users/days")
    public ResponseEntity<?> generateSchedulePdfForUsersBySupervisorRoleByDays(
            @PathVariable String supervisorRoleName,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForUsersBySupervisorRoleByDays(supervisorRoleName, from, to);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Schedules_users_by_days_" + from.toString() + "-" + to.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- SPECIAL EVENTS PDF ENDPOINTS ---

    // a) Wydruk całościowej tabeli z dniami dla eventu (z opcjonalnym ograniczeniem do roli)
    @GetMapping("/schedules/special-event/{eventId}/matrix")
    public ResponseEntity<?> generateSchedulePdfForSpecialEventMatrix(
            @PathVariable Long eventId,
            @RequestParam(required = false) String roleName) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForSpecialEventMatrix(eventId, roleName);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Special_Event_" + eventId + "_matrix.pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // b) Wydruk 2-kolumnowy (Zadanie | Brat) na konkretny dzień eventu i roli
    @GetMapping("/schedules/special-event/{eventId}/daily")
    public ResponseEntity<?> generateSchedulePdfForSpecialEventDaily(
            @PathVariable Long eventId,
            @RequestParam("roleName") String roleName,
            @RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForSpecialEventDaily(eventId, roleName, date);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Special_Event_" + eventId + "_" + roleName + "_" + date.toString() + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedules/special-event/{eventId}/tasks-description")
    public ResponseEntity<?> generateSchedulePdfForSpecialEventTaskDescriptions(@PathVariable Long eventId) {
        try {
            byte[] pdfContent = pdfService.generateSchedulePdfForSpecialEventTaskDescriptions(eventId);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Opisy_oficjow_specjalnych_" + eventId + ".pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
