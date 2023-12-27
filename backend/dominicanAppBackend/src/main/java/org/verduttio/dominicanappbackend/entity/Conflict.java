package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Conflicts")
public class Conflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task1Id")
    private Task task1;

    @ManyToOne
    @JoinColumn(name = "task2Id")
    private Task task2;

    // Getters and setters

    // Constructors

    // Other methods
}

