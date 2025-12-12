package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping({"/admin/foods" , "/customer/foods"})
    public ResponseEntity<List<Food>> getFoods(){
        List<Food> foods = foodService.getAllFoods();
        return ResponseEntity.ok(foods);
    }

    @GetMapping({"/admin/food/{foodId}", "/customer/food/{foodId}"})
    public ResponseEntity<?> getFood(@PathVariable int foodId){
        Optional<Food> food = foodService.getFoodById(foodId);

        if (food.isPresent()) {
            return ResponseEntity.ok(food.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Food item not found");
        }
    }

    @GetMapping({"/admin/food/{foodId}/image", "/customer/food/{foodId}/image"})
    public ResponseEntity<byte[]> getImageByFoodId(@PathVariable int foodId){
        Optional<Food> food = foodService.getFoodById(foodId);
        return ResponseEntity.ok(food.get().getImageData());
    }

    @GetMapping({"admin/foods/search" , "customer/foods/search"})
    public ResponseEntity<List<Food>> searchFood(@RequestParam String keyword){
        List<Food> foods = foodService.searchFood(keyword);
        return ResponseEntity.ok(foods);
    }

    @PostMapping("admin/food")
    public ResponseEntity<?> addFood(@RequestPart Food food, @RequestPart MultipartFile imageFile){

        try {
            Food food1 = foodService.addOrUpdateFood(food,imageFile);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "Food added successfully", "data", food1));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @PutMapping("admin/food/{foodId}")
    public ResponseEntity<?> updateFood(
            @PathVariable int foodId,
            @RequestPart Food food,
            @RequestPart MultipartFile imageFile) throws IOException {

        Optional<Food> existing = foodService.getFoodById(foodId);

        if(existing.isEmpty()){
            return new ResponseEntity<>("Food not found", HttpStatus.NOT_FOUND);
        }
        food.setId(foodId);
        Food updatedFood = foodService.addOrUpdateFood(food,imageFile);
        return ResponseEntity.ok(updatedFood);
    }

    @DeleteMapping("admin/food/{foodId}")
    public ResponseEntity<?> deleteFood(@PathVariable int foodId){
        return foodService.deleteFood(foodId);
    }


}
