import * as React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton'; 
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box'; 


export default function FoodCard({ item, onEdit, onDelete }) {
    
    const imgSrc = item.imageData 
      ? `data:${item.imageType};base64,${item.imageData}`
      : null;
      
    const priceDisplay = `$${item.price ? item.price.toFixed(2) : '0.00'}`;

    // Dummy tags for demonstration, replace with actual item tags if available
    const demoTags = [item.category]; 

    return (
      // 1. Set fixed width, fixed height, and enable vertical flex layout
      <Card 
          sx={{ 
              width: 300, 
              height: 450, // Fixed height for consistent card size
              m: 2, 
              borderRadius: '25px', 
              backgroundColor: '#E0EED4',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex', // Enable flex on card
              flexDirection: 'column', // Stack contents vertically
          }}
      >
          
          <Box 
              sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: '#e0eed4', // Slightly less transparent for price
                  borderRadius: '15px',
                  padding: '5px 10px',
                  color: '#333',
                  fontWeight: 'bold',
                  zIndex: 10,
                  fontSize: '1.2rem'
              }}
          >
              {priceDisplay}
          </Box>

          
          <Box
              sx={{
                  backgroundColor: '#e0eed4',
                  p: '10px',
                  borderRadius: '20px',
                  m: '10px',
                  position: 'relative',
                  overflow: 'hidden',
              }}
          >
              {imgSrc ? (
                  <CardMedia
                      component="img"
                      height="200" // Image height remains fixed
                      image={imgSrc}
                      alt={item.name}
                      sx={{ 
                          objectFit: 'cover',
                          borderRadius: '10px',
                      }}
                  />
              ) : (
                  <Box 
                      sx={{ 
                          height: 200, 
                          backgroundColor: '#f0ffef',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderRadius: '10px', 
                      }}
                  >
                      <Typography variant="subtitle1" color="text.secondary">No Image</Typography>
                  </Box>
              )}
          
          </Box>
          
          
          <CardContent 
              sx={{ 
                  pt: 1, 
                  pb: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  flexGrow: 1, // Allows content box to expand and fill space
                  justifyContent: 'space-between' // Pushes bottom elements down
              }}
          >
              <Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: '#333', display: 'inline-block' }}>
                      {item.name}
                  </Typography>
                  
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                      {demoTags.map(tag => (
                          <span key={tag} className="food-tag">{tag}</span>
                      ))}
                  </Box>
              </Box>

              
              {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ddd', pt: 1 }}> */}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ddd', pt: 1 }}>
                      <IconButton aria-label="edit food item" size="small" onClick={() => onEdit(item)}>
                          <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton aria-label="delete food item" size="small" onClick={() => onDelete(item.id)}>
                          <DeleteIcon color="error" fontSize="small" />
                      </IconButton>
                  </Box>
                  
                  
                  {/* <a href="#" className="order-link">
                      Order Now &gt;
                  </a> */}
              {/* </Box> */}

          </CardContent>
          
      </Card>
    );
}