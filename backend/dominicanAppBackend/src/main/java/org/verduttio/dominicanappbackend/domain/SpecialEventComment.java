package org.verduttio.dominicanappbackend.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "special_event_comments")
public class SpecialEventComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "special_event_id", nullable = false)
    private SpecialEvent specialEvent;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String roleName;

    // Relacja opcjonalna - jeśli null, to komentarz dotyczy całego dnia
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_section_id")
    private TaskSection taskSection;

    // Używamy TEXT, by pomieścić dłuższe notatki i tagi HTML (np. <b>)
    @Column(columnDefinition = "TEXT")
    private String content;

    public SpecialEventComment() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SpecialEvent getSpecialEvent() { return specialEvent; }
    public void setSpecialEvent(SpecialEvent specialEvent) { this.specialEvent = specialEvent; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public TaskSection getTaskSection() { return taskSection; }
    public void setTaskSection(TaskSection taskSection) { this.taskSection = taskSection; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}