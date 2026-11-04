package org.verduttio.dominicanappbackend.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "global_settings")
public class GlobalSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", unique = true, nullable = false, length = 50)
    private String key;

    @Column(name = "setting_value", nullable = false, length = 255)
    private String value;

    public GlobalSettings() {
    }

    public GlobalSettings(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public Long getId() { return id; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}