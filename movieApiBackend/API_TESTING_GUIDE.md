# 🧪 API Testing Guide with Postman

## 📥 Import Postman Collection

1. **Download the collection**: `Postman_Collection.json`
2. **Open Postman** and click "Import"
3. **Upload the JSON file** or copy-paste the content
4. **Set up environment variables** (see below)

## 🔧 Setup Environment Variables

### Collection Variables
The collection automatically manages these variables:
- `base_url`: `http://localhost:7000/api/v1`
- `auth_token`: Automatically set after login/signup

## 🚀 Testing Sequence

### Step 1: Start Your Backend
```bash
cd movieApiBackend
npm start
```

### Step 2: Test Public Endpoints First
1. **Get All Categories** - Should return 4 categories
2. **Get All Movies** - Should return sample movies

### Step 3: Test Authentication
1. **User Signup** - Creates account and saves token
2. **User Login** - Authenticates and saves token

### Step 4: Test Protected Endpoints
1. **Get My Profile** - Should return user data
2. **Update Profile** - Modify user information
3. **Upload Movie** - Add new movie (requires image file)
4. **Rate Movie** - Rate a movie (1-5 stars)

## 📋 Test Data Examples

### User Registration
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "address": "123 Main St, New York"
}
```

### Movie Upload
```
title: "The Matrix"
description: "A computer hacker learns from mysterious rebels about the true nature of his reality."
category: "Action"
releaseDate: "1999-03-31"
image: [select image file]
```

### Rating a Movie
```json
{
  "rating": 5
}
```

## 🔍 Testing Different Scenarios

### 1. Search & Filter Movies
- **Category Filter**: `GET /movies?category=Action`
- **Search**: `GET /movies?search=action`
- **Sort by Rating**: `GET /movies?sort=rating`
- **Combined**: `GET /movies?category=Action&search=action&sort=rating`

### 2. Error Handling
- **Invalid Login**: Try wrong password
- **Missing Fields**: Submit incomplete data
- **Unauthorized**: Access protected routes without token
- **Invalid Rating**: Try rating > 5 or < 1

### 3. File Uploads
- **Profile Image**: Update user profile with image
- **Movie Image**: Upload new movie with poster

## ✅ Expected Responses

### Successful Responses
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Responses
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

## 🚨 Common Issues & Solutions

### 1. "Cannot connect to server"
- Check if backend is running on port 7000
- Verify MongoDB connection
- Check console for error messages

### 2. "Unauthorized" errors
- Run signup/login first to get token
- Check if token is properly set in collection variables
- Verify token format: `Bearer <token>`

### 3. "Validation failed" errors
- Check required fields (name, email, password)
- Ensure password confirmation matches
- Verify email format

### 4. "Category not found" errors
- Run the seed script first: `node dev-data/seed.js`
- Check if categories exist in database

## 📊 Testing Checklist

### Authentication
- [ ] User signup works
- [ ] User login works
- [ ] JWT token is received and saved
- [ ] Protected routes require authentication

### Categories
- [ ] Get all categories returns 4 categories
- [ ] Categories are: Action, Horror, Comedy, Animated

### Movies
- [ ] Get all movies works
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Sorting works (title, rating, date)
- [ ] Get single movie works
- [ ] Upload new movie works (with image)

### Ratings
- [ ] Rate a movie works (1-5 stars)
- [ ] Update existing rating works
- [ ] Get my rating works
- [ ] Get all ratings for a movie works

### User Profile
- [ ] Get profile works
- [ ] Update profile works
- [ ] Update profile with image works

### Error Handling
- [ ] Invalid data returns proper errors
- [ ] Missing authentication returns 401
- [ ] Invalid movie ID returns 404

## 🎯 Next Steps After Testing

Once all tests pass:

1. **Frontend Development**: Start building Next.js app
2. **API Integration**: Connect frontend to these endpoints
3. **UI/UX**: Create beautiful user interface
4. **Testing**: Add frontend tests
5. **Deployment**: Deploy both backend and frontend

## 🔗 Useful Links

- **Postman Documentation**: https://learning.postman.com/
- **API Documentation**: `API_DOCUMENTATION.md`
- **Backend README**: `README.md`
- **Environment Setup**: `env.example`

## 💡 Pro Tips

1. **Use Postman's "Tests" tab** to automate token saving
2. **Save responses** to use movie IDs in other requests
3. **Use environment variables** for different environments (dev/staging/prod)
4. **Test edge cases** like empty data, invalid formats
5. **Monitor network tab** in browser for debugging

Happy Testing! 🚀
