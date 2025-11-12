package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepo extends JpaRepository<Food,Integer> {

    @Query("SELECT f FROM Food f WHERE " +
            "LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "CAST(f.price AS string) LIKE CONCAT('%', :keyword, '%')")
    List<Food> searchFood(@Param("keyword") String keyword);
}
