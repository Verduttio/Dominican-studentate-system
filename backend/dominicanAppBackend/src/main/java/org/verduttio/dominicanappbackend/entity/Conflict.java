package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "conflicts")
public class Conflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task1_id")
    private Task task1;

    @ManyToOne
    @JoinColumn(name = "task2_id")
    private Task task2;

    // Getters and setters

    // Constructors

    // Other methods
}

