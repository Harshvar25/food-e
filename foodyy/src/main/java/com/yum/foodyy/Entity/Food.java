package com.yum.foodyy.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"imageData"})
@EqualsAndHashCode(exclude = {"imageData"})
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000) // increased the length
    private String description;

    private BigDecimal price;

    @Column(nullable = false)
    @JsonProperty("isVeg") // we are telling Spring to look for isVeg when getting JSON file
    private boolean isVeg; // added this option

    @Column(columnDefinition = "TEXT")
    private String ingredients; // added ingredients option

    private Double calories ; // added this

    private Integer preparationTime; // added this

    @Enumerated(EnumType.STRING)
    private Spiceiness spiciness; // added this

    @Column(nullable = false)
    private boolean available = true; // and this

    @Enumerated(EnumType.STRING)
    private FoodCategory category;

    private String imageName;
    private String imageType;

    @Lob
    @Column(columnDefinition = "BYTEA")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] imageData;
}
