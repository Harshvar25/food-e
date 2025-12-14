package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Repo.CartItemRepo;
import com.yum.foodyy.Repo.FoodRepo;
import com.yum.foodyy.Repo.WishlistRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class FoodService {
    @Autowired
    private FoodRepo foodRepo;
    @Autowired
    private CartItemRepo cartItemRepo;
    @Autowired
    private WishlistRepo wishlistRepo;

    public long count() {
       return  foodRepo.count();
    }

    public List<Food> getAllFoods() {
        return foodRepo.findAll();
    }


    public Food addOrUpdateFood(Food food, MultipartFile imageFile) throws IOException {


        boolean isUpdate = Objects.nonNull(food.getId()) && food.getId() > 0;

        if (isUpdate) {
            if (imageFile != null && imageFile.isEmpty()) {

                Optional<Food> existingFoodOptional = foodRepo.findById(food.getId());

                if (existingFoodOptional.isPresent()) {
                    Food existingFood = existingFoodOptional.get();
                    food.setImageData(existingFood.getImageData());
                    food.setImageType(existingFood.getImageType());
                    food.setImageName(existingFood.getImageName());
                }

            } else {
                food.setImageName(imageFile.getOriginalFilename());
                food.setImageType(imageFile.getContentType());
                food.setImageData(imageFile.getBytes());
            }
        } else {
            food.setImageName(imageFile.getOriginalFilename());
            food.setImageType(imageFile.getContentType());
            food.setImageData(imageFile.getBytes());
        }

        return foodRepo.save(food);
    }
    public Optional<Food> getFoodById(int foodId) {
        return foodRepo.findById(foodId);
    }

    public List<Food> searchFood(String keyword) {
        return foodRepo.searchFood(keyword);
    }

    @Transactional
    public ResponseEntity<?> deleteFood(int foodId) {
        Optional<Food> food = foodRepo.findById(foodId);
        if (food.isPresent()) {
            cartItemRepo.deleteByFoodId(foodId);
            wishlistRepo.deleteByFood_Id(foodId);
            foodRepo.deleteById(foodId);
            return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Food not found", HttpStatus.NOT_FOUND);
    }
}
