package org.verduttio.dominicanappbackend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name="document_links")
public class DocumentLink {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "document_link_id_generator")
    @SequenceGenerator(name="document_link_id_generator", sequenceName = "document_link_id_seq", allocationSize=1)
    private Long id;

    @NotBlank(message="Title is mandatory")
    private String title;

    @NotBlank(message="URL is mandatory")
    private String url;

    @NotNull(message="Sort order is mandatory")
    private Long sortOrder;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Long getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Long sortOrder) {
        this.sortOrder = sortOrder;
    }

    public DocumentLink() {
    }

    public DocumentLink(String title, String url, Long sortOrder) {
        this.title = title;
        this.url = url;
        this.sortOrder = sortOrder;
    }
}
