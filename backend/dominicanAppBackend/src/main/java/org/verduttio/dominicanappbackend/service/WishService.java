package org.verduttio.dominicanappbackend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.verduttio.dominicanappbackend.domain.GlobalSettings;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.domain.Wish;
import org.verduttio.dominicanappbackend.dto.wish.WishesPageDTO;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.repository.GlobalSettingsRepository;
import org.verduttio.dominicanappbackend.repository.WishRepository;
import org.verduttio.dominicanappbackend.security.SecurityUtils;
import org.verduttio.dominicanappbackend.dto.wish.WishCreateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishAdminUpdateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishesSettingsUpdateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishSendResultDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishesMenuStateDTO;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class WishService {

    private static final String DEFAULT_TITLE = "Życzenia Bożonarodzeniowe";

    private final WishRepository wishRepository;
    private final GlobalSettingsRepository globalSettingsRepository;
    private final UserService userService;
    private final WishGoogleAppsScriptService googleAppsScriptService;

    public WishService(
            WishRepository wishRepository,
            GlobalSettingsRepository globalSettingsRepository,
            UserService userService,
            WishGoogleAppsScriptService googleAppsScriptService
    ) {
        this.wishRepository = wishRepository;
        this.globalSettingsRepository = globalSettingsRepository;
        this.userService = userService;
        this.googleAppsScriptService = googleAppsScriptService;
    }

    @Transactional(readOnly = true)
    public WishesPageDTO getWishesPage() {
        boolean admin = SecurityUtils.userHasRoleAdmin();

        List<Wish> allWishes = wishRepository.findAllByOrderByIdAsc();

        List<WishesPageDTO.WishRow> rows = allWishes.stream()
                .map(wish -> {
                    User assignedUser = wish.getUser();

                    String userName = assignedUser == null
                            ? null
                            : Stream.of(assignedUser.getName(), assignedUser.getSurname())
                            .filter(value -> value != null && !value.isBlank())
                            .collect(Collectors.joining(" "));

                    return new WishesPageDTO.WishRow(
                            wish.getId(),
                            wish.getRecipient(),
                            wish.getEmail(),
                            wish.isLetter(),
                            assignedUser == null ? null : assignedUser.getId(),
                            userName,
                            wish.getMessage(),
                            admin ? wish.isSent() : null
                    );
                })
                .toList();

        var wishesByUser = allWishes.stream()
                .filter(wish -> wish.getUser() != null)
                .collect(Collectors.groupingBy(
                        wish -> wish.getUser().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<WishesPageDTO.UserStats> statistics = wishesByUser.values().stream()
                .map(userWishes -> {
                    User user = userWishes.get(0).getUser();

                    return new WishesPageDTO.UserStats(
                            user.getId(),
                            user.getName(),
                            user.getSurname(),
                            userWishes.size()
                    );
                })
                .sorted(
                        Comparator.comparing(
                                WishesPageDTO.UserStats::surname,
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                        ).thenComparing(
                                WishesPageDTO.UserStats::name,
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                        )
                )
                .toList();

        String title = getSettingValue("wishes_title", DEFAULT_TITLE);
        boolean visible = Boolean.parseBoolean(
                getSettingValue("wishes_visibility", "true")
        );

        List<UserShortInfo> users = admin
                ? userService.getAllUsersShortInfo()
                : List.of();

        return new WishesPageDTO(
                title,
                visible,
                admin,
                rows,
                users,
                statistics
        );
    }

    @Transactional
    public void claimWish(Long wishId) {
        User currentUser = SecurityUtils.getCurrentUser();

        if (!wishRepository.existsById(wishId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Nie znaleziono wpisu"
            );
        }

        int updated = wishRepository.claimIfUnassigned(wishId, currentUser);

        if (updated == 0) {
            if (!wishRepository.existsById(wishId)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Nie znaleziono wpisu"
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ten wpis został już przypisany do innego użytkownika"
            );
        }
    }

    @Transactional
    public void updateEmail(Long wishId, String email) {
        Wish wish = getWishOrThrow(wishId);

        wish.setEmail(email.trim());
        wishRepository.save(wish);
    }

    @Transactional
    public void updateMessage(Long wishId, String message) {
        Wish wish = getWishOrThrow(wishId);

        User currentUser = SecurityUtils.getCurrentUser();
        boolean admin = SecurityUtils.userHasRoleAdmin();

        if (!admin) {
            User assignedUser = wish.getUser();

            if (assignedUser == null
                    || !Objects.equals(assignedUser.getId(), currentUser.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Możesz edytować tylko wiadomości przypisane do Ciebie"
                );
            }
        }

        wish.setMessage(message);
        wishRepository.save(wish);
    }

    private Wish getWishOrThrow(Long wishId) {
        return wishRepository.findById(wishId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Nie znaleziono wpisu"
                ));
    }

    @Transactional
    public Long createWish(WishCreateDTO request) {
        requireAdmin();

        Wish wish = new Wish();
        wish.setRecipient(request.recipient().trim());
        wish.setEmail(request.email() == null ? null : request.email().trim());
        wish.setLetter(request.letter());
        wish.setUser(null);
        wish.setMessage(null);
        wish.setSent(false);

        return wishRepository.save(wish).getId();
    }

    @Transactional
    public void updateWishAsAdmin(Long wishId, WishAdminUpdateDTO request) {
        requireAdmin();

        Wish wish = getWishOrThrow(wishId);

        wish.setRecipient(request.recipient().trim());
        wish.setLetter(request.letter());

        if (request.userId() == null) {
            wish.setUser(null);
        } else {
            User assignedUser = userService.getUserById(request.userId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Nie znaleziono użytkownika"
                    ));

            wish.setUser(assignedUser);
        }

        wishRepository.save(wish);
    }

    @Transactional
    public void deleteWish(Long wishId) {
        requireAdmin();

        Wish wish = getWishOrThrow(wishId);
        wishRepository.delete(wish);
    }

    @Transactional
    public void updateSettings(WishesSettingsUpdateDTO request) {
        requireAdmin();

        saveSetting("wishes_title", request.title().trim());
        saveSetting("wishes_visibility", request.visible().toString());
    }

    private void saveSetting(String key, String value) {
        GlobalSettings setting = globalSettingsRepository.findByKey(key)
                .orElseGet(() -> new GlobalSettings(key, value));

        setting.setValue(value);
        globalSettingsRepository.save(setting);
    }

    private void requireAdmin() {
        if (!SecurityUtils.userHasRoleAdmin()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    SecurityUtils.ACCESS_DENIED_MESSAGE
            );
        }
    }

    @Transactional
    public WishSendResultDTO sendEmails(boolean testMode) {
        requireAdmin();

        User currentUser = SecurityUtils.getCurrentUser();

        List<Wish> candidates = testMode
                ? wishRepository.findAllByOrderByIdAsc().stream()
                .filter(wish -> !wish.isSent() && !wish.isLetter())
                .toList()
                : wishRepository.findUnsentEmailWishesForUpdate();

        List<WishSendResultDTO.ItemError> errors = new ArrayList<>();
        List<Wish> sendable = new ArrayList<>();

        for (Wish wish : candidates) {
            if (wish.getMessage() == null || wish.getMessage().isBlank()) {
                errors.add(new WishSendResultDTO.ItemError(
                        wish.getId(),
                        wish.getRecipient(),
                        "Brak treści życzeń"
                ));
                continue;
            }

            if (!testMode && (wish.getEmail() == null || wish.getEmail().isBlank())) {
                errors.add(new WishSendResultDTO.ItemError(
                        wish.getId(),
                        wish.getRecipient(),
                        "Brak adresu e-mail"
                ));
                continue;
            }

            sendable.add(wish);
        }

        String testRecipient = testMode ? currentUser.getEmail() : null;

        if (testMode && (testRecipient == null || testRecipient.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Zalogowany administrator nie ma ustawionego adresu e-mail"
            );
        }

        if (sendable.isEmpty()) {
            return new WishSendResultDTO(
                    testMode,
                    candidates.size(),
                    0,
                    errors
            );
        }

        List<WishGoogleAppsScriptService.DispatchItem> items = sendable.stream()
                .map(wish -> new WishGoogleAppsScriptService.DispatchItem(
                        wish.getId(),
                        wish.getRecipient(),
                        wish.getEmail(),
                        wish.getMessage()
                ))
                .toList();

        String mode = testMode ? "TEST" : "SEND";
        String title = getSettingValue("wishes_title", DEFAULT_TITLE);

        WishGoogleAppsScriptService.DispatchResponse response =
                googleAppsScriptService.dispatch(
                        mode,
                        title,
                        testRecipient,
                        items
                );

        Map<Long, WishGoogleAppsScriptService.DispatchItemResult> resultsById =
                new HashMap<>();

        if (response.results() != null) {
            for (WishGoogleAppsScriptService.DispatchItemResult result : response.results()) {
                if (result.wishId() != null) {
                    resultsById.putIfAbsent(result.wishId(), result);
                }
            }
        }

        int succeeded = 0;
        List<Wish> successfullySent = new ArrayList<>();

        for (Wish wish : sendable) {
            WishGoogleAppsScriptService.DispatchItemResult result =
                    resultsById.get(wish.getId());

            if (result != null && Boolean.TRUE.equals(result.success())) {
                succeeded++;

                if (!testMode) {
                    wish.setSent(true);
                    successfullySent.add(wish);
                }
            } else {
                String error = result == null
                        ? "Google Apps Script nie zwrócił wyniku dla tego wpisu"
                        : result.error();

                errors.add(new WishSendResultDTO.ItemError(
                        wish.getId(),
                        wish.getRecipient(),
                        error == null || error.isBlank()
                                ? "Nie udało się wysłać wiadomości"
                                : error
                ));
            }
        }

        if (!testMode && !successfullySent.isEmpty()) {
            wishRepository.saveAll(successfullySent);
        }

        return new WishSendResultDTO(
                testMode,
                candidates.size(),
                succeeded,
                errors
        );
    }

    @Transactional(readOnly = true)
    public WishesMenuStateDTO getMenuState() {
        boolean visible = Boolean.parseBoolean(
                getSettingValue("wishes_visibility", "true")
        );

        return new WishesMenuStateDTO(visible);
    }

    private String getSettingValue(String key, String defaultValue) {
        return globalSettingsRepository.findByKey(key)
                .map(GlobalSettings::getValue)
                .filter(value -> value != null && !value.isBlank())
                .orElse(defaultValue);
    }
}