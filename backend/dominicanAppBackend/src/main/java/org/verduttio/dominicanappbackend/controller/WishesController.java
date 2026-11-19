package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.wish.WishEmailUpdateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishMessageUpdateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishesPageDTO;
import org.verduttio.dominicanappbackend.service.WishService;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.verduttio.dominicanappbackend.dto.wish.WishCreateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishAdminUpdateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishesSettingsUpdateDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishSendResultDTO;
import org.verduttio.dominicanappbackend.dto.wish.WishesMenuStateDTO;

@RestController
@RequestMapping("/api/wishes")
public class WishesController {

    private final WishService wishService;

    public WishesController(WishService wishService) {
        this.wishService = wishService;
    }

    @GetMapping
    public ResponseEntity<WishesPageDTO> getWishes() {
        return ResponseEntity.ok(wishService.getWishesPage());
    }

    @PostMapping("/{wishId}/claim")
    public ResponseEntity<Void> claimWish(@PathVariable Long wishId) {
        wishService.claimWish(wishId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{wishId}/email")
    public ResponseEntity<Void> updateEmail(
            @PathVariable Long wishId,
            @Valid @RequestBody WishEmailUpdateDTO request
    ) {
        wishService.updateEmail(wishId, request.email());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{wishId}/message")
    public ResponseEntity<Void> updateMessage(
            @PathVariable Long wishId,
            @Valid @RequestBody WishMessageUpdateDTO request
    ) {
        wishService.updateMessage(wishId, request.message());
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Long> createWish(
            @Valid @RequestBody WishCreateDTO request
    ) {
        Long id = wishService.createWish(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @PatchMapping("/{wishId}/admin")
    public ResponseEntity<Void> updateWishAsAdmin(
            @PathVariable Long wishId,
            @Valid @RequestBody WishAdminUpdateDTO request
    ) {
        wishService.updateWishAsAdmin(wishId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{wishId}")
    public ResponseEntity<Void> deleteWish(@PathVariable Long wishId) {
        wishService.deleteWish(wishId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/settings")
    public ResponseEntity<Void> updateSettings(
            @Valid @RequestBody WishesSettingsUpdateDTO request
    ) {
        wishService.updateSettings(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/send/test")
    public ResponseEntity<WishSendResultDTO> sendTestEmails() {
        return ResponseEntity.ok(wishService.sendEmails(true));
    }

    @PostMapping("/send")
    public ResponseEntity<WishSendResultDTO> sendEmails() {
        return ResponseEntity.ok(wishService.sendEmails(false));
    }

    @GetMapping("/menu-state")
    public ResponseEntity<WishesMenuStateDTO> getMenuState() {
        return ResponseEntity.ok(wishService.getMenuState());
    }
}