package org.verduttio.dominicanappbackend.service.dean;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.domain.GlobalSettings;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.dto.dean.PocketMoneyResponseDTO;
import org.verduttio.dominicanappbackend.dto.dean.PocketMoneySummaryDTO;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.repository.GlobalSettingsRepository;
import org.verduttio.dominicanappbackend.service.UserService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PocketMoneyService {

    private final UserService userService;
    private final GlobalSettingsRepository globalSettingsRepository;

    @Autowired
    public PocketMoneyService(UserService userService, GlobalSettingsRepository globalSettingsRepository) {
        this.userService = userService;
        this.globalSettingsRepository = globalSettingsRepository;
    }

    public PocketMoneyResponseDTO calculatePocketMoney(int month) {
        // 1. Pobierz stawki (z domyślnymi wartościami w razie braku w bazie)
        int pocketMoneyRate = getSettingValue("pocket_money_rate", 100);
        int namedayMoneyRate = getSettingValue("nameday_money_rate", 50);

        // 2. Pobierz wszystkich userów
        List<User> allUsers = userService.getAllUsers();

        // 3. Grupuj po roczniku (filtrując tylko tych, co mają ustawiony rocznik)
        Map<Integer, List<User>> usersByYear = allUsers.stream()
                .filter(u -> u.getAcademicYear() != null)
                .collect(Collectors.groupingBy(User::getAcademicYear));

        List<PocketMoneySummaryDTO> tableRows = new ArrayList<>();
        List<UserShortInfo> allNamedayBoys = new ArrayList<>();

        long totalPocketMoney = 0;
        long totalNamedayMoney = 0;

        // 4. Iteruj po rocznikach I-VI (1-6)
        for (int year = 1; year <= 6; year++) {
            int finalYear = year;
            List<User> yearUsers = usersByYear.getOrDefault(year, new ArrayList<>());

            long brotherCount = yearUsers.size();
            long pocketMoneyTotal = brotherCount * pocketMoneyRate;

            // Znajdź solenizantów w tym miesiącu
            List<User> namedayUsers = yearUsers.stream()
                    .filter(u -> u.getNamedayDate() != null && u.getNamedayDate().getMonthValue() == month)
                    .toList();

            long namedayCount = namedayUsers.size();
            long namedayMoneyTotal = namedayCount * namedayMoneyRate;
            long rowTotal = pocketMoneyTotal + namedayMoneyTotal;

            // Dodaj solenizantów do globalnej listy (potrzebne pod tabelą)
            namedayUsers.forEach(u -> allNamedayBoys.add(new UserShortInfo(
                    u.getId(),
                    u.getName(), u.getSurname() + " (" + toRoman(finalYear) + ")" // Format: Jan Kowalski (I)
            )));

            // Zbuduj wiersz tabeli
            tableRows.add(new PocketMoneySummaryDTO(
                    toRoman(year),
                    brotherCount,
                    pocketMoneyTotal,
                    namedayCount,
                    namedayMoneyTotal,
                    rowTotal
            ));

            totalPocketMoney += pocketMoneyTotal;
            totalNamedayMoney += namedayMoneyTotal;
        }

        long grandTotal = totalPocketMoney + totalNamedayMoney;

        return new PocketMoneyResponseDTO(
                tableRows,
                allNamedayBoys,
                totalPocketMoney,
                totalNamedayMoney,
                grandTotal
        );
    }

    // Metoda do aktualizacji stawek przez API
    public void updateRates(int pocketMoney, int namedayMoney) {
        saveSetting("pocket_money_rate", pocketMoney);
        saveSetting("nameday_money_rate", namedayMoney);
    }

    public Map<String, Integer> getCurrentRates() {
        return Map.of(
                "pocketMoney", getSettingValue("pocket_money_rate", 100),
                "namedayMoney", getSettingValue("nameday_money_rate", 50)
        );
    }

    private int getSettingValue(String key, int defaultValue) {
        return globalSettingsRepository.findByKey(key)
                .map(GlobalSettings::getValue)
                .orElse(defaultValue);
    }

    private void saveSetting(String key, int value) {
        GlobalSettings setting = globalSettingsRepository.findByKey(key)
                .orElse(new GlobalSettings(key, value));
        setting.setValue(value);
        globalSettingsRepository.save(setting);
    }

    private String toRoman(int num) {
        return switch (num) {
            case 1 -> "I";
            case 2 -> "II";
            case 3 -> "III";
            case 4 -> "IV";
            case 5 -> "V";
            case 6 -> "VI";
            default -> String.valueOf(num);
        };
    }
}