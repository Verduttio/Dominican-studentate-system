package org.verduttio.dominicanappbackend.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "special_events")
public class SpecialEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @OneToMany(mappedBy = "specialEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpecialEventComment> comments = new ArrayList<>();

    // Relacja dwukierunkowa, aby łatwo pobierać zadania eventu
    @OneToMany(mappedBy = "specialEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "special_event_collection_dates", joinColumns = @JoinColumn(name = "special_event_id"))
    @Column(name = "collection_date")
    private java.util.Set<LocalDate> collectionDates = new java.util.HashSet<>();

    public SpecialEvent() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public java.util.Set<LocalDate> getCollectionDates() { return collectionDates; }
    public void setCollectionDates(java.util.Set<LocalDate> collectionDates) { this.collectionDates = collectionDates; }
    public List<SpecialEventComment> getComments() { return comments; }
    public void setComments(List<SpecialEventComment> comments) { this.comments = comments; }
}