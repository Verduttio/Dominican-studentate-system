package org.verduttio.dominicanappbackend.service;

import biweekly.Biweekly;
import biweekly.ICalendar;
import biweekly.component.VEvent;
import biweekly.property.CalendarScale;
import biweekly.property.ProductId;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.util.CalendarTokenUtils;

import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class CalendarService {

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final CalendarTokenUtils tokenUtils;

    public CalendarService(UserRepository userRepository, ScheduleRepository scheduleRepository, CalendarTokenUtils tokenUtils) {
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.tokenUtils = tokenUtils;
    }

    // Generowanie pliku ICS na podstawie zaszyfrowanego tokena
    public String generateIcsForToken(String token) {
        // 1. Odszyfruj ID (jeśli token jest błędny, rzuci wyjątek)
        Long userId = tokenUtils.decryptUserId(token);

        // 2. Znajdź usera po ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Pobierz dyżury
        List<Schedule> schedules = scheduleRepository.findAllByUserId(userId);

        // 4. Buduj iCalendar (to samo co wcześniej)
        ICalendar ical = new ICalendar();
        ical.setProductId(new ProductId("-//Dominican Studentate//Schedule//PL"));
        ical.setCalendarScale(CalendarScale.gregorian());
        ical.setName("Dyżury - " + user.getName());

        for (Schedule schedule : schedules) {
            VEvent event = new VEvent();
            event.setSummary(schedule.getTask().getName());
            Date start = Date.from(schedule.getDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            event.setDateStart(start, false); // All-day event
            ical.addEvent(event);
        }

        return Biweekly.write(ical).go();
    }

    // Metoda pomocnicza do pobrania linku dla zalogowanego użytkownika
    public String getEncryptedTokenForUser(Long userId) {
        return tokenUtils.encryptUserId(userId);
    }
}