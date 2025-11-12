package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Repo.FoodRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FoodService {
    @Autowired
    private FoodRepo foodRepo;

    public long count() {
       return  foodRepo.count();
    }

    public List<Food> getAllFoods() {
        return foodRepo.findAll();
    }

    public Food addOrUpdateProduct(Food food) {
        return foodRepo.save(food);
    }

    public Optional<Food> getFoodById(int foodId) {
        return foodRepo.findById(foodId);
    }

    public List<Food> searchFood(String keyword) {
        return foodRepo.searchFood(keyword);
    }

    public void deleteFood(int foodId) {
        foodRepo.deleteById(foodId);
        return;
    }
}
