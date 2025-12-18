const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://20225148:20225148@clusternguyen.rxwek35.mongodb.net/it4409?retryWrites=true&w=majority&appName=ClusterNguyen"
)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên không được để trống'],
    minlength: [2, 'Tên phải có ít nhất 2 ký tự']
  },
  age: {
    type: Number,
    required: [true, 'Tuổi không được để trống'],
    min: [0, 'Tuổi phải >= 0'],
    validate: {
      validator: Number.isInteger,
      message: 'Tuổi phải là số nguyên'
    }
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    unique: true
  },
  address: {
    type: String
  }
});


const User = mongoose.model("User", UserSchema);

app.post("/api/users", async (req, res) => {
  try {
    
    const newUser = await User.create(req.body);

    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: newUser
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.email) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const filter = search
      ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } }
        ]
      }
      : {};
    // Tính skip 
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    return res.json({
      page,
      limit,
      total,
      totalPages,
      data: users
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


app.put("/api/users/:_id", async (req, res) => {
  try {

    const updated = await User.findByIdAndUpdate(
      req.params._id,
      req.body,
      { new: true, runValidators: true } // quan trong 
    );
    if (!updated) return res.status(404).json({ error: "Không tìm thấy người dùng" });
    return res.json({
      message : "Cập nhật người dùng thành công",
      data : updated
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete("/api/users/:_id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params._id);
    if (!deleted) return res.status(404).json({ error: "Không tìm thấy người dùng" });
    return res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    return res.status(400).json({error: err.message});
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
