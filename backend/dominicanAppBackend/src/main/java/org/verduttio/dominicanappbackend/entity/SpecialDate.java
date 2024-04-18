package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "special_dates")
public class SpecialDate {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "special_date_id_generator")
    @SequenceGenerator(name="special_date_id_generator", sequenceName = "special_date_id_seq", allocationSize=1)
    private Long id;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private SpecialDateType type;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public SpecialDateType getType() {
        return type;
    }

    public void setType(SpecialDateType type) {
        this.type = type;
    }

    // Constructors
    public SpecialDate() {
    }

    public SpecialDate(LocalDate date, SpecialDateType type) {
        this.date = date;
        this.type = type;
    }
}
