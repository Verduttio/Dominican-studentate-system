package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.domain.SpecialEventComment;
import org.verduttio.dominicanappbackend.domain.TaskSection;
import org.verduttio.dominicanappbackend.repository.SpecialEventCommentRepository;
import org.verduttio.dominicanappbackend.repository.SpecialEventRepository;
import org.verduttio.dominicanappbackend.repository.TaskSectionRepository;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/special-events/{eventId}/comments")
public class SpecialEventCommentController {

    private final SpecialEventCommentRepository commentRepository;
    private final SpecialEventRepository specialEventRepository;
    private final TaskSectionRepository taskSectionRepository;

    @Autowired
    public SpecialEventCommentController(SpecialEventCommentRepository commentRepository, SpecialEventRepository specialEventRepository, TaskSectionRepository taskSectionRepository) {
        this.commentRepository = commentRepository;
        this.specialEventRepository = specialEventRepository;
        this.taskSectionRepository = taskSectionRepository;
    }

    // Klasa DTO (zamiast rekordu)
    public static class CommentRequest {
        private String content;
        public CommentRequest() {}
        public CommentRequest(String content) { this.content = content; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    @GetMapping
    public ResponseEntity<CommentRequest> getComment(
            @PathVariable Long eventId,
            @RequestParam String roleName,
            @RequestParam String date,
            @RequestParam(required = false) Long sectionId) {

        LocalDate localDate = LocalDate.parse(date);
        Optional<SpecialEventComment> comment;

        if (sectionId != null) {
            TaskSection section = taskSectionRepository.findById(sectionId).orElseThrow();
            comment = commentRepository.findBySpecialEventIdAndRoleNameAndDateAndTaskSection(eventId, roleName, localDate, section);
        } else {
            comment = commentRepository.findBySpecialEventIdAndRoleNameAndDateAndTaskSectionIsNull(eventId, roleName, localDate);
        }

        return comment.map(c -> ResponseEntity.ok(new CommentRequest(c.getContent())))
                .orElseGet(() -> ResponseEntity.ok(new CommentRequest("")));
    }

    @PostMapping
    public ResponseEntity<Void> saveComment(
            @PathVariable Long eventId,
            @RequestParam String roleName,
            @RequestParam String date,
            @RequestParam(required = false) Long sectionId,
            @RequestBody CommentRequest request) {

        LocalDate localDate = LocalDate.parse(date);
        Optional<SpecialEventComment> existingComment;
        TaskSection section = null;

        if (sectionId != null) {
            section = taskSectionRepository.findById(sectionId).orElseThrow();
            existingComment = commentRepository.findBySpecialEventIdAndRoleNameAndDateAndTaskSection(eventId, roleName, localDate, section);
        } else {
            existingComment = commentRepository.findBySpecialEventIdAndRoleNameAndDateAndTaskSectionIsNull(eventId, roleName, localDate);
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            existingComment.ifPresent(commentRepository::delete);
            return ResponseEntity.ok().build();
        }

        SpecialEventComment comment = existingComment.orElse(new SpecialEventComment());
        comment.setSpecialEvent(specialEventRepository.findById(eventId).orElseThrow());
        comment.setDate(localDate);
        comment.setRoleName(roleName);
        comment.setTaskSection(section);
        comment.setContent(request.getContent());

        commentRepository.save(comment);

        return ResponseEntity.ok().build();
    }
}